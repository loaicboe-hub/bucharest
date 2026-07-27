import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/PageHeader";
import { toast } from "sonner";
import { Upload } from "lucide-react";

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
  home: { title: "Fresh Diamond for Export", paragraph: "Premium fresh fruits & vegetables since 2011.", button: "Explore Products", image: "/placeholder.svg" },
  about: { title: "About Us", paragraph: "ISO 9001 Certified exporter serving global markets.", button: "Learn More", image: "/placeholder.svg" },
  whyUs: { title: "Why Choose Us", paragraph: "Quality, reliability, and worldwide reach.", button: "See Reasons", image: "/placeholder.svg" },
  process: { title: "Our Export Process", paragraph: "From farm to global markets, seamlessly.", button: "View Process", image: "/placeholder.svg" },
  contact: { title: "Contact Us", paragraph: "Reach out for inquiries and quotations.", button: "Get In Touch", image: "/placeholder.svg" },
};

function ContentPage() {
  const [data, setData] = useState(initial);

  const update = (key: string, field: keyof Section, value: string) => {
    setData((d) => ({ ...d, [key]: { ...d[key], [field]: value } }));
  };
  const uploadImage = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    update(key, "image", URL.createObjectURL(f));
  };
  const save = () => toast.success("Content saved");

  const sections: [string, string][] = [
    ["home", "Home"], ["about", "About"], ["whyUs", "Why Us"], ["process", "Process"], ["contact", "Contact Info"],
  ];

  return (
    <div>
      <PageHeader title="Website Content" description="Edit copy, imagery and CTAs across your public site" actions={<Button onClick={save}>Save Changes</Button>} />

      <Tabs defaultValue="home" className="w-full">
        <TabsList className="mb-4 flex w-full flex-wrap justify-start bg-muted/60">
          {sections.map(([k, l]) => <TabsTrigger key={k} value={k}>{l}</TabsTrigger>)}
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
      </Tabs>
    </div>
  );
}
