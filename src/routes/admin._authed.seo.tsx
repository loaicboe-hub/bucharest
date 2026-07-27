import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/PageHeader";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/_authed/seo")({
  component: SEOPage,
});

function SEOPage() {
  const [seo, setSeo] = useState({
    title: "Fresh Diamond for Export | Premium Fresh Fruits & Vegetables Exporter",
    description: "Fresh Diamond for Export is a leading exporter of premium fresh fruits and vegetables since 2011. ISO 9001 Certified.",
    keywords: "Fresh Fruits Export, Fresh Vegetables Export, Egypt Export, ISO 9001",
    ogImage: "/placeholder.svg",
  });

  const upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setSeo((s) => ({ ...s, ogImage: URL.createObjectURL(f) }));
  };

  return (
    <div>
      <PageHeader title="SEO Settings" description="Search engine and social sharing metadata" actions={<Button onClick={() => toast.success("SEO saved")}>Save Changes</Button>} />
      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader><CardTitle>Global Meta Tags</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Meta Title</Label><Input value={seo.title} onChange={(e) => setSeo({ ...seo, title: e.target.value })} /></div>
          <div className="space-y-2"><Label>Meta Description</Label><Textarea rows={3} value={seo.description} onChange={(e) => setSeo({ ...seo, description: e.target.value })} /></div>
          <div className="space-y-2"><Label>Keywords</Label><Textarea rows={2} value={seo.keywords} onChange={(e) => setSeo({ ...seo, keywords: e.target.value })} /></div>
          <div className="space-y-2">
            <Label>Open Graph Image</Label>
            <div className="flex items-center gap-3">
              <img src={seo.ogImage} alt="" className="h-20 w-32 rounded-md border object-cover" />
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent">
                <Upload className="h-4 w-4" /> Change image
                <input type="file" accept="image/*" onChange={upload} className="hidden" />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
