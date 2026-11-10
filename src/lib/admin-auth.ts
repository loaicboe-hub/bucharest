import { apiAuth, getSavedUser, getSavedToken, clearSession } from "./hostinger-api";

export type AdminSession = {
  userId: string;
  email: string;
  isAdmin: boolean;
};

const LOCAL_SESSION_KEY = "app_local_admin_session";

function isLocalPreviewHost(): boolean {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1";
}

function isTokenValidLocally(token: string | null): boolean {
  if (!token) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    if (payload?.exp && payload.exp * 1000 < Date.now()) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function getLocalSession(): AdminSession | null {
  if (typeof window === "undefined") return null;

  const token = getSavedToken();
  const hostingerUser = getSavedUser();

  // Require a valid non-expired JWT token + saved user on production
  if (token && isTokenValidLocally(token) && hostingerUser) {
    return {
      userId: String(hostingerUser.id),
      email: hostingerUser.email,
      isAdmin: Boolean(hostingerUser.isAdmin ?? true),
    };
  }

  // On live domain, NEVER trust a stale session without a real JWT token
  if (!isLocalPreviewHost()) {
    clearSession();
    setLocalSession(null);
    return null;
  }

  // Local dev fallback only when running on localhost
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setLocalSession(session: AdminSession | null) {
  if (typeof window === "undefined") return;
  try {
    if (session) {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    }
  } catch {
    /* ignore */
  }
}

export async function signIn(email: string, password: string): Promise<string | null> {
  const cleanEmail = email.trim().toLowerCase();

  try {
    const user = await apiAuth.login(cleanEmail, password);
    if (user) {
      const session: AdminSession = {
        userId: String(user.id),
        email: user.email,
        isAdmin: Boolean(user.isAdmin ?? true),
      };
      setLocalSession(session);
      return null;
    }
  } catch (err: any) {
    // On live domain, NEVER silently bypass login or fake a session!
    if (!isLocalPreviewHost()) {
      clearSession();
      setLocalSession(null);
      return err?.message || "Invalid email or password";
    }
    if (err?.message && /invalid|password|credentials|required|unauthorized/i.test(err.message)) {
      return err.message;
    }
  }

  if (!isLocalPreviewHost()) {
    clearSession();
    setLocalSession(null);
    return "Authentication failed. Please check your email and password.";
  }

  // Localhost offline dev preview fallback only (when PHP backend isn't running)
  const local: AdminSession = {
    userId: "admin-1",
    email: cleanEmail || "admin@bucharestegyagro.com",
    isAdmin: true,
  };
  setLocalSession(local);
  return null;
}

export async function signUp(email: string, password: string, fullName: string): Promise<string | null> {
  const cleanEmail = email.trim().toLowerCase();

  try {
    const res = await apiAuth.createUser({
      email: cleanEmail,
      password,
      fullName: fullName.trim(),
      superAdmin: true,
    });
    if (res?.id) {
      return signIn(cleanEmail, password);
    }
  } catch (err: any) {
    if (!isLocalPreviewHost()) {
      return err?.message || "Account creation requires an active super admin login.";
    }
  }

  if (!isLocalPreviewHost()) {
    return "Unable to create account.";
  }

  const local: AdminSession = {
    userId: "admin-1",
    email: cleanEmail || "admin@bucharestegyagro.com",
    isAdmin: true,
  };
  setLocalSession(local);
  return null;
}

export async function signOut() {
  clearSession();
  setLocalSession(null);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  return getLocalSession();
}

export async function requestPasswordReset(email: string) {
  void email;
  return null;
}

export async function updatePassword(password: string) {
  void password;
  return null;
}
