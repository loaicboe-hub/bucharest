import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminLang } from "@/lib/admin-i18n";
import { loadPartners, savePartners, type Partner } from "@/lib/admin-partners";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/_authed/partners")({
  component: PartnersPage,
});

function PartnersPage() {
  const { t, lang } = useAdminLang();
  const [rows, setRows] = useState<Partner[]>([]);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const ar = lang === "ar";

  useEffect(() => setRows(loadPartners()), []);

  const commit = (list: Partner[]) => {
    setRows(list);
    savePartners(list);
  };

  const openNew = () => {
    setEditing({ id: `p_${Date.now()}`, name: "", logo: "", url: "", enabled: true });
    setOpen(true);
  };
  const openEdit = (p: Partner) => {
    setEditing({ ...p });
    setOpen(true);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.logo) {
      toast.error(ar ? "الرجاء رفع شعار" : "Please upload a logo");
      return;
    }
    const exists = rows.some((r) => r.id === editing.id);
    commit(exists ? rows.map((r) => (r.id === editing.id ? editing : r)) : [...rows, editing]);
    setOpen(false);
    toast.success(ar ? "تم حفظ الشريك" : "Partner saved");
  };

  const remove = (id: string) => {
    commit(rows.filter((r) => r.id !== id));
    toast.success(ar ? "تم الحذف" : "Deleted");
  };

  const toggle = (id: string, enabled: boolean) => {
    commit(rows.map((r) => (r.id === id ? { ...r, enabled } : r)));
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= rows.length) return;
    const list = [...rows];
    const [item] = list.splice(index, 1);
    list.splice(next, 0, item);
    commit(list);
  };

  const onFile = (file?: File) => {
    if (!file || !editing) return;
    const reader = new FileReader();
    reader.onload = () => setEditing({ ...editing, logo: String(reader.result) });
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <PageHeader
        title={t("nav.partners")}
        description={t("partners.desc")}
        actions={
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" /> {ar ? "إضافة شريك" : "Add Partner"}
          </Button>
        }
      />
      <Card className="rounded-2xl border-border/60 p-4 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">{ar ? "الشعار" : "Logo"}</TableHead>
              <TableHead>{ar ? "الاسم" : "Name"}</TableHead>
              <TableHead>{ar ? "الرابط" : "Website"}</TableHead>
              <TableHead>{ar ? "مفعّل" : "Enabled"}</TableHead>
              <TableHead className="text-right">{ar ? "إجراءات" : "Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  {ar ? "لا يوجد شركاء بعد" : "No partners yet"}
                </TableCell>
              </TableRow>
            )}
            {rows.map((p, i) => (
              <TableRow key={p.id}>
                <TableCell>
                  <img src={p.logo} alt={p.name} className="h-10 w-24 rounded bg-muted/40 object-contain" />
                </TableCell>
                <TableCell className="font-medium">{p.name || "—"}</TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground">{p.url || "—"}</TableCell>
                <TableCell>
                  <Switch checked={p.enabled} onCheckedChange={(v) => toggle(p.id, v)} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" disabled={i === 0} onClick={() => move(i, -1)}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" disabled={i === rows.length - 1} onClick={() => move(i, 1)}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(p)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(p.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing && rows.some((r) => r.id === editing.id)
                ? ar ? "تعديل شريك" : "Edit Partner"
                : ar ? "إضافة شريك" : "Add Partner"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{ar ? "الاسم" : "Name"}</Label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{ar ? "رابط الموقع (اختياري)" : "Website URL (optional)"}</Label>
                <Input
                  value={editing.url ?? ""}
                  placeholder="https://"
                  onChange={(e) => setEditing({ ...editing, url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{ar ? "الشعار" : "Logo"}</Label>
                <div className="flex items-center gap-3">
                  <div className="flex h-16 w-32 items-center justify-center rounded-lg border border-border/60 bg-muted/30">
                    {editing.logo ? (
                      <img src={editing.logo} alt="" className="h-full w-full object-contain p-1" />
                    ) : (
                      <span className="text-xs text-muted-foreground">{ar ? "لا يوجد" : "No logo"}</span>
                    )}
                  </div>
                  <Button variant="outline" className="gap-2" onClick={() => fileRef.current?.click()}>
                    <Upload className="h-4 w-4" /> {ar ? "رفع" : "Upload"}
                  </Button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onFile(e.target.files?.[0])}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={editing.enabled} onCheckedChange={(v) => setEditing({ ...editing, enabled: v })} />
                <Label>{ar ? "مفعّل" : "Enabled"}</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {ar ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={save}>{ar ? "حفظ" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
