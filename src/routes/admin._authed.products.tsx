import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Upload, Globe, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/admin/PageHeader";
import { products as seed, type Product } from "@/lib/admin-mock-data";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { ProductContentDialog } from "@/components/admin/ProductContentDialog";
import { blankProduct, loadProductContent, type ProductContent } from "@/lib/product-content";
import { useEffect } from "react";

export const Route = createFileRoute("/admin/_authed/products")({
  component: ProductsPage,
});

function ProductsPage() {
  const [rows, setRows] = useState<Product[]>([...seed].sort((a, b) => a.order - b.order));
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Product["trade"]>("Export Products");
  const [content, setContent] = useState<ProductContent[]>([]);
  const [contentDraft, setContentDraft] = useState<ProductContent | null>(null);
  const [contentOpen, setContentOpen] = useState(false);

  const refreshContent = () => setContent(loadProductContent());
  useEffect(() => { refreshContent(); }, []);
  const websiteRows = content.filter((p) => p.trade === tab);
  const openWebsite = (p: ProductContent | null) => {
    setContentDraft(p ? { ...p } : blankProduct(tab));
    setContentOpen(true);
  };

  const visible = rows.filter((r) => r.trade === tab);

  const openNew = () => {
    setEditing({ id: `p_${Date.now()}`, name: "", category: "Fruits", trade: tab, description: "", image: "/placeholder.svg", order: rows.length + 1, published: true });
    setOpen(true);
  };
  const openEdit = (p: Product) => { setEditing({ ...p }); setOpen(true); };
  const save = () => {
    if (!editing) return;
    setRows((rs) => rs.some((r) => r.id === editing.id) ? rs.map((r) => r.id === editing.id ? editing : r) : [...rs, editing]);
    setOpen(false);
    toast.success("Product saved");
  };
  const remove = (id: string) => { setRows((rs) => rs.filter((r) => r.id !== id)); toast.success("Deleted"); };
  const move = (id: string, dir: -1 | 1) => {
    setRows((rs) => {
      const group = rs.filter((r) => r.trade === tab);
      const idx = group.findIndex((r) => r.id === id);
      const swap = idx + dir;
      if (idx < 0 || swap < 0 || swap >= group.length) return rs;
      [group[idx], group[swap]] = [group[swap], group[idx]];
      const ordered = group.map((r, i) => ({ ...r, order: i + 1 }));
      const byId = new Map(ordered.map((r) => [r.id, r]));
      let g = 0;
      return rs.map((r) => (r.trade === tab ? ordered[g++] ?? byId.get(r.id)! : r));
    });
  };
  const togglePublish = (id: string) => setRows((rs) => rs.map((r) => r.id === id ? { ...r, published: !r.published } : r));

  const onImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    const url = URL.createObjectURL(file);
    setEditing({ ...editing, image: url });
  };

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your product catalog and display order"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => openWebsite(null)} className="gap-2">
              <Globe className="h-4 w-4" /> Add Website Product
            </Button>
            <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Add Product</Button>
          </div>
        }
      />
      <Tabs value={tab} onValueChange={(v) => setTab(v as Product["trade"])} className="mb-4">
        <TabsList>
          <TabsTrigger value="Export Products">Export Products ({rows.filter((r) => r.trade === "Export Products").length})</TabsTrigger>
          <TabsTrigger value="Import Products">Import Products ({rows.filter((r) => r.trade === "Import Products").length})</TabsTrigger>
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
                <TableHead>Sub Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    No products in {tab} yet. Click “Add Product” to create one.
                  </TableCell>
                </TableRow>
              )}
              {visible.map((p, i) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <button onClick={() => move(p.id, -1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                      <button onClick={() => move(p.id, 1)} disabled={i === visible.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <img src={p.image} alt={p.name} className="h-12 w-12 rounded-md border object-cover" />
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell><Badge variant="secondary">{p.category}</Badge></TableCell>
                  <TableCell><Badge variant={p.trade === "Export Products" ? "default" : "outline"}>{p.trade}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={p.published} onCheckedChange={() => togglePublish(p.id)} />
                      <span className="text-sm text-muted-foreground">{p.published ? "Published" : "Draft"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="mt-6 rounded-2xl border-border/60 p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold">Website product information — {tab}</h2>
            <p className="text-sm text-muted-foreground">
              Edit the name, intro, description, specifications and images shown on the public product pages.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => openWebsite(null)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Website Product
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Page URL</TableHead>
                <TableHead>Group</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {websiteRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    No website products in {tab} yet.
                  </TableCell>
                </TableRow>
              )}
              {websiteRows.map((p) => (
                <TableRow key={p.slug}>
                  <TableCell><img src={p.main} alt={p.en.name} className="h-12 w-12 rounded-md border object-cover" /></TableCell>
                  <TableCell className="font-medium">{p.en.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">/products/{p.slug}</TableCell>
                  <TableCell><Badge variant="secondary">{p.group}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" className="gap-2" onClick={() => openWebsite(p)}>
                        <Pencil className="h-4 w-4" /> Edit info
                      </Button>
                      <Button asChild size="icon" variant="ghost">
                        <Link to="/products/$slug" params={{ slug: p.slug }} target="_blank"><ExternalLink className="h-4 w-4" /></Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <ProductContentDialog
        open={contentOpen}
        onOpenChange={setContentOpen}
        product={contentDraft}
        onSaved={refreshContent}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing && rows.some((r) => r.id === editing.id) ? "Edit Product" : "Add Product"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v as Product["category"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fruits">Fruits</SelectItem>
                    <SelectItem value="Vegetables">Vegetables</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sub Category</Label>
                <Select value={editing.trade} onValueChange={(v) => setEditing({ ...editing, trade: v as Product["trade"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Export Products">Export Products</SelectItem>
                    <SelectItem value="Import Products">Import Products</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Image</Label>
                <div className="flex items-center gap-3">
                  <img src={editing.image} alt="" className="h-16 w-16 rounded-md border object-cover" />
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent">
                    <Upload className="h-4 w-4" /> Upload
                    <input type="file" accept="image/*" onChange={onImage} className="hidden" />
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-2"><Switch checked={editing.published} onCheckedChange={(v) => setEditing({ ...editing, published: v })} /><Label>Published</Label></div>
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
