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
import { useAdminLang, type AdminLang } from "@/lib/admin-i18n";
import { SPEC_LABELS, type ProductSpecs } from "@/lib/products-catalog";
import {
  EMPTY_SPECS,
  categoryName,
  hydrateProductForEditor,
  productFallbackImage,
  productImage,
  saveProduct,
  slugify,
  uploadProductImage,
  type ProductCategory,
  type ProductRow,
} from "@/lib/products-db";
import { toast } from "sonner";

const SPEC_KEYS = Object.keys(SPEC_LABELS.en) as (keyof ProductSpecs)[];

type LocaleCode = "en" | "fr" | "ar" | "ru";

const LOCALE_TABS: readonly {
  code: LocaleCode;
  trigger: string;
  dir: "ltr" | "rtl";
  nameLabel: string;
  introLabel: string;
  descLabel: string;
  hiddenLabel: string;
  shownLabel: string;
}[] = [
  {
    code: "en",
    trigger: "English",
    dir: "ltr",
    nameLabel: "Name (English)",
    introLabel: "Short intro",
    descLabel: "Description",
    hiddenLabel: "Hidden",
    shownLabel: "Shown",
  },
  {
    code: "fr",
    trigger: "Français",
    dir: "ltr",
    nameLabel: "Nom (Français)",
    introLabel: "Brève introduction",
    descLabel: "Description complète",
    hiddenLabel: "Masqué",
    shownLabel: "Visible",
  },
  {
    code: "ar",
    trigger: "العربية",
    dir: "rtl",
    nameLabel: "الاسم (بالعربية)",
    introLabel: "نبذة مختصرة",
    descLabel: "الوصف الكامل",
    hiddenLabel: "مخفي",
    shownLabel: "ظاهر",
  },
  {
    code: "ru",
    trigger: "Русский",
    dir: "ltr",
    nameLabel: "Название (Русский)",
    introLabel: "Краткое описание",
    descLabel: "Полное описание",
    hiddenLabel: "Скрыто",
    shownLabel: "Видно",
  },
];

const DIALOG_UI: Record<
  AdminLang,
  {
    editProduct: string;
    addProduct: string;
    subtitle: string;
    type: string;
    exportProducts: string;
    importProducts: string;
    exportShort: string;
    importShort: string;
    category: string;
    selectCategory: string;
    slug: string;
    published: string;
    draft: string;
    mainImage: string;
    upload: string;
    gallery: string;
    add: string;
    remove: string;
    cancel: string;
    save: string;
    saving: string;
    nameRequired: string;
    saved: string;
    imageUploaded: string;
    galleryUploaded: string;
    uploadFailed: string;
  }
> = {
  en: {
    editProduct: "Edit product",
    addProduct: "Add product",
    subtitle: "Everything here is what visitors see on the website — listing card and product page.",
    type: "Type",
    exportProducts: "Export Products",
    importProducts: "Import Products",
    exportShort: "Export",
    importShort: "Import",
    category: "Category",
    selectCategory: "Select a category",
    slug: "Page URL (slug)",
    published: "Published",
    draft: "Draft",
    mainImage: "Main image",
    upload: "Upload",
    gallery: "Gallery",
    add: "Add",
    remove: "Remove",
    cancel: "Cancel",
    save: "Save product",
    saving: "Saving…",
    nameRequired: "English product name is required",
    saved: "Product saved",
    imageUploaded: "Image uploaded",
    galleryUploaded: "Gallery image uploaded",
    uploadFailed: "Upload failed",
  },
  fr: {
    editProduct: "Modifier le produit",
    addProduct: "Ajouter un produit",
    subtitle: "Tout ce que vous saisissez ici est visible par les visiteurs sur le site web.",
    type: "Type",
    exportProducts: "Produits d'Export",
    importProducts: "Produits d'Import",
    exportShort: "Export",
    importShort: "Import",
    category: "Catégorie",
    selectCategory: "Choisir une catégorie",
    slug: "URL de la page (slug)",
    published: "Publié",
    draft: "Brouillon",
    mainImage: "Image principale",
    upload: "Télécharger",
    gallery: "Galerie",
    add: "Ajouter",
    remove: "Supprimer",
    cancel: "Annuler",
    save: "Enregistrer",
    saving: "Enregistrement…",
    nameRequired: "Le nom en anglais est requis",
    saved: "Produit enregistré",
    imageUploaded: "Image téléchargée",
    galleryUploaded: "Image ajoutée à la galerie",
    uploadFailed: "Échec du téléchargement",
  },
  ar: {
    editProduct: "تعديل المنتج",
    addProduct: "إضافة منتج",
    subtitle: "كل ما تدخله هنا يظهر للزوار على الموقع — في بطاقة المنتج وصفحة التفاصيل.",
    type: "النوع",
    exportProducts: "منتجات التصدير",
    importProducts: "منتجات الاستيراد",
    exportShort: "تصدير",
    importShort: "استيراد",
    category: "التصنيف",
    selectCategory: "اختر تصنيفاً",
    slug: "رابط الصفحة (slug)",
    published: "منشور",
    draft: "مسودة",
    mainImage: "الصورة الرئيسية",
    upload: "رفع",
    gallery: "معرض الصور",
    add: "إضافة",
    remove: "إزالة",
    cancel: "إلغاء",
    save: "حفظ المنتج",
    saving: "جاري الحفظ…",
    nameRequired: "اسم المنتج بالإنجليزية مطلوب",
    saved: "تم حفظ المنتج",
    imageUploaded: "تم رفع الصورة",
    galleryUploaded: "تمت إضافة الصورة للمعرض",
    uploadFailed: "فشل الرفع",
  },
  ru: {
    editProduct: "Редактировать товар",
    addProduct: "Добавить товар",
    subtitle: "Всё, что указано здесь, отображается посетителям в каталоге и на странице товара.",
    type: "Тип",
    exportProducts: "Экспорт",
    importProducts: "Импорт",
    exportShort: "Экспорт",
    importShort: "Импорт",
    category: "Категория",
    selectCategory: "Выберите категорию",
    slug: "URL страницы (slug)",
    published: "Опубликован",
    draft: "Черновик",
    mainImage: "Главное фото",
    upload: "Загрузить",
    gallery: "Галерея",
    add: "Добавить",
    remove: "Удалить",
    cancel: "Отмена",
    save: "Сохранить товар",
    saving: "Сохранение…",
    nameRequired: "Необходимо название на английском",
    saved: "Товар сохранён",
    imageUploaded: "Изображение загружено",
    galleryUploaded: "Фото добавлено в галерею",
    uploadFailed: "Ошибка загрузки",
  },
};

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
  const { lang: adminLang } = useAdminLang();
  const ui = DIALOG_UI[adminLang];
  const [draft, setDraft] = useState<ProductRow | null>(product ? hydrateProductForEditor(product) : null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDraft(product ? hydrateProductForEditor(product) : null);
  }, [product]);

  if (!draft) return null;

  const specs = (code: LocaleCode): ProductSpecs => ({
    ...EMPTY_SPECS,
    ...(code === "en"
      ? draft.specs_en
      : code === "fr"
        ? draft.specs_fr
        : code === "ar"
          ? draft.specs_ar
          : draft.specs_ru),
  });

  const setSpec = (code: LocaleCode, key: keyof ProductSpecs, value: string) =>
    setDraft((prev) => {
      if (!prev) return prev;
      const specKey = `specs_${code}` as const;
      const currentSpecs = { ...EMPTY_SPECS, ...(prev[specKey] ?? {}) };
      return {
        ...prev,
        [specKey]: { ...currentSpecs, [key]: value },
      };
    });

  const setLocaleField = (code: LocaleCode, field: "name" | "intro" | "description", value: string) =>
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [`${field}_${code}`]: value,
      };
    });

  const localeFields = (code: LocaleCode) => ({
    name:
      code === "en"
        ? draft.name_en
        : code === "fr"
          ? draft.name_fr ?? ""
          : code === "ar"
            ? draft.name_ar
            : draft.name_ru ?? "",
    intro:
      code === "en"
        ? draft.intro_en
        : code === "fr"
          ? draft.intro_fr ?? ""
          : code === "ar"
            ? draft.intro_ar
            : draft.intro_ru ?? "",
    description:
      code === "en"
        ? draft.description_en
        : code === "fr"
          ? draft.description_fr ?? ""
          : code === "ar"
            ? draft.description_ar
            : draft.description_ru ?? "",
  });

  const toggleSpecVisible = (key: keyof ProductSpecs) =>
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            hidden_specs: prev.hidden_specs.includes(key)
              ? prev.hidden_specs.filter((k) => k !== key)
              : [...prev.hidden_specs, key],
          }
        : prev,
    );

  const onMainImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    const { url, error } = await uploadProductImage(file);
    setBusy(false);
    if (error || !url) return toast.error(error ?? ui.uploadFailed);
    setDraft((prev) => (prev ? { ...prev, main_image: url } : prev));
    toast.success(ui.imageUploaded);
  };

  const onGalleryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setBusy(true);
    const results = await Promise.all(files.map(uploadProductImage));
    setBusy(false);
    const urls = results.map((r) => r.url).filter(Boolean) as string[];
    const err = results.find((r) => r.error)?.error;
    if (!urls.length) return toast.error(err ?? ui.uploadFailed);
    if (err) toast.warning(err);
    setDraft((prev) => (prev ? { ...prev, gallery: [...prev.gallery, ...urls] } : prev));
    toast.success(ui.galleryUploaded);
  };

  const save = async () => {
    const name = draft.name_en.trim();
    if (!name) return toast.error(ui.nameRequired);
    setBusy(true);
    const error = await saveProduct({ ...draft, name_en: name, slug: draft.slug || slugify(name) });
    setBusy(false);
    if (error) return toast.error(error);
    toast.success(ui.saved);
    onOpenChange(false);
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{draft.id ? ui.editProduct : ui.addProduct}</DialogTitle>
          <DialogDescription>{ui.subtitle}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{ui.type}</Label>
            <Select
              value={draft.trade}
              onValueChange={(v) => {
                const newTrade = v as ProductRow["trade"];
                const currentCat = categories.find((c) => c.id === draft.category_id);
                const matchingCat =
                  currentCat && currentCat.trade === newTrade
                    ? currentCat
                    : categories.find((c) => c.trade === newTrade);
                setDraft({
                  ...draft,
                  trade: newTrade,
                  category_id: matchingCat ? matchingCat.id : draft.category_id,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="export">{ui.exportProducts}</SelectItem>
                <SelectItem value="import">{ui.importProducts}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{ui.category}</Label>
            <Select
              value={draft.category_id ?? ""}
              onValueChange={(v) => {
                const chosen = categories.find((c) => c.id === v);
                setDraft({
                  ...draft,
                  category_id: v,
                  trade: chosen ? chosen.trade : draft.trade,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={ui.selectCategory} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {categoryName(c, adminLang) || c.name_en} ({c.trade === "import" ? ui.importShort : ui.exportShort})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{ui.slug}</Label>
            <Input
              value={draft.slug}
              placeholder={slugify(draft.name_en) || "product-slug"}
              onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value) })}
            />
          </div>
          <div className="flex items-end gap-3 pb-1">
            <Switch checked={draft.published} onCheckedChange={(v) => setDraft({ ...draft, published: v })} />
            <Label>{draft.published ? ui.published : ui.draft}</Label>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{ui.mainImage}</Label>
            <div className="flex items-center gap-3">
              <img
                src={productImage(draft)}
                alt=""
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.fbApplied) {
                    target.dataset.fbApplied = "1";
                    target.src = productFallbackImage(draft);
                  }
                }}
                className="h-16 w-16 rounded-md border object-cover"
              />
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-accent">
                <Upload className="h-4 w-4" /> {ui.upload}
                <input type="file" accept="image/*" className="hidden" onChange={onMainImage} />
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <Label>
              {ui.gallery} ({draft.gallery.length})
            </Label>
            <div className="flex flex-wrap items-center gap-2">
              {draft.gallery.map((g, i) => (
                <button
                  key={g + i}
                  type="button"
                  title={ui.remove}
                  onClick={() => setDraft({ ...draft, gallery: draft.gallery.filter((_, x) => x !== i) })}
                  className="relative h-10 w-10 overflow-hidden rounded border"
                >
                  <img
                    src={g}
                    alt=""
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.fbApplied) {
                        target.dataset.fbApplied = "1";
                        target.src = productFallbackImage(draft);
                      }
                    }}
                    className="h-full w-full object-cover"
                  />
                  <X className="absolute right-0 top-0 h-3 w-3 bg-background/80 text-destructive" />
                </button>
              ))}
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-accent">
                <Upload className="h-4 w-4" /> {ui.add}
                <input type="file" accept="image/*" multiple className="hidden" onChange={onGalleryImage} />
              </label>
            </div>
          </div>
        </div>

        <Tabs defaultValue="en" className="mt-2">
          <TabsList className="grid w-full grid-cols-4 sm:inline-flex sm:w-auto">
            {LOCALE_TABS.map((tab) => (
              <TabsTrigger key={tab.code} value={tab.code}>
                {tab.trigger}
              </TabsTrigger>
            ))}
          </TabsList>
          {LOCALE_TABS.map((tab) => {
            const f = localeFields(tab.code);
            return (
              <TabsContent key={tab.code} value={tab.code} className="space-y-4 pt-4" dir={tab.dir}>
                <div className="space-y-2">
                  <Label>{tab.nameLabel}</Label>
                  <Input value={f.name} onChange={(e) => setLocaleField(tab.code, "name", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{tab.introLabel}</Label>
                  <Textarea rows={2} value={f.intro} onChange={(e) => setLocaleField(tab.code, "intro", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{tab.descLabel}</Label>
                  <Textarea
                    rows={4}
                    value={f.description}
                    onChange={(e) => setLocaleField(tab.code, "description", e.target.value)}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {SPEC_KEYS.map((key) => {
                    const hidden = draft.hidden_specs.includes(key);
                    return (
                      <div key={key} className="space-y-1.5 rounded-md border border-border p-3">
                        <div className="flex items-center justify-between gap-2">
                          <Label className="text-xs">{SPEC_LABELS[tab.code][key]}</Label>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground">
                              {hidden ? tab.hiddenLabel : tab.shownLabel}
                            </span>
                            <Switch checked={!hidden} onCheckedChange={() => toggleSpecVisible(key)} />
                          </div>
                        </div>
                        <Input
                          value={specs(tab.code)[key]}
                          disabled={hidden}
                          onChange={(e) => setSpec(tab.code, key, e.target.value)}
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {ui.cancel}
          </Button>
          <Button onClick={save} disabled={busy}>
            {busy ? ui.saving : ui.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
