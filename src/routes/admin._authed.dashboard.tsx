import { createFileRoute } from "@tanstack/react-router";
import { Package, Inbox, FileText, Activity, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/PageHeader";
import { contactRequests, quoteRequests, products, recentActivity } from "@/lib/admin-mock-data";

export const Route = createFileRoute("/admin/_authed/dashboard")({
  component: Dashboard,
});

const stats = [
  { label: "Total Products", value: products.length, icon: Package, color: "bg-emerald-100 text-emerald-700" },
  { label: "Contact Requests", value: contactRequests.length, icon: Inbox, color: "bg-blue-100 text-blue-700" },
  { label: "Quote Requests", value: quoteRequests.length, icon: FileText, color: "bg-amber-100 text-amber-700" },
  { label: "Active Markets", value: 6, icon: TrendingUp, color: "bg-violet-100 text-violet-700" },
];

function Dashboard() {
  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your website performance and activity" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="rounded-2xl border-border/60 shadow-sm transition hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-semibold text-foreground">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl border-border/60 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recentActivity.map((a) => (
                <li key={a.id} className="flex items-start justify-between border-b border-border/60 pb-3 last:border-0 last:pb-0">
                  <span className="text-sm text-foreground">{a.text}</span>
                  <span className="text-xs text-muted-foreground">{a.time}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Latest Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {contactRequests.slice(0, 4).map((c) => (
                <li key={c.id} className="flex flex-col border-b border-border/60 pb-3 last:border-0 last:pb-0">
                  <span className="text-sm font-medium text-foreground">{c.company}</span>
                  <span className="text-xs text-muted-foreground">{c.country} · {c.product}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
