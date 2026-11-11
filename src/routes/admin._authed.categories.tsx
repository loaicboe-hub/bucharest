import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminLang, type AdminLang } from "@/lib/admin-i18n";
import { toast } from "sonner";
import {
  categoryName,
  deleteCategory,
  hydrateCategoryForEditor,
  listCategories,
  saveCategory,
  slugify,
  type ProductCategory,
} from "@/lib/products-db";

export const Route = createFileRoute("/admin/_authed/categories")({
  component: CategoriesPage,
});

const blank = (order: number): ProductCategory => ({
  id: "",
  slug: "",
  name_en: "",
  name_fr: "",
  name_ar: "",
  name_ru: "",
  sort_order: order,
  active: true,
  trade: "export",
});

const CAT_UI: Record<
  AdminLang,
  {
    order: string;
    english: string;
    french: string;
    arabic: string;
    russian: string;
    type: string;
    slug: string;
    visible: string;
    actions: string;
    empty: string;
    exportProducts: string;
    importProducts: string;
    editCategory: string;
    addCategory: string;
    visibleOnSite: string;
    cancel: string;
    save: string;
    saving: string;
    nameRequired: string;
    saved: string;
    deleted: string;
  }
> = {
  en: {
    order: "Order",
    english: "English",
    french: "Français",
    arabic: "العربية",
    russian: "Русский",
    type: "Type",
    slug: "Slug",
    visible: "Visible",
    actions: "Actions",
    empty: "No categories yet.",
    exportProducts: "Export Products",
    importProducts: "Import Products",
    editCategory: "Edit category",
    addCategory: "Add category",
    visibleOnSite: "Visible on the website",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving...",
    nameRequired: "English name is required",
    saved: "Category saved",
    deleted: "Deleted",
  },
  fr: {
    order: "Ordre",
    english: "English",
    french: "Français",
    arabic: "العربية",
    russian: "Русский",
    type: "Type",
    slug: "Slug",
    visible: "Visible",
    actions: "Actions",
    empty: "Aucune catégorie pour le moment.",
    exportProducts: "Produits d'Export",
    importProducts: "Produits d'Import",
    editCategory: "Modifier la catégorie",
    addCategory: "Ajouter une catégorie",
    visibleOnSite: "Visible sur le site web",
    cancel: "Annuler",
    save: "Enregistrer",
    saving: "Enregistrement...",
    nameRequired: "Le nom en anglais est requis",
    saved: "Catégorie enregistrée",
    deleted: "Supprimée",
  },
  ar: {
    order: "الترتيب",
    english: "English",
    french: "Français",
    arabic: "العربية",
    russian: "Русский",
    type: "النوع",
    slug: "الرابط",
    visible: "ظاهر",
    actions: "إجراءات",
    empty: "لا توجد تصنيفات بعد.",
    exportProducts: "منتجات التصدير",
    importProducts: "منتجات الاستيراد",
    editCategory: "تعديل التصنيف",
    addCategory: "إضافة تصنيف",
    visibleOnSite: "ظاهر على الموقع",
    cancel: "إلغاء",
    save: "حفظ",
    saving: "جاري الحفظ...",
    nameRequired: "الاسم بالإنجليزية مطلوب",
    saved: "تم حفظ التصنيف",
    deleted: "تم الحذف",
  },
  ru: {
    order: "Порядок",
    english: "English",
    french: "Français",
    arabic: "العربية",
    russian: "Русский",
    type: "Тип",
    slug: "Slug",
    visible: "Видима",
    actions: "Действия",
    empty: "Категорий пока нет.",
    exportProducts: "Экспорт",
    importProducts: "Импорт",
    editCategory: "Редактировать категорию",
    addCategory: "Добавить категорию",
    visibleOnSite: "Отображается на сайте",
    cancel: "Отмена",
    save: "Сохранить",
    saving: "Сохранение...",
    nameRequired: "Название на английском обязательно",
    saved: "Категория сохранена",
    deleted: "Удалено",
  },
};

function CategoriesPage() {
  const { t, lang } = useAdminLang();
  const ui = CAT_UI[lang];
  const [rows, setRows] = useState<ProductCategory[]>([]);
  const [draft, setDraft] = useState<ProductCategory | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const refresh = async () => setRows(await listCategories());
  useEffect(() => {
    refresh();
  }, []);

  const openNew = () => {
    setDraft(blank(rows.length + 1));
    setOpen(true);
  };
  const openEdit = (c: ProductCategory) => {
    setDraft(hydrateCategoryForEditor(c));
    setOpen(true);
  };

  const save = async () => {
    if (!draft) return;
    if (!draft.name_en.trim()) return toast.error(ui.nameRequired);
    setBusy(true);
    const error = await saveCategory({ ...draft, slug: draft.slug || slugify(draft.name_en) });
    setBusy(false);
    if (error) return toast.error(error);
    toast.success(ui.saved);
    setOpen(false);
    await refresh();
  };

  const remove = async (c: ProductCategory) => {
    const error = await deleteCategory(c.id);
    if (error) return toast.error(error);
    toast.success(ui.deleted);
    await refresh();
  };

  const toggleActive = async (c: ProductCategory) => {
    setRows((rs) => rs.map((r) => (r.id === c.id ? { ...r, active: !r.active } : r)));
    const error = await saveCategory({ ...c, active: !c.active });
    if (error) {
      toast.error(error);
      await refresh();
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    const ordered = next.map((r, i) => ({ ...r, sort_order: i + 1 }));
    setRows(ordered);
    const errs = await Promise.all(ordered.map((c) => saveCategory(c)));
    const firstErr = errs.find(Boolean);
    if (firstErr) {
      toast.error(firstErr);
      await refresh();
    }
  };

  return (
    <div>
      <PageHeader
        title={t("categories.title")}
        description={t("categories.desc")}
        actions={
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" /> {t("categories.add")}
          </Button>
        }
      />
      <Card className="rounded-2xl border-border/60 p-4 shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">{ui.order}</TableHead>
                <TableHead>{ui.english}</TableHead>
                <TableHead>{ui.french}</TableHead>
                <TableHead>{ui.arabic}</TableHead>
                <TableHead>{ui.russian}</TableHead>
                <TableHead>{ui.type}</TableHead>
                <TableHead>{ui.slug}</TableHead>
                <TableHead>{ui.visible}</TableHead>
                <TableHead className="text-right">{ui.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                    {ui.empty}
                  </TableCell>
                </TableRow>
              )}
              {rows.map((c, i) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <button
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => move(i, 1)}
                        disabled={i === rows.length - 1}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{categoryName(c, "en") || "—"}</TableCell>
                  <TableCell>{categoryName(c, "fr") || "—"}</TableCell>
                  <TableCell dir="rtl">{categoryName(c, "ar") || "—"}</TableCell>
                  <TableCell>{categoryName(c, "ru") || "—"}</TableCell>
                  <TableCell className="text-sm">
                    {c.trade === "import" ? ui.importProducts : ui.exportProducts}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.slug}</TableCell>
                  <TableCell>
                    <Switch checked={c.active} onCheckedChange={() => toggleActive(c)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(c)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{draft?.id ? ui.editCategory : ui.addCategory}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>English name</Label>
                <Input
                  value={draft.name_en}
                  onChange={(e) => setDraft({ ...draft, name_en: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nom (Français)</Label>
                <Input
                  value={draft.name_fr ?? ""}
                  onChange={(e) => setDraft({ ...draft, name_fr: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>الاسم بالعربية</Label>
                <Input
                  dir="rtl"
                  value={draft.name_ar}
                  onChange={(e) => setDraft({ ...draft, name_ar: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Название (Русский)</Label>
                <Input
                  value={draft.name_ru ?? ""}
                  onChange={(e) => setDraft({ ...draft, name_ru: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{ui.type}</Label>
                <Select
                  value={draft.trade}
                  onValueChange={(v) => setDraft({ ...draft, trade: v as ProductCategory["trade"] })}
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
                <Label>{ui.slug}</Label>
                <Input
                  value={draft.slug}
                  placeholder={slugify(draft.name_en) || "category-slug"}
                  onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={draft.active} onCheckedChange={(v) => setDraft({ ...draft, active: v })} />
                <Label>{ui.visibleOnSite}</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {ui.cancel}
            </Button>
            <Button onClick={save} disabled={busy}>
              {busy ? ui.saving : ui.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
