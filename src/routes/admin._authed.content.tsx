import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminLang } from "@/lib/admin-i18n";
import { toast } from "sonner";
import { Upload, Plus, Trash2 } from "lucide-react";
import {
  defaultFooterConfig,
  loadFooterConfig,
  saveFooterConfig,
  type FooterConfig,
  type FooterColumn,
  type FooterLink,
} from "@/lib/admin-footer";

export const Route = createFileRoute("/admin/_authed/content")({
  component: ContentPage,
});

type Section = {
  title: string;
  paragraph: string;
  button: string;
  image: string;
};

const initial: Record<string, Section> = {
  home: { title: "Nailvlora Import and Export", paragraph: "Premium fresh fruits & vegetables since 2011.", button: "Explore Products", image: "/placeholder.svg" },
  about: { title: "About Us", paragraph: "ISO 9001 Certified exporter serving global markets.", button: "Learn More", image: "/placeholder.svg" },
  whyUs: { title: "Why Choose Us", paragraph: "Quality, reliability, and worldwide reach.", button: "See Reasons", image: "/placeholder.svg" },
  process: { title: "Our Export Process", paragraph: "From farm to global markets, seamlessly.", button: "View Process", image: "/placeholder.svg" },
  contact: { title: "Contact Us", paragraph: "Reach out for inquiries and quotations.", button: "Get In Touch", image: "/placeholder.svg" },
};

function ContentPage() {
  const { t } = useAdminLang();
  const [data, setData] = useState(initial);
  const [footer, setFooter] = useState<FooterConfig>(defaultFooterConfig);

  useEffect(() => {
    setFooter(loadFooterConfig());
    getHeroImageUrl()
      .then((url) => {
        if (url) setData((d) => ({ ...d, home: { ...d.home, image: url } }));
      })
      .catch(() => undefined);
  }, []);

  const update = (key: string, field: keyof Section, value: string) => {
    setData((d) => ({ ...d, [key]: { ...d[key], [field]: value } }));
  };
  const uploadImage = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (key === "home") {
      const err = await uploadHeroImage(f);
      if (err) {
        toast.error(err);
        return;
      }
      const url = await getHeroImageUrl();
      if (url) update("home", "image", url);
      toast.success("Hero image updated — it now shows on the homepage");
      return;
    }
    update(key, "image", URL.createObjectURL(f));
  };
  const save = () => {
    saveFooterConfig(footer);
    toast.success("Content saved");
  };


  const setColumn = (ci: number, patch: Partial<FooterColumn>) =>
    setFooter((f) => ({
      ...f,
      columns: f.columns.map((c, i) => (i === ci ? { ...c, ...patch } : c)),
    }));
  const setLink = (ci: number, li: number, patch: Partial<FooterLink>) =>
    setColumn(ci, {
      links: footer.columns[ci].links.map((l, i) => (i === li ? { ...l, ...patch } : l)),
    });
  const addLink = (ci: number) =>
    setColumn(ci, { links: [...footer.columns[ci].links, { label: "New link", href: "#top" }] });
  const removeLink = (ci: number, li: number) =>
    setColumn(ci, { links: footer.columns[ci].links.filter((_, i) => i !== li) });

  const sections: [string, string][] = [
    ["home", "Home"], ["about", "About"], ["whyUs", "Why Us"], ["process", "Process"], ["contact", "Contact Info"],
  ];

  return (
    <div>
      <PageHeader title={t("nav.content")} description={t("content.desc")} actions={<Button onClick={save}>Save Changes</Button>} />

      <Tabs defaultValue="home" className="w-full">
        <TabsList className="mb-4 flex w-full flex-wrap justify-start bg-muted/60">
          {sections.map(([k, l]) => <TabsTrigger key={k} value={k}>{l}</TabsTrigger>)}
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        {sections.map(([k, l]) => (
          <TabsContent key={k} value={k}>
            <Card className="rounded-2xl border-border/60 shadow-sm">
              <CardHeader><CardTitle>{l} Section</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Title</Label><Input value={data[k].title} onChange={(e) => update(k, "title", e.target.value)} /></div>
                <div className="space-y-2"><Label>Paragraph</Label><Textarea rows={4} value={data[k].paragraph} onChange={(e) => update(k, "paragraph", e.target.value)} /></div>
                <div className="space-y-2"><Label>Button Text</Label><Input value={data[k].button} onChange={(e) => update(k, "button", e.target.value)} /></div>
                <div className="space-y-2">
                  <Label>Image</Label>
                  <div className="flex items-center gap-3">
                    <img src={data[k].image} alt="" className="h-20 w-20 rounded-md border object-cover" />
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent">
                      <Upload className="h-4 w-4" /> Change image
                      <input type="file" accept="image/*" onChange={(e) => uploadImage(k, e)} className="hidden" />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        <TabsContent value="footer" className="space-y-4">
          <Card className="rounded-2xl border-border/60 shadow-sm">
            <CardHeader><CardTitle>Footer Intro & Social Links</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tagline</Label>
                <Textarea rows={3} value={footer.tagline} onChange={(e) => setFooter((f) => ({ ...f, tagline: e.target.value }))} />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {(["facebook", "instagram", "linkedin"] as const).map((s) => (
                  <div key={s} className="space-y-2">
                    <Label className="capitalize">{s}</Label>
                    <Input value={footer.social[s]} onChange={(e) => setFooter((f) => ({ ...f, social: { ...f.social, [s]: e.target.value } }))} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-3">
            {footer.columns.map((col, ci) => (
              <Card key={ci} className="rounded-2xl border-border/60 shadow-sm">
                <CardHeader><CardTitle className="text-base">Column {ci + 1}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Column Title</Label>
                    <Input value={col.title} onChange={(e) => setColumn(ci, { title: e.target.value })} />
                  </div>
                  <div className="space-y-3">
                    {col.links.map((l, li) => (
                      <div key={li} className="space-y-2 rounded-lg border border-border/60 p-3">
                        <div className="flex items-center gap-2">
                          <Input value={l.label} placeholder="Label" onChange={(e) => setLink(ci, li, { label: e.target.value })} />
                          <Button variant="ghost" size="icon" onClick={() => removeLink(ci, li)} aria-label="Remove link">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input value={l.href} placeholder="#about or https://..." onChange={(e) => setLink(ci, li, { href: e.target.value })} />
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => addLink(ci)}>
                    <Plus className="mr-1 h-4 w-4" /> Add link
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Use in-page anchors (#top, #about, #products, #why, #process, #markets, #contact) or full URLs.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
