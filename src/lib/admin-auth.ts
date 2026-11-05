import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
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

  // 2. If Supabase is configured, try Supabase auth
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      return error?.message ?? null;
    } catch (err: any) {
      return err?.message || "Sign in failed";
    }
  }

  // 3. Local dev fallback (offline / Hostinger local preview)
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

  // 2. If Supabase is configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/login`,
          data: { full_name: fullName },
        },
      });
      if (error) return error.message;

      if (data.session && data.user) {
        await supabase
          .from("profiles")
          .upsert({ id: data.user.id, email: cleanEmail, full_name: fullName });
      }
      return null;
    } catch (err: any) {
      return err?.message || "Sign up failed";
    }
  }

  // 3. Local fallback
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
  if (isSupabaseConfigured()) {
    try {
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  // 1. Try Hostinger session / local session
  const local = getLocalSession();
  if (local) return local;

  // 2. If Supabase is configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        return {
          userId: data.user.id,
          email: data.user.email ?? "",
          isAdmin: true,
        };
      }
    } catch {
      /* ignore */
    }
  }

  return null;
}

export async function requestPasswordReset(email: string) {
  if (!isSupabaseConfigured()) {
    return null;
  }
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return error?.message ?? null;
  } catch {
    return null;
  }
}

export async function updatePassword(password: string) {
  if (!isSupabaseConfigured()) {
    return null;
  }
  try {
    const { error } = await supabase.auth.updateUser({ password });
    return error?.message ?? null;
  } catch {
    return null;
  }
}
