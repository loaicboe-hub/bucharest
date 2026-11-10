import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

type RateBucket = {
  timestamps: number[];
  violations: number;
  blockedUntil: number;
};

const RATE_WINDOW_MS = 60_000;
const DYNAMIC_LIMIT_PER_MIN = 120;
const ASSET_LIMIT_PER_MIN = 400;
const MAX_TRACKED_IPS = 5_000;
const MAX_SSR_BODY_BYTES = 1_048_576;
const MAX_URL_LENGTH = 4_096;

const rateBuckets = new Map<string, RateBucket>();
let lastSweepAt = Date.now();

const ALWAYS_BAD_PATH_PATTERNS = [
  /\/\.(?:env|git|htaccess|htpasswd)/i,
  /\/(?:database\.sql|composer\.(?:json|lock)|package(?:-lock)?\.json)/i,
  /\.\.[/\\]/,
  /\0|%00/i,
  /\.(?:sql|bak|old|sh)$/i,
];

const NON_API_BAD_PATH_PATTERNS = [
  /\/(?:wp-login\.php|wp-admin|xmlrpc\.php)/i,
  /\.(?:php\d?|phtml)$/i,
];

const BAD_UA_PATTERN = /(sqlmap|nikto|nmap|nessus|acunetix|havij|masscan|zgrab|gobuster|dirbuster|wfuzz|hydra|libwww-perl)/i;

function getClientIp(request: Request): string {
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();

  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();

  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }

  return "unknown";
}

function sweepStaleBuckets(now: number) {
  if (now - lastSweepAt < 30_000 && rateBuckets.size < MAX_TRACKED_IPS) return;
  lastSweepAt = now;

  for (const [key, bucket] of rateBuckets.entries()) {
    const recent = bucket.timestamps.some((t) => now - t < RATE_WINDOW_MS);
    if (!recent && bucket.blockedUntil < now) {
      rateBuckets.delete(key);
    }
  }

  // Hard cap to guarantee bounded memory under spoofed-IP DDoS
  while (rateBuckets.size > MAX_TRACKED_IPS) {
    const oldestKey = rateBuckets.keys().next().value;
    if (!oldestKey) break;
    rateBuckets.delete(oldestKey);
  }
}

function checkSsrRateLimit(key: string, limit: number, now: number): { allowed: boolean; retryAfter: number; remaining: number } {
  sweepStaleBuckets(now);

  let bucket = rateBuckets.get(key);
  if (!bucket) {
    bucket = { timestamps: [], violations: 0, blockedUntil: 0 };
  }

  if (bucket.blockedUntil > now) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((bucket.blockedUntil - now) / 1000)),
      remaining: 0,
    };
  }

  bucket.timestamps = bucket.timestamps.filter((t) => now - t < RATE_WINDOW_MS);

  if (bucket.timestamps.length >= limit) {
    bucket.violations += 1;
    const oldest = bucket.timestamps[0] ?? now;
    const retryAfter = Math.max(1, Math.ceil((oldest + RATE_WINDOW_MS - now) / 1000));
    if (bucket.violations >= 8) {
      bucket.blockedUntil = now + 5 * 60_000;
    }
    rateBuckets.delete(key);
    rateBuckets.set(key, bucket);
    return { allowed: false, retryAfter, remaining: 0 };
  }

  bucket.timestamps.push(now);
  // Refresh insertion order for LRU behavior
  rateBuckets.delete(key);
  rateBuckets.set(key, bucket);

  return {
    allowed: true,
    retryAfter: 0,
    remaining: Math.max(0, limit - bucket.timestamps.length),
  };
}

function withSecurityHeaders(response: Response, request: Request, rateMeta?: { limit: number; remaining: number }): Response {
  const headers = new Headers(response.headers);
  const url = new URL(request.url);
  const proto = request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
  const isHttps = proto === "https";
  const isProd = process.env.NODE_ENV === "production";

  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "SAMEORIGIN");
  headers.set("X-XSS-Protection", "1; mode=block");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set("Cross-Origin-Opener-Policy", "same-origin");

  if (isHttps) {
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: https:",
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
    isProd ? "connect-src 'self'" : "connect-src 'self' ws: wss:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    ...(isHttps ? ["upgrade-insecure-requests"] : []),
  ];
  headers.set("Content-Security-Policy", cspDirectives.join("; "));

  if (rateMeta) {
    headers.set("X-RateLimit-Limit", String(rateMeta.limit));
    headers.set("X-RateLimit-Remaining", String(rateMeta.remaining));
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const urlStr = request.url;
    if (urlStr.length > MAX_URL_LENGTH) {
      return withSecurityHeaders(new Response("URI Too Long", { status: 414 }), request);
    }

    const ua = request.headers.get("user-agent") ?? "";
    if (ua && BAD_UA_PATTERN.test(ua)) {
      return withSecurityHeaders(new Response("Forbidden", { status: 403 }), request);
    }

    const url = new URL(urlStr);
    const decodedPathAndQuery = (() => {
      try {
        return decodeURIComponent(url.pathname + url.search);
      } catch {
        return url.pathname + url.search;
      }
    })();

    if (
      ALWAYS_BAD_PATH_PATTERNS.some((p) => p.test(decodedPathAndQuery)) ||
      (!url.pathname.startsWith("/api/") && NON_API_BAD_PATH_PATTERNS.some((p) => p.test(decodedPathAndQuery)))
    ) {
      return withSecurityHeaders(new Response("Forbidden", { status: 403 }), request);
    }

    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (Number.isFinite(contentLength) && contentLength > MAX_SSR_BODY_BYTES && !url.pathname.startsWith("/api/")) {
      return withSecurityHeaders(new Response("Payload Too Large", { status: 413 }), request);
    }

    const isStaticAsset = url.pathname.startsWith("/assets/") || /\.(?:png|jpg|jpeg|webp|gif|ico|css|js|woff2?)$/i.test(url.pathname);
    const ip = getClientIp(request);
    const limit = isStaticAsset ? ASSET_LIMIT_PER_MIN : DYNAMIC_LIMIT_PER_MIN;
    const rateCheck = checkSsrRateLimit(`${isStaticAsset ? "asset" : "ssr"}:${ip}`, limit, Date.now());

    if (!rateCheck.allowed) {
      return withSecurityHeaders(
        new Response("Too Many Requests — Please slow down and try again shortly.", {
          status: 429,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Retry-After": String(rateCheck.retryAfter),
          },
        }),
        request,
        { limit, remaining: 0 },
      );
    }

    try {
      const handler = await getServerEntry();
      const rawResponse = await handler.fetch(request, env, ctx);
      const response = await normalizeCatastrophicSsrResponse(rawResponse);
      return withSecurityHeaders(response, request, { limit, remaining: rateCheck.remaining });
    } catch (error) {
      console.error(error);
      return withSecurityHeaders(
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
        request,
        { limit, remaining: rateCheck.remaining },
      );
    }
  },
};
