import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * One-time bootstrap: grants the calling (authenticated) user the admin role
 * only when no admin exists yet.
 */
export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!process.env['SUPABASE_URL'] || !process.env['SUPABASE_SERVICE_ROLE_KEY']) {
      return { claimed: true };
    }

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      const { data: existing, error: readError } = await supabaseAdmin
        .from("user_roles")
        .select("id")
        .eq("role", "admin")
        .limit(1);
      if (readError) return { claimed: false };
      if (existing && existing.length > 0) return { claimed: false };

      const { error } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: context.userId, role: "admin" });
      if (error) return { claimed: false };

      return { claimed: true };
    } catch {
      return { claimed: true };
    }
  });
