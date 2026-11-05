import { useEffect, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SPEC_LABELS, type ProductSpecs } from "@/lib/products-catalog";
import {
  EMPTY_SPECS,
  productImage,
  saveProduct,
  slugify,
  uploadProductImage,
  type ProductCategory,
  type ProductRow,
} from "@/lib/products-db";
import { toast } from "sonner";

const SPEC_KEYS = Object.keys(SPEC_LABELS.en) as (keyof ProductSpecs)[];

export function ProductDialog({
  open,
  onOpenChange,
  product,
  categories,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: ProductRow | null;
  categories: ProductCategory[];
  onSaved?: () => void;
}) {
  const [draft, setDraft] = useState<ProductRow | null>(product);
  const [busy, setBusy] = useState(false);

  useEffect(() => setDraft(product), [product]);
  if (!draft) return null;

  const specs = (lang: "en" | "ar") => ({ ...EMPTY_SPECS, ...(lang === "en" ? draft.specs_en : draft.specs_ar) });
  const setSpec = (lang: "en" | "ar", key: keyof ProductSpecs, value: string) =>
    setDraft({ ...draft, [`specs_${lang}`]: { ...specs(lang), [key]: value } });
  const toggleSpecVisible = (key: keyof ProductSpecs) =>
    setDraft({
      ...draft,
      hidden_specs: draft.hidden_specs.includes(key)
        ? draft.hidden_specs.filter((k) => k !== key)
        : [...draft.hidden_specs, key],
    });

  const onMainImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const { url, error } = await uploadProductImage(file);
    setBusy(false);
    if (error || !url) return toast.error(error ?? "Upload failed");
    setDraft({ ...draft, main_image: url });
  };

  const onGalleryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setBusy(true);
    const results = await Promise.all(files.map(uploadProductImage));
    setBusy(false);
    const urls = results.map((r) => r.url).filter(Boolean) as string[];
    if (!urls.length) return toast.error("Upload failed");
    setDraft({ ...draft, gallery: [...draft.gallery, ...urls] });
  };

  const save = async () => {
    const name = draft.name_en.trim();
    if (!name) return toast.error("English product name is required");
    setBusy(true);
    const error = await saveProduct({ ...draft, name_en: name, slug: draft.slug || slugify(name) });
    setBusy(false);
    if (error) return toast.error(error);
    toast.success("Product saved");
    onOpenChange(false);
    onSaved?.();
  };

  const localeFields = (lang: "en" | "ar") => ({
    name: lang === "en" ? draft.name_en : draft.name_ar,
    intro: lang === "en" ? draft.intro_en : draft.intro_ar,
    description: lang === "en" ? draft.description_en : draft.description_ar,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{draft.id ? "Edit product" : "Add product"}</DialogTitle>
          <DialogDescription>
            Everything here is what visitors see on the website — listing card and product page.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={draft.trade} onValueChange={(v) => setDraft({ ...draft, trade: v as ProductRow["trade"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="export">Export Products</SelectItem>
                <SelectItem value="import">Import Products</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={draft.category_id ?? ""}
              onValueChange={(v) => setDraft({ ...draft, category_id: v })}
            >
              <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name_en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Page URL (slug)</Label>
            <Input
              value={draft.slug}
              placeholder={slugify(draft.name_en) || "product-slug"}
              onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value) })}
            />
          </div>
          <div className="flex items-end gap-3 pb-1">
            <Switch checked={draft.published} onCheckedChange={(v) => setDraft({ ...draft, published: v })} />
            <Label>{draft.published ? "Published" : "Draft"}</Label>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Main image</Label>
            <div className="flex items-center gap-3">
              <img src={productImage(draft)} alt="" className="h-16 w-16 rounded-md border object-cover" />
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-accent">
                <Upload className="h-4 w-4" /> Upload
                <input type="file" accept="image/*" className="hidden" onChange={onMainImage} />
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Gallery ({draft.gallery.length})</Label>
            <div className="flex flex-wrap items-center gap-2">
              {draft.gallery.map((g, i) => (
                <button
                  key={g + i}
                  type="button"
                  title="Remove"
                  onClick={() => setDraft({ ...draft, gallery: draft.gallery.filter((_, x) => x !== i) })}
                  className="relative h-10 w-10 overflow-hidden rounded border"
                >
                  <img src={g} alt="" className="h-full w-full object-cover" />
                  <X className="absolute right-0 top-0 h-3 w-3 bg-background/80 text-destructive" />
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
            <TabsTrigger value="fr">Français</TabsTrigger>
          </TabsList>
          {(["en", "fr"] as const).map((lang) => {
            const f = localeFields(lang === "fr" ? "ar" : "en");
            const dbKey = lang === "fr" ? "ar" : "en";
            return (
              <TabsContent key={lang} value={lang} className="space-y-4 pt-4" dir="ltr">
                <div className="space-y-2">
                  <Label>{lang === "fr" ? "Nom (Français)" : "Name (English)"}</Label>
                  <Input value={f.name} onChange={(e) => setDraft({ ...draft, [`name_${dbKey}`]: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{lang === "fr" ? "Brève introduction" : "Short intro"}</Label>
                  <Textarea rows={2} value={f.intro} onChange={(e) => setDraft({ ...draft, [`intro_${dbKey}`]: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{lang === "fr" ? "Description complète" : "Description"}</Label>
                  <Textarea rows={4} value={f.description} onChange={(e) => setDraft({ ...draft, [`description_${dbKey}`]: e.target.value })} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {SPEC_KEYS.map((key) => {
                    const hidden = draft.hidden_specs.includes(key);
                    return (
                      <div key={key} className="space-y-1.5 rounded-md border border-border p-3">
                        <div className="flex items-center justify-between gap-2">
                          <Label className="text-xs">{SPEC_LABELS[lang][key]}</Label>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground">
                              {hidden ? (lang === "fr" ? "Masqué" : "Hidden") : lang === "fr" ? "Visible" : "Shown"}
                            </span>
                            <Switch checked={!hidden} onCheckedChange={() => toggleSpecVisible(key)} />
                          </div>
                        </div>
                        <Input
                          value={specs(dbKey)[key]}
                          disabled={hidden}
                          onChange={(e) => setSpec(dbKey, key, e.target.value)}
                        />
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save product"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
