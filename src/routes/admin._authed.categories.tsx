import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminLang } from "@/lib/admin-i18n";
import { toast } from "sonner";
import {
  deleteCategory,
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
  name_ar: "",
  sort_order: order,
  active: true,
  trade: "export",
});

function CategoriesPage() {
  const { t } = useAdminLang();
  const [rows, setRows] = useState<ProductCategory[]>([]);
  const [draft, setDraft] = useState<ProductCategory | null>(null);
  const [open, setOpen] = useState(false);

  const refresh = async () => setRows(await listCategories());
  useEffect(() => { refresh(); }, []);

  const openNew = () => { setDraft(blank(rows.length + 1)); setOpen(true); };
  const openEdit = (c: ProductCategory) => { setDraft({ ...c }); setOpen(true); };

  const save = async () => {
    if (!draft) return;
    if (!draft.name_en.trim()) return toast.error("English name is required");
    const error = await saveCategory({ ...draft, slug: draft.slug || slugify(draft.name_en) });
    if (error) return toast.error(error);
    toast.success("Category saved");
    setOpen(false);
    refresh();
  };

  const remove = async (c: ProductCategory) => {
    const error = await deleteCategory(c.id);
    if (error) return toast.error(error);
    toast.success("Deleted");
    refresh();
  };

  const toggleActive = async (c: ProductCategory) => {
    setRows((rs) => rs.map((r) => (r.id === c.id ? { ...r, active: !r.active } : r)));
    await saveCategory({ ...c, active: !c.active });
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    const ordered = next.map((r, i) => ({ ...r, sort_order: i + 1 }));
    setRows(ordered);
    await Promise.all(ordered.map((c) => saveCategory(c)));
  };

  return (
    <div>
      <PageHeader
        title={t("categories.title")}
        description={t("categories.desc")}
        actions={<Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> {t("categories.add")}</Button>}
      />
      <Card className="rounded-2xl border-border/60 p-4 shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Order</TableHead>
                <TableHead>English name</TableHead>
                <TableHead>Arabic name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Visible</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    No categories yet.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((c, i) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <button onClick={() => move(i, -1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                      <button onClick={() => move(i, 1)} disabled={i === rows.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{c.name_en}</TableCell>
                  <TableCell dir="rtl">{c.name_ar}</TableCell>
                  <TableCell className="text-sm">
                    {c.trade === "import" ? "Import Products" : "Export Products"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.slug}</TableCell>
                  <TableCell><Switch checked={c.active} onCheckedChange={() => toggleActive(c)} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(c)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{draft?.id ? "Edit category" : "Add category"}</DialogTitle></DialogHeader>
          {draft && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>English name</Label>
                <Input value={draft.name_en} onChange={(e) => setDraft({ ...draft, name_en: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Arabic name</Label>
                <Input dir="rtl" value={draft.name_ar} onChange={(e) => setDraft({ ...draft, name_ar: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={draft.slug}
                  placeholder={slugify(draft.name_en) || "category-slug"}
                  onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={draft.active} onCheckedChange={(v) => setDraft({ ...draft, active: v })} />
                <Label>Visible on the website</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
