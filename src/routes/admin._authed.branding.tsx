import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/PageHeader";
import { toast } from "sonner";
import { Upload, Trash2 } from "lucide-react";
import { loadLogo, saveLogo, clearLogo, readFileAsDataUrl } from "@/lib/admin-branding";

export const Route = createFileRoute("/admin/_authed/branding")({
  component: BrandingPage,
});

function BrandingPage() {
  const [logo, setLogo] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLogo(loadLogo());
  }, []);

  const onPick = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (PNG, JPG or SVG)");
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      toast.error("Logo must be smaller than 1.5 MB");
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    saveLogo(dataUrl);
    setLogo(dataUrl);
    toast.success("Logo saved — it now shows on the website and invoice PDFs");
  };

  return (
    <div>
      <PageHeader
        title="Logo & Branding"
        description="Upload the company logo used in the website header, footer and invoice PDFs"
        actions={
          <Button onClick={() => inputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" /> Upload Logo
          </Button>
        }
      />

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0])}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Current Logo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                onPick(e.dataTransfer.files?.[0]);
              }}
              className="grid h-48 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-border bg-white transition hover:border-primary/50"
            >
              {logo ? (
                <img src={logo} alt="Company logo" className="max-h-40 max-w-[80%] object-contain" />
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  <Upload className="mx-auto mb-2 h-6 w-6" />
                  Click or drop an image to upload
                </div>
              )}
            </div>
            {logo && (
              <Button
                variant="outline"
                onClick={() => {
                  clearLogo();
                  setLogo(null);
                  toast.success("Logo removed");
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Remove Logo
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-[#1E5631] p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl bg-white/10">
                  {logo ? (
                    <img src={logo} alt="Logo preview" className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-xs text-white/60">Logo</span>
                  )}
                </div>
                <div className="text-white">
                  <div className="font-semibold">Fresh Diamond</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/60">
                    for Export
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Recommended: square or wide PNG with transparent background, at least 256px, under
              1.5 MB. The logo appears in the site header, site footer and the top-left of every
              Commercial Invoice PDF.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
