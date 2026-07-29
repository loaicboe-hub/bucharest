import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { isAuthenticated, getUser } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/_authed")({
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const user = getUser();
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="text-sm font-medium text-muted-foreground">Admin Panel</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Signed in as <span className="font-medium text-foreground">{user?.username ?? "admin"}</span>
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
