// ⚠️ Placeholder client-side auth for UI scaffolding only.
// Replace with Lovable Cloud (Supabase) auth + user_roles table before production.
// Do NOT rely on this for real access control — it is trivially bypassable.

const KEY = "fd_admin_auth";
const DEMO_USER = "admin";
const DEMO_PASS = "admin123";

export function login(username: string, password: string): boolean {
  if (username === DEMO_USER && password === DEMO_PASS) {
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify({ username, at: Date.now() }));
    }
    return true;
  }
  return false;
}

export function logout() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(KEY);
}

export function getUser(): { username: string } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const DEMO_CREDENTIALS = { username: DEMO_USER, password: DEMO_PASS };
