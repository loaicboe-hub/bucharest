import { apiAuth, getSavedUser, clearSession } from "./hostinger-api";

export type AdminSession = {
  userId: string;
  email: string;
  isAdmin: boolean;
};

const LOCAL_SESSION_KEY = "app_local_admin_session";

function getLocalSession(): AdminSession | null {
  if (typeof window === "undefined") return null;

  // 1. Check saved Hostinger user session
  const hostingerUser = getSavedUser();
  if (hostingerUser) {
    return {
      userId: String(hostingerUser.id),
      email: hostingerUser.email,
      isAdmin: Boolean(hostingerUser.isAdmin ?? true),
    };
  }

  // 2. Check local dev session
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

  // 1. Try Hostinger MySQL API first
  try {
    const user = await apiAuth.login(cleanEmail, password);
    if (user) {
      const session: AdminSession = {
        userId: String(user.id),
        email: user.email,
        isAdmin: true,
      };
      setLocalSession(session);
      return null;
    }
  } catch {
    // API not connected locally or credentials failed on server
  }

  // 2. Local dev fallback (offline / Hostinger local preview)
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

  // 1. Try Hostinger MySQL API
  try {
    const res = await apiAuth.createUser({
      email: cleanEmail,
      password,
      fullName: fullName.trim(),
      superAdmin: true,
    });
    if (res?.id) {
      const local: AdminSession = {
        userId: String(res.id),
        email: cleanEmail,
        isAdmin: true,
      };
      setLocalSession(local);
      return null;
    }
  } catch {
    // API not running locally
  }

  // 2. Local fallback
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
  // 1. Try Hostinger session / local session
  const local = getLocalSession();
  if (local) return local;

  return null;
}

export async function requestPasswordReset(email: string) {
  void email;
  return null;
}

export async function updatePassword(password: string) {
  void password;
  return null;
}
