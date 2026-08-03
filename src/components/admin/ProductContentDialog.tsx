import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SPEC_LABELS, type ProductSpecs } from "@/lib/products-catalog";
import { saveProductContent, slugify, type ProductContent } from "@/lib/product-content";
import { readFileAsDataUrl } from "@/lib/admin-branding";
import { toast } from "sonner";

const SPEC_KEYS = Object.keys(SPEC_LABELS.en) as (keyof ProductSpecs)[];

export function ProductContentDialog({
  open,
  onOpenChange,
  product,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: ProductContent | null;
  onSaved?: () => void;
}) {
  const [draft, setDraft] = useState<ProductContent | null>(product);

  useEffect(() => setDraft(product), [product]);
  if (!draft) return null;

  const setLocale = (lang: "en" | "ar", patch: Partial<ProductContent["en"]>) =>
    setDraft({ ...draft, [lang]: { ...draft[lang], ...patch } });
  const setSpec = (lang: "en" | "ar", key: keyof ProductSpecs, value: string) =>
    setDraft({ ...draft, [lang]: { ...draft[lang], specs: { ...draft[lang].specs, [key]: value } } });

  const onMainImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDraft({ ...draft, main: await readFileAsDataUrl(file) });
  };
  const onGalleryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const urls = await Promise.all(files.map(readFileAsDataUrl));
    setDraft({ ...draft, gallery: [...draft.gallery, ...urls] });
  };

  const save = () => {
    const name = draft.en.name.trim();
    if (!name) return toast.error("English product name is required");
    const slug = draft.slug || slugify(name);
    saveProductContent({ ...draft, slug, en: { ...draft.en, name } });
    toast.success("Website product information saved");
    onOpenChange(false);
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{draft.slug ? "Edit website product information" : "Add website product"}</DialogTitle>
          <DialogDescription>
            This content is what visitors see on the website product page ({draft.trade}).
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Sub Category</Label>
            <Select value={draft.trade} onValueChange={(v) => setDraft({ ...draft, trade: v as ProductContent["trade"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Export Products">Export Products</SelectItem>
                <SelectItem value="Import Products">Import Products</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Group</Label>
            <Select value={draft.group} onValueChange={(v) => setDraft({ ...draft, group: v as ProductContent["group"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fruits">Fruits</SelectItem>
                <SelectItem value="vegetables">Vegetables</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Page URL (slug)</Label>
            <Input
              value={draft.slug}
              placeholder={slugify(draft.en.name) || "product-slug"}
              onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value) })}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Main image</Label>
            <div className="flex items-center gap-3">
              <img src={draft.main} alt="" className="h-16 w-16 rounded-md border object-cover" />
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-accent">
                <Upload className="h-4 w-4" /> Upload
                <input type="file" accept="image/*" className="hidden" onChange={onMainImage} />
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Gallery ({draft.gallery.length})</Label>
            <div className="flex flex-wrap items-center gap-2">
              {draft.gallery.slice(0, 5).map((g, i) => (
                <button
                  key={g + i}
                  type="button"
                  title="Remove"
                  onClick={() => setDraft({ ...draft, gallery: draft.gallery.filter((_, x) => x !== i) })}
                  className="h-10 w-10 overflow-hidden rounded border"
                >
                  <img src={g} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-accent">
                <Upload className="h-4 w-4" /> Add
                <input type="file" accept="image/*" multiple className="hidden" onChange={onGalleryImage} />
              </label>
            </div>
          </div>
        </div>

        <Tabs defaultValue="en" className="mt-2">
          <TabsList>
            <TabsTrigger value="en">English</TabsTrigger>
            <TabsTrigger value="ar">العربية</TabsTrigger>
          </TabsList>
          {(["en", "ar"] as const).map((lang) => (
            <TabsContent key={lang} value={lang} className="space-y-4 pt-4" dir={lang === "ar" ? "rtl" : "ltr"}>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={draft[lang].name} onChange={(e) => setLocale(lang, { name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Short intro</Label>
                <Textarea rows={2} value={draft[lang].intro} onChange={(e) => setLocale(lang, { intro: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea rows={4} value={draft[lang].description} onChange={(e) => setLocale(lang, { description: e.target.value })} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {SPEC_KEYS.map((key) => (
                  <div key={key} className="space-y-1.5">
                    <Label className="text-xs">{SPEC_LABELS[lang][key]}</Label>
                    <Input value={draft[lang].specs[key]} onChange={(e) => setSpec(lang, key, e.target.value)} />
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Save website info</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
