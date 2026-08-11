import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * One-time bootstrap: grants the calling (authenticated) user the admin role
 * only when no admin exists yet. Runs server-side with the service role so the
 * SECURITY DEFINER SQL helper does not need to be callable by signed-in users.
 */
export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing, error: readError } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("role", "admin")
      .limit(1);
    if (readError) throw new Error("Could not verify admin setup");
    if (existing && existing.length > 0) return { claimed: false };

    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (error) throw new Error("Could not complete admin setup");

    return { claimed: true };
  });
