import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/PageHeader";
import { toast } from "sonner";
import {
  defaultSiteSettings,
  loadSiteSettings,
  saveSiteSettings,
  type SiteSettings,
} from "@/lib/site-settings";

export const Route = createFileRoute("/admin/_authed/seo")({
  component: SEOPage,
});

function SEOPage() {
  const [s, setS] = useState<SiteSettings>(defaultSiteSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSiteSettings().then((v) => {
      setS(v);
      setLoading(false);
    });
  }, []);

  const upd = (k: keyof SiteSettings, v: string) => setS((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    const error = await saveSiteSettings(s);
    setSaving(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("SEO settings saved");
  };

  return (
    <div>
      <PageHeader
        title="SEO Settings"
        description="Search engine and social sharing metadata"
        actions={
          <Button onClick={handleSave} disabled={loading || saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        }
      />
      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader><CardTitle>Global Meta Tags</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Meta Title</Label><Input value={s.seoTitle} onChange={(e) => upd("seoTitle", e.target.value)} /></div>
          <div className="space-y-2"><Label>Meta Description</Label><Textarea rows={3} value={s.seoDescription} onChange={(e) => upd("seoDescription", e.target.value)} /></div>
          <div className="space-y-2"><Label>Keywords</Label><Textarea rows={2} value={s.seoKeywords} onChange={(e) => upd("seoKeywords", e.target.value)} /></div>
          <div className="space-y-2">
            <Label>Open Graph Image URL</Label>
            <Input
              value={s.seoOgImage}
              placeholder="https://example.com/share-image.jpg"
              onChange={(e) => upd("seoOgImage", e.target.value)}
            />
            {s.seoOgImage ? (
              <img src={s.seoOgImage} alt="Open Graph preview" className="h-20 w-32 rounded-md border object-cover" />
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
