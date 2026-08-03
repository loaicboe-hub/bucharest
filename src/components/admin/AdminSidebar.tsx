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

const items = [
  { key: "nav.dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { key: "nav.quote-requests", url: "/admin/quote-requests", icon: FileText },
  { key: "nav.products", url: "/admin/products", icon: Package },
  { key: "nav.invoices", url: "/admin/invoices", icon: Receipt },
  { key: "nav.markets", url: "/admin/markets", icon: Globe },
  { key: "nav.partners", url: "/admin/partners", icon: Handshake },
  { key: "nav.about-video", url: "/admin/about-video", icon: Video },
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

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/admin/login" });
  };

  return (
    <Sidebar collapsible="icon" side={dir === "rtl" ? "right" : "left"}>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Diamond className="h-5 w-5" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-sidebar-foreground">Nailvlora</span>
            <span className="text-xs text-muted-foreground">{t("adminPanel")}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("management")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
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
