import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertSuperAdmin(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.rpc("is_super_admin", { _user_id: context.userId });
  if (!data) throw new Error("Forbidden: super admin only");
}

export const createAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string; password: string; fullName: string; superAdmin?: boolean }) => {
    const email = String(input.email ?? "").trim().toLowerCase();
    const password = String(input.password ?? "");
    if (!email.includes("@")) throw new Error("A valid email is required");
    if (password.length < 10) throw new Error("Password must be at least 10 characters");
    return { email, password, fullName: String(input.fullName ?? "").trim(), superAdmin: Boolean(input.superAdmin) };
  })
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName },
    });
    if (error || !created.user) throw new Error(error?.message ?? "Could not create the user");

    const userId = created.user.id;
    await supabaseAdmin.from("profiles").upsert({ id: userId, email: data.email, full_name: data.fullName });
    const roles: { user_id: string; role: "admin" | "super_admin" }[] = [{ user_id: userId, role: "admin" }];
    if (data.superAdmin) roles.push({ user_id: userId, role: "super_admin" });
    await supabaseAdmin.from("user_roles").upsert(roles, { onConflict: "user_id,role" });

    return { id: userId };
  });

export const deleteAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string }) => ({ userId: String(input.userId) }))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    if (data.userId === context.userId) throw new Error("You cannot delete your own account");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setAdminUserPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; password: string }) => {
    const password = String(input.password ?? "");
    if (password.length < 10) throw new Error("Password must be at least 10 characters");
    return { userId: String(input.userId), password };
  })
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, { password: data.password });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setSuperAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; value: boolean }) => ({
    userId: String(input.userId),
    value: Boolean(input.value),
  }))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    if (data.userId === context.userId && !data.value) throw new Error("You cannot remove your own super admin access");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.value) {
      await supabaseAdmin
        .from("user_roles")
        .upsert([{ user_id: data.userId, role: "super_admin" }], { onConflict: "user_id,role" });
    } else {
      await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId).eq("role", "super_admin");
    }
    return { ok: true };
  });
