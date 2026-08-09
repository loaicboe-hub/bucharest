import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Languages } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getAdminSession } from "@/lib/admin-auth";
import { useAdminLang } from "@/lib/admin-i18n";
import { moduleKeyFromPath } from "@/lib/admin-modules";
import {
  PermissionsProvider,
  fetchPermissions,
  isSuperAdmin,
  type PermissionMap,
} from "@/lib/admin-permissions";

export const Route = createFileRoute("/admin/_authed")({
  beforeLoad: async ({ location }) => {
    const session = await getAdminSession();
    if (!session) throw redirect({ to: "/admin/login" });
    if (!session.isAdmin) throw redirect({ to: "/admin/login", search: { denied: true } });

    const isSuper = await isSuperAdmin(session.userId);
    const permissions: PermissionMap = isSuper ? {} : await fetchPermissions(session.userId);

    if (!isSuper) {
      const moduleKey = moduleKeyFromPath(location.pathname);
      const allowed = Object.values(permissions).filter((p) => p.can_view);
      if (moduleKey && moduleKey !== "" && !permissions[moduleKey]?.can_view) {
        const first = allowed[0];
        if (!first) throw redirect({ to: "/admin/login", search: { denied: true } });
        throw redirect({ href: `/admin/${first.module_key}` });
      }
    }

    return { session, isSuper, permissions };
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const { session, isSuper, permissions } = Route.useRouteContext();
  const { t, lang, setLang, dir } = useAdminLang();
  return (
    <PermissionsProvider value={{ isSuper, permissions }}>
    <SidebarProvider>
      <div dir={dir} className="flex min-h-screen w-full bg-slate-50">
        <AdminSidebar />

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="text-sm font-medium text-muted-foreground">{t("adminPanel")}</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setLang(lang === "ar" ? "en" : "ar")}
                title={t("language")}
              >
                <Languages className="h-4 w-4" />
                {lang === "ar" ? "English" : "العربية"}
              </Button>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {t("signedInAs")} <span className="font-medium text-foreground">{session.email}</span>
              </span>
            </div>
          </header>
          <main className="admin-scope flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
    </PermissionsProvider>
  );

}
