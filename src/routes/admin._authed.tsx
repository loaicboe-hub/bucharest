import { useEffect } from "react";
import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { apiAuth } from "@/lib/hostinger-api";
import { signOut } from "@/lib/admin-auth";
import { toast } from "sonner";
import { Check, ChevronDown, Languages } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getAdminSession } from "@/lib/admin-auth";
import { ADMIN_LANG_OPTIONS, useAdminLang } from "@/lib/admin-i18n";
import { moduleKeyFromPath } from "@/lib/admin-modules";
import {
  PermissionsProvider,
  fetchPermissions,
  isSuperAdmin,
  type PermissionMap,
} from "@/lib/admin-permissions";

export const Route = createFileRoute("/admin/_authed")({
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") {
      return { session: { userId: "local-dev-admin", email: "admin@bucharestegyagro.com", isAdmin: true }, isSuper: true, permissions: {} };
    }
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
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const h = window.location.hostname;
    if (h === "localhost" || h === "127.0.0.1") return;

    apiAuth.me().catch(async () => {
      await signOut();
      toast.error("Admin session expired. Please sign in again.");
      navigate({ to: "/admin/login" });
    });
  }, [navigate]);

  const activeLang = ADMIN_LANG_OPTIONS.find((o) => o.code === lang) ?? ADMIN_LANG_OPTIONS[0];

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    title={t("language")}
                    aria-label={t("language")}
                  >
                    <Languages className="h-4 w-4" />
                    <span>{activeLang.label}</span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={dir === "rtl" ? "start" : "end"} className="min-w-[170px]">
                  {ADMIN_LANG_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                      key={opt.code}
                      onClick={() => setLang(opt.code)}
                      className="flex cursor-pointer items-center justify-between gap-3"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-5 text-[11px] font-semibold uppercase text-muted-foreground">
                          {opt.short}
                        </span>
                        <span>{opt.label}</span>
                      </span>
                      {lang === opt.code ? <Check className="h-4 w-4 text-primary" /> : null}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
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
