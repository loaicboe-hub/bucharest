import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Languages } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getAdminSession } from "@/lib/admin-auth";
import { useAdminLang } from "@/lib/admin-i18n";

export const Route = createFileRoute("/admin/_authed")({
  beforeLoad: async () => {
    const session = await getAdminSession();
    if (!session) throw redirect({ to: "/admin/login" });
    if (!session.isAdmin) throw redirect({ to: "/admin/login", search: { denied: true } });
    return { session };
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const { session } = Route.useRouteContext();
  const { t, lang, setLang, dir } = useAdminLang();
  return (
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
  );
}
