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
  Receipt,
  Palette,
  Handshake,
  Home,
  Newspaper,
  Tags,
  ShieldCheck,
  X,
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
  useSidebar,
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
  const { isMobile, setOpenMobile } = useSidebar();
  const closeMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  const visibleItems = items.filter((item) => can(moduleKeyFromPath(item.url) ?? "", "view"));

  const handleLogout = async () => {
    closeMobile();
    await signOut();
    navigate({ to: "/admin/login" });
  };

  return (
    <Sidebar collapsible="icon" side={dir === "rtl" ? "right" : "left"} dir={dir}>
      <SidebarHeader className="border-b border-sidebar-border bg-white">
        <div className="flex items-center justify-between gap-2 px-2 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gold/50 bg-white p-0.5 shadow-sm">
              <img src="/logo.png" alt="BucharestEgyAgro" className="h-full w-full object-contain" />
            </div>
            <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-semibold text-sidebar-foreground">BucharestEgyAgro</span>
              <span className="truncate text-xs text-slate-600">{t("adminPanel")}</span>
            </div>
          </div>
          {isMobile ? (
            <button
              type="button"
              onClick={() => setOpenMobile(false)}
              aria-label="Close menu"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 md:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel className="font-semibold text-slate-500">{t("management")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const active = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={t(item.key)}
                      className="text-slate-800 hover:bg-emerald-50 hover:text-emerald-950 data-[active=true]:bg-emerald-50 data-[active=true]:font-semibold data-[active=true]:text-emerald-950"
                    >
                      <Link to={item.url} onClick={closeMobile} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 shrink-0" />
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
                    className="text-slate-800 hover:bg-emerald-50 hover:text-emerald-950 data-[active=true]:bg-emerald-50 data-[active=true]:font-semibold data-[active=true]:text-emerald-950"
                  >
                    <Link to="/admin/users" onClick={closeMobile} className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 shrink-0" />
                      <span>{t("nav.users")}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : null}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border bg-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={t("viewSite")}
              className="text-slate-800 hover:bg-emerald-50 hover:text-emerald-950"
            >
              <Link to="/" onClick={closeMobile} className="flex items-center gap-2">
                <Home className="h-4 w-4 shrink-0" />
                <span>{t("viewSite")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip={t("logout")}
              className="text-slate-800 hover:bg-rose-50 hover:text-rose-700"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>{t("logout")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
