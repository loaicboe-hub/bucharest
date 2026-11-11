import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, ExternalLink, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminLang } from "@/lib/admin-i18n";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { ProductDialog } from "@/components/admin/ProductDialog";
import {
  blankProduct,
  deleteProduct,
  listAllProducts,
  listCategories,
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

function ProductsPage() {
  const { t } = useAdminLang();
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
  useEffect(() => { refresh(); }, []);

  const visible = rows.filter((r) => r.trade === tab);
  const catName = (id: string | null) => cats.find((c) => c.id === id)?.name_en ?? "—";

  const openNew = () => {
    const matchingCat = cats.find((c) => c.trade === tab) ?? cats[0] ?? null;
    const item = blankProduct(tab, matchingCat?.id ?? null);
    item.sort_order = visible.length + 1;
    setDraft(item);
    setOpen(true);
  };
  const openEdit = (p: ProductRow) => { setDraft({ ...p }); setOpen(true); };

  const remove = async (p: ProductRow) => {
    const error = await deleteProduct(p.id);
    if (error) return toast.error(error);
    toast.success("Deleted");
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
              <Link to="/admin/categories"><Tags className="h-4 w-4" /> {t("nav.categories")}</Link>
            </Button>
            <Button onClick={openNew} className="gap-2" disabled={cats.length === 0}>
              <Plus className="h-4 w-4" /> {t("products.add")}
            </Button>
          </div>
        }
      />

      {cats.length === 0 && (
        <Card className="mb-4 rounded-2xl border-border/60 p-4 text-sm text-muted-foreground">
          Create a category first, then add products to it.
        </Card>
      )}

      <Tabs value={tab} onValueChange={(v) => setTab(v as Trade)} className="mb-4">
        <TabsList>
          <TabsTrigger value="export">
            Export Products ({rows.filter((r) => r.trade === "export").length})
          </TabsTrigger>
          <TabsTrigger value="import">
            Import Products ({rows.filter((r) => r.trade === "import").length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="rounded-2xl border-border/60 p-4 shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Order</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Page URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    No products here yet.
                  </TableCell>
                </TableRow>
              )}
              {visible.map((p, i) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <button onClick={() => move(i, -1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                      <button onClick={() => move(i, 1)} disabled={i === visible.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <img
                      src={productImage(p)}
                      alt={p.name_en}
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
                  <TableCell className="font-medium">{p.name_en}</TableCell>
                  <TableCell><Badge variant="secondary">{catName(p.category_id)}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">/products/{p.slug}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={p.published} onCheckedChange={() => togglePublish(p)} />
                      <span className="text-sm text-muted-foreground">{p.published ? "Published" : "Draft"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                      <Button asChild size="icon" variant="ghost">
                        <Link to="/products/$slug" params={{ slug: p.slug }} target="_blank"><ExternalLink className="h-4 w-4" /></Link>
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(p)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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
