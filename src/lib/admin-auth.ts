// Admin authentication backed by Lovable Cloud (auth + user_roles table).
// Access control is enforced server-side by RLS policies and the has_role() function.

import { supabase } from "@/integrations/supabase/client";

export type AdminSession = {
  userId: string;
  email: string;
  isAdmin: boolean;
};

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error?.message ?? null;
}

export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
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
      .upsert({ id: data.user.id, email, full_name: fullName });
    // Grants admin only when no admin exists yet (one-time bootstrap).
    await supabase.rpc("claim_first_admin");
  }
  return null;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const { data: isAdmin } = await supabase.rpc("has_role", {
    _user_id: data.user.id,
    _role: "admin",
  });

  return {
    userId: data.user.id,
    email: data.user.email ?? "",
    isAdmin: Boolean(isAdmin),
  };
}
