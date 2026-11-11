import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, Inbox, FileText, Activity, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminLang } from "@/lib/admin-i18n";
import { markets } from "@/lib/admin-mock-data";
import { listAllProducts } from "@/lib/products-db";
import { fetchQuoteRequests } from "@/lib/quote-requests";
import { fetchContactRequests } from "@/lib/contact-requests";

export const Route = createFileRoute("/admin/_authed/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { t } = useAdminLang();

  const { data: productRows = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: listAllProducts,
  });

  const { data: quoteRows = [] } = useQuery({
    queryKey: ["quote-requests"],
    queryFn: fetchQuoteRequests,
  });

  const { data: contactRows = [] } = useQuery({
    queryKey: ["contact-requests"],
    queryFn: fetchContactRequests,
  });

  const stats = [
    { key: "dashboard.totalProducts", value: productRows.length, icon: Package, color: "bg-emerald-100 text-emerald-700" },
    { key: "dashboard.contactRequests", value: contactRows.length, icon: Inbox, color: "bg-blue-100 text-blue-700" },
    { key: "dashboard.quoteRequests", value: quoteRows.length, icon: FileText, color: "bg-amber-100 text-amber-700" },
    { key: "dashboard.activeMarkets", value: markets.length, icon: TrendingUp, color: "bg-violet-100 text-violet-700" },
  ] as const;

  const recentFeed = [
    ...quoteRows.slice(0, 4).map((q) => ({
      id: `q-${q.id}`,
      text: `${t("dashboard.quoteFrom")} ${q.company || q.contactPerson || q.email}${q.product ? ` (${q.product})` : ""}`,
      time: q.date,
    })),
    ...contactRows.slice(0, 4).map((c) => ({
      id: `c-${c.id}`,
      text: `${t("dashboard.inquiryFrom")} ${c.company || c.name || c.email}`,
      time: c.date,
    })),
  ]
    .sort((a, b) => b.time.localeCompare(a.time))
    .slice(0, 6);

  return (
    <div>
      <PageHeader title={t("nav.dashboard")} description={t("dashboard.desc")} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.key} className="rounded-2xl border-border/60 shadow-sm transition hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t(s.key)}</p>
                <p className="text-2xl font-semibold text-foreground">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl border-border/60 shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" /> {t("dashboard.recentActivity")}
            </CardTitle>
            <Link to="/admin/quote-requests" className="text-xs font-medium text-emerald-700 hover:underline">
              {t("nav.quote-requests")}
            </Link>
          </CardHeader>
          <CardContent>
            {recentFeed.length > 0 ? (
              <ul className="space-y-3">
                {recentFeed.map((a) => (
                  <li key={a.id} className="flex items-start justify-between gap-2 border-b border-border/60 pb-3 last:border-0 last:pb-0">
                    <span className="text-sm text-foreground">{a.text}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{a.time}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{t("dashboard.noActivity")}</p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{t("dashboard.latestContacts")}</CardTitle>
            <Link to="/admin/contact-requests" className="text-xs font-medium text-emerald-700 hover:underline">
              {t("nav.contact-requests")}
            </Link>
          </CardHeader>
          <CardContent>
            {contactRows.length > 0 ? (
              <ul className="space-y-3">
                {contactRows.slice(0, 4).map((c) => (
                  <li key={c.id} className="flex flex-col border-b border-border/60 pb-3 last:border-0 last:pb-0">
                    <span className="text-sm font-medium text-foreground">{c.company || c.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {[c.country, c.email].filter(Boolean).join(" · ")}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{t("dashboard.noContacts")}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
