import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, ExternalLink, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminLang, type AdminLang } from "@/lib/admin-i18n";
import { toast } from "sonner";
import { ProductDialog } from "@/components/admin/ProductDialog";
import {
  blankProduct,
  categoryName,
  deleteProduct,
  listAllProducts,
  listCategories,
  localized,
  productFallbackImage,
  productImage,
  saveOrder,
  setProductPublished,
  type ProductCategory,
  type ProductRow,
  type Trade,
} from "@/lib/products-db";

export const Route = createFileRoute("/admin/_authed/products")({
  component: ProductsPage,
});

const PROD_UI: Record<
  AdminLang,
  {
    needCategory: string;
    exportTab: string;
    importTab: string;
    order: string;
    image: string;
    name: string;
    category: string;
    pageUrl: string;
    status: string;
    actions: string;
    empty: string;
    published: string;
    draft: string;
    deleted: string;
  }
> = {
  en: {
    needCategory: "Create a category first, then add products to it.",
    exportTab: "Export Products",
    importTab: "Import Products",
    order: "Order",
    image: "Image",
    name: "Name",
    category: "Category",
    pageUrl: "Page URL",
    status: "Status",
    actions: "Actions",
    empty: "No products here yet.",
    published: "Published",
    draft: "Draft",
    deleted: "Deleted",
  },
  fr: {
    needCategory: "Créez d'abord une catégorie, puis ajoutez-y des produits.",
    exportTab: "Produits d'Export",
    importTab: "Produits d'Import",
    order: "Ordre",
    image: "Image",
    name: "Nom",
    category: "Catégorie",
    pageUrl: "URL",
    status: "Statut",
    actions: "Actions",
    empty: "Aucun produit pour le moment.",
    published: "Publié",
    draft: "Brouillon",
    deleted: "Supprimé",
  },
  ar: {
    needCategory: "أنشئ تصنيفاً أولاً، ثم أضف المنتجات إليه.",
    exportTab: "منتجات التصدير",
    importTab: "منتجات الاستيراد",
    order: "الترتيب",
    image: "الصورة",
    name: "الاسم",
    category: "التصنيف",
    pageUrl: "الرابط",
    status: "الحالة",
    actions: "إجراءات",
    empty: "لا توجد منتجات هنا بعد.",
    published: "منشور",
    draft: "مسودة",
    deleted: "تم الحذف",
  },
  ru: {
    needCategory: "Сначала создайте категорию, а затем добавьте в неё товары.",
    exportTab: "Экспорт",
    importTab: "Импорт",
    order: "Порядок",
    image: "Фото",
    name: "Название",
    category: "Категория",
    pageUrl: "URL",
    status: "Статус",
    actions: "Действия",
    empty: "Товаров пока нет.",
    published: "Опубликован",
    draft: "Черновик",
    deleted: "Удалено",
  },
};

function ProductsPage() {
  const { t, lang } = useAdminLang();
  const ui = PROD_UI[lang];
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [cats, setCats] = useState<ProductCategory[]>([]);
  const [tab, setTab] = useState<Trade>("export");
  const [draft, setDraft] = useState<ProductRow | null>(null);
  const [open, setOpen] = useState(false);

  const refresh = async () => {
    const [p, c] = await Promise.all([listAllProducts(), listCategories()]);
    setRows(p);
    setCats(c);
  };
  useEffect(() => {
    refresh();
  }, []);

  const visible = rows.filter((r) => r.trade === tab);
  const catName = (id: string | null) => {
    const cat = cats.find((c) => c.id === id);
    return cat ? categoryName(cat, lang) || cat.name_en : "—";
  };

  const openNew = () => {
    const matchingCat = cats.find((c) => c.trade === tab) ?? cats[0] ?? null;
    const item = blankProduct(tab, matchingCat?.id ?? null);
    item.sort_order = visible.length + 1;
    setDraft(item);
    setOpen(true);
  };
  const openEdit = (p: ProductRow) => {
    setDraft({ ...p });
    setOpen(true);
  };

  const remove = async (p: ProductRow) => {
    const error = await deleteProduct(p.id);
    if (error) return toast.error(error);
    toast.success(ui.deleted);
    await refresh();
  };

  const togglePublish = async (p: ProductRow) => {
    setRows((rs) => rs.map((r) => (r.id === p.id ? { ...r, published: !r.published } : r)));
    const error = await setProductPublished(p.id, !p.published);
    if (error) {
      toast.error(error);
      await refresh();
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= visible.length) return;
    const group = [...visible];
    [group[index], group[target]] = [group[target], group[index]];
    const ordered = group.map((r, i) => ({ ...r, sort_order: i + 1 }));
    setRows((rs) => rs.map((r) => ordered.find((o) => o.id === r.id) ?? r));
    const error = await saveOrder(ordered.map((r) => ({ id: r.id, sort_order: r.sort_order })));
    if (error) {
      toast.error(error);
      await refresh();
    }
  };

  return (
    <div>
      <PageHeader
        title={t("nav.products")}
        description={t("products.desc")}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="gap-2">
              <Link to="/admin/categories">
                <Tags className="h-4 w-4" /> {t("nav.categories")}
              </Link>
            </Button>
            <Button onClick={openNew} className="gap-2" disabled={cats.length === 0}>
              <Plus className="h-4 w-4" /> {t("products.add")}
            </Button>
          </div>
        }
      />

      {cats.length === 0 && (
        <Card className="mb-4 rounded-2xl border-border/60 p-4 text-sm text-muted-foreground">
          {ui.needCategory}
        </Card>
      )}

      <Tabs value={tab} onValueChange={(v) => setTab(v as Trade)} className="mb-4">
        <TabsList>
          <TabsTrigger value="export">
            {ui.exportTab} ({rows.filter((r) => r.trade === "export").length})
          </TabsTrigger>
          <TabsTrigger value="import">
            {ui.importTab} ({rows.filter((r) => r.trade === "import").length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="rounded-2xl border-border/60 p-4 shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">{ui.order}</TableHead>
                <TableHead>{ui.image}</TableHead>
                <TableHead>{ui.name}</TableHead>
                <TableHead>{ui.category}</TableHead>
                <TableHead>{ui.pageUrl}</TableHead>
                <TableHead>{ui.status}</TableHead>
                <TableHead className="text-right">{ui.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    {ui.empty}
                  </TableCell>
                </TableRow>
              )}
              {visible.map((p, i) => {
                const displayName = localized(p, lang).name || p.name_en;
                return (
                  <TableRow key={p.id}>
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
                          disabled={i === visible.length - 1}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <img
                        src={productImage(p)}
                        alt={displayName}
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset.fbApplied) {
                            target.dataset.fbApplied = "1";
                            target.src = productFallbackImage(p);
                          }
                        }}
                        className="h-12 w-12 rounded-md border object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>{displayName}</div>
                      {lang !== "en" && p.name_en && displayName !== p.name_en && (
                        <div className="text-xs font-normal text-muted-foreground">{p.name_en}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{catName(p.category_id)}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">/products/{p.slug}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch checked={p.published} onCheckedChange={() => togglePublish(p)} />
                        <span className="text-sm text-muted-foreground">
                          {p.published ? ui.published : ui.draft}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(p)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button asChild size="icon" variant="ghost">
                          <Link to="/products/$slug" params={{ slug: p.slug }} target="_blank">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => remove(p)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      <ProductDialog
        open={open}
        onOpenChange={setOpen}
        product={draft}
        categories={cats}
        onSaved={refresh}
      />
    </div>
  );
}
