import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminLang } from "@/lib/admin-i18n";
import { toast } from "sonner";
import {
  defaultSiteSettings,
  loadSiteSettings,
  saveSiteSettings,
  type SiteSettings,
} from "@/lib/site-settings";

export const Route = createFileRoute("/admin/_authed/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useAdminLang();
  const [g, setG] = useState<SiteSettings>(defaultSiteSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSiteSettings().then((s) => {
      setG(s);
      setLoading(false);
    });
  }, []);

  const upd = (k: keyof SiteSettings, v: string) => setG((s) => ({ ...s, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    const error = await saveSiteSettings(g);
    setSaving(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Settings saved");
  };

  return (
    <div>
      <PageHeader
        title={t("nav.settings")}
        description={t("settings.desc")}
        actions={
          <Button onClick={handleSave} disabled={loading || saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        }
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader><CardTitle>Company Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Company Name</Label><Input value={g.companyName} onChange={(e) => upd("companyName", e.target.value)} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={g.phone} onChange={(e) => upd("phone", e.target.value)} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={g.email} onChange={(e) => upd("email", e.target.value)} /></div>
            <div className="space-y-2"><Label>WhatsApp</Label><Input value={g.whatsapp} onChange={(e) => upd("whatsapp", e.target.value)} /></div>
            <div className="space-y-2"><Label>Address</Label><Textarea rows={2} value={g.address} onChange={(e) => upd("address", e.target.value)} /></div>
            <div className="space-y-2"><Label>Google Maps URL</Label><Input value={g.maps} onChange={(e) => upd("maps", e.target.value)} /></div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader><CardTitle>Social Links</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Facebook</Label><Input value={g.facebook} onChange={(e) => upd("facebook", e.target.value)} /></div>
            <div className="space-y-2"><Label>Instagram</Label><Input value={g.instagram} onChange={(e) => upd("instagram", e.target.value)} /></div>
            <div className="space-y-2"><Label>LinkedIn</Label><Input value={g.linkedin} onChange={(e) => upd("linkedin", e.target.value)} /></div>
            <div className="space-y-2"><Label>Twitter / X</Label><Input value={g.twitter} onChange={(e) => upd("twitter", e.target.value)} /></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
