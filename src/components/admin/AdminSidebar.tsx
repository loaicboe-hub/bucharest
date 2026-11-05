import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  Package,
  Globe,
  Type,
  Image,
  Search,
  Settings,
  LogOut,
  Diamond,
  Receipt,
  Palette,
  Handshake,
  Home,
  Video,
  Newspaper, Tags, ShieldCheck,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { signOut } from "@/lib/admin-auth";
import { useAdminLang, type AdminKey } from "@/lib/admin-i18n";
import { useAdminPermissions } from "@/lib/admin-permissions";
import { moduleKeyFromPath } from "@/lib/admin-modules";

const items = [
  { key: "nav.dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { key: "nav.quote-requests", url: "/admin/quote-requests", icon: FileText },
  { key: "nav.products", url: "/admin/products", icon: Package },
  { key: "nav.invoices", url: "/admin/invoices", icon: Receipt },
  { key: "nav.markets", url: "/admin/markets", icon: Globe },
  { key: "nav.partners", url: "/admin/partners", icon: Handshake },
  { key: "nav.categories", url: "/admin/categories", icon: Tags },
  { key: "nav.news", url: "/admin/news", icon: Newspaper },
  { key: "nav.content", url: "/admin/content", icon: Type },
  { key: "nav.media", url: "/admin/media", icon: Image },
  { key: "nav.branding", url: "/admin/branding", icon: Palette },
  { key: "nav.seo", url: "/admin/seo", icon: Search },
  { key: "nav.settings", url: "/admin/settings", icon: Settings },
] satisfies { key: AdminKey; url: string; icon: typeof Globe }[];

export function AdminSidebar() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { t, dir } = useAdminLang();
  const { isSuper, can } = useAdminPermissions();

  const visibleItems = items.filter((item) => can(moduleKeyFromPath(item.url) ?? "", "view"));


  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/admin/login" });
  };

  return (
    <Sidebar collapsible="icon" side={dir === "rtl" ? "right" : "left"}>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gold/50 bg-white p-0.5 shadow-sm">
            <img src="/logo.png" alt="BucharestEgyAgro" className="h-full w-full object-contain" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-sidebar-foreground">BucharestEgyAgro</span>
            <span className="text-xs text-muted-foreground">{t("adminPanel")}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("management")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const active = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active} tooltip={t(item.key)}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{t(item.key)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              {isSuper ? (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/admin/users"}
                    tooltip={t("nav.users")}
                  >
                    <Link to="/admin/users" className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      <span>{t("nav.users")}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : null}
            </SidebarMenu>

          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={t("viewSite")}>
              <Link to="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span>{t("viewSite")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip={t("logout")}>
              <LogOut className="h-4 w-4" />
              <span>{t("logout")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
