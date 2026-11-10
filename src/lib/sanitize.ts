/**
 * Frontend URL & Rich-HTML Sanitizers (Defense-in-depth against XSS & malicious links)
 */

export function sanitizeUrl(raw: string | null | undefined, allowRelative = true): string {
  if (!raw) return "";
  // Remove whitespace & ASCII control characters to prevent java\tscript: bypasses
  const clean = raw.replace(/[\u0000-\u0020\u007F]+/g, "").trim();
  if (!clean) return "";

  if (clean.startsWith("#")) return clean;
  if (allowRelative && clean.startsWith("/") && !clean.startsWith("//")) return clean;

  try {
    const parsed = new URL(clean, "https://bucharestegyagro.com");
    const scheme = parsed.protocol.toLowerCase();
    if (scheme === "http:" || scheme === "https:" || scheme === "mailto:" || scheme === "tel:") {
      return clean;
    }
  } catch {
    return "";
  }
  return "";
}

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "b",
  "strong",
  "i",
  "em",
  "u",
  "s",
  "strike",
  "del",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "hr",
  "span",
  "div",
  "a",
  "img",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
]);

const DROP_TAGS = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "applet",
  "svg",
  "math",
  "form",
  "input",
  "button",
  "textarea",
  "select",
  "option",
  "meta",
  "link",
  "base",
]);

/**
 * Strips script/iframe/object/event-handler/unsafe-URL vectors from HTML content.
 */
export function sanitizeRichHtml(html: string | null | undefined): string {
  if (!html) return "";
  const input = String(html);

  if (typeof window !== "undefined" && typeof DOMParser !== "undefined") {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<div>${input}</div>`, "text/html");
      const root = doc.body.firstElementChild;
      if (!root) return "";

      const walk = (parent: Element) => {
        const children = Array.from(parent.childNodes);
        for (const child of children) {
          if (child.nodeType === Node.COMMENT_NODE) {
            parent.removeChild(child);
            continue;
          }
          if (child.nodeType === Node.ELEMENT_NODE) {
            const el = child as Element;
            const tag = el.tagName.toLowerCase();

            if (DROP_TAGS.has(tag)) {
              parent.removeChild(el);
              continue;
            }

            if (!ALLOWED_TAGS.has(tag)) {
              walk(el);
              while (el.firstChild) {
                parent.insertBefore(el.firstChild, el);
              }
              parent.removeChild(el);
              continue;
            }

            for (const attr of Array.from(el.attributes)) {
              const name = attr.name.toLowerCase();
              const allowedForTag =
                tag === "a"
                  ? ["href", "title", "target", "rel"]
                  : tag === "img"
                    ? ["src", "alt", "title", "width", "height"]
                    : [];

              if (!allowedForTag.includes(name)) {
                el.removeAttribute(attr.name);
              }
            }

            if (tag === "a" && el.hasAttribute("href")) {
              const safeHref = sanitizeUrl(el.getAttribute("href"), true);
              if (!safeHref) el.removeAttribute("href");
              else el.setAttribute("href", safeHref);

              if (el.getAttribute("target")?.toLowerCase() === "_blank") {
                el.setAttribute("rel", "noopener noreferrer");
              } else {
                el.removeAttribute("target");
              }
            }

            if (tag === "img" && el.hasAttribute("src")) {
              const safeSrc = sanitizeUrl(el.getAttribute("src"), true);
              if (!safeSrc) {
                parent.removeChild(el);
                continue;
              }
              el.setAttribute("src", safeSrc);
            }

            walk(el);
          }
        }
      };

      walk(root);
      return root.innerHTML;
    } catch {
      // fall through to SSR regex fallback
    }
  }

  // Safe SSR fallback sanitizer
  return input
    .replace(/<(script|style|iframe|object|embed|applet|svg|math|form|meta|link|base)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|style|iframe|object|embed|applet|svg|math|form|meta|link|base)\b[^>]*\/?>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["'])\s*(?:javascript|vbscript|data:text\/html)[^"']*\2/gi, '$1=""');
}

