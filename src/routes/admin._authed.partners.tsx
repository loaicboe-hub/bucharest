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
import { useAdminLang, type AdminLang } from "@/lib/admin-i18n";
import {
  blankPartner,
  deletePartner,
  listPartners,
  savePartner,
  savePartnerOrder,
  setPartnerEnabled,
  uploadPartnerLogo,
  type Partner,
} from "@/lib/admin-partners";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/_authed/partners")({
  component: PartnersPage,
});

const PARTNERS_UI: Record<
  AdminLang,
  {
    addPartner: string;
    editPartner: string;
    logo: string;
    name: string;
    website: string;
    websiteOpt: string;
    enabled: string;
    actions: string;
    empty: string;
    noLogo: string;
    upload: string;
    cancel: string;
    save: string;
    needLogo: string;
    saved: string;
    deleted: string;
    uploadFailed: string;
  }
> = {
  en: {
    addPartner: "Add Partner",
    editPartner: "Edit Partner",
    logo: "Logo",
    name: "Name",
    website: "Website",
    websiteOpt: "Website URL (optional)",
    enabled: "Enabled",
    actions: "Actions",
    empty: "No partners yet",
    noLogo: "No logo",
    upload: "Upload",
    cancel: "Cancel",
    save: "Save",
    needLogo: "Please upload a logo",
    saved: "Partner saved",
    deleted: "Deleted",
    uploadFailed: "Upload failed",
  },
  fr: {
    addPartner: "Ajouter un partenaire",
    editPartner: "Modifier le partenaire",
    logo: "Logo",
    name: "Nom",
    website: "Site web",
    websiteOpt: "URL du site (optionnel)",
    enabled: "Activé",
    actions: "Actions",
    empty: "Aucun partenaire pour le moment",
    noLogo: "Aucun logo",
    upload: "Télécharger",
    cancel: "Annuler",
    save: "Enregistrer",
    needLogo: "Veuillez télécharger un logo",
    saved: "Partenaire enregistré",
    deleted: "Supprimé",
    uploadFailed: "Échec du téléchargement",
  },
  ar: {
    addPartner: "إضافة شريك",
    editPartner: "تعديل الشريك",
    logo: "الشعار",
    name: "الاسم",
    website: "الرابط",
    websiteOpt: "رابط الموقع (اختياري)",
    enabled: "مفعّل",
    actions: "إجراءات",
    empty: "لا يوجد شركاء بعد",
    noLogo: "لا يوجد شعار",
    upload: "رفع",
    cancel: "إلغاء",
    save: "حفظ",
    needLogo: "الرجاء رفع شعار",
    saved: "تم حفظ الشريك",
    deleted: "تم الحذف",
    uploadFailed: "فشل الرفع",
  },
  ru: {
    addPartner: "Добавить партнёра",
    editPartner: "Редактировать партнёра",
    logo: "Логотип",
    name: "Название",
    website: "Сайт",
    websiteOpt: "URL сайта (необязательно)",
    enabled: "Включён",
    actions: "Действия",
    empty: "Партнёров пока нет",
    noLogo: "Нет логотипа",
    upload: "Загрузить",
    cancel: "Отмена",
    save: "Сохранить",
    needLogo: "Пожалуйста, загрузите логотип",
    saved: "Партнёр сохранён",
    deleted: "Удалено",
    uploadFailed: "Ошибка загрузки",
  },
};

function PartnersPage() {
  const { t, lang } = useAdminLang();
  const ui = PARTNERS_UI[lang];
  const [rows, setRows] = useState<Partner[]>([]);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = () => listPartners().then(setRows).catch(() => undefined);

  useEffect(() => {
    refresh();
  }, []);

  const openNew = () => {
    setEditing(blankPartner(rows.length + 1));
    setOpen(true);
  };
  const openEdit = (p: Partner) => {
    setEditing({ ...p });
    setOpen(true);
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.logo) {
      toast.error(ui.needLogo);
      return;
    }
    setBusy(true);
    const err = await savePartner(editing);
    setBusy(false);
    if (err) {
      toast.error(err);
      return;
    }
    setOpen(false);
    await refresh();
    toast.success(ui.saved);
  };

  const remove = async (id: string) => {
    const err = await deletePartner(id);
    if (err) return toast.error(err);
    await refresh();
    toast.success(ui.deleted);
  };

  const toggle = async (id: string, enabled: boolean) => {
    setRows((list) => list.map((r) => (r.id === id ? { ...r, enabled } : r)));
    const err = await setPartnerEnabled(id, enabled);
    if (err) {
      toast.error(err);
      refresh();
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= rows.length) return;
    const list = [...rows];
    const [item] = list.splice(index, 1);
    list.splice(next, 0, item);
    const ordered = list.map((r, i) => ({ ...r, sortOrder: i + 1 }));
    setRows(ordered);
    await savePartnerOrder(ordered.map((r) => ({ id: r.id, sortOrder: r.sortOrder })));
  };

  const onFile = async (file?: File) => {
    if (!file || !editing) return;
    setBusy(true);
    const res = await uploadPartnerLogo(file);
    setBusy(false);
    if (res.error || !res.url) {
      toast.error(res.error ?? ui.uploadFailed);
      return;
    }
    setEditing((e) => (e ? { ...e, logo: res.url!, logoPath: res.path ?? "" } : e));
  };

  return (
    <div>
      <PageHeader
        title={t("nav.partners")}
        description={t("partners.desc")}
        actions={
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" /> {ui.addPartner}
          </Button>
        }
      />
      <Card className="rounded-2xl border-border/60 p-4 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">{ui.logo}</TableHead>
              <TableHead>{ui.name}</TableHead>
              <TableHead>{ui.website}</TableHead>
              <TableHead>{ui.enabled}</TableHead>
              <TableHead className="text-right">{ui.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  {ui.empty}
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
            <DialogTitle>{editing?.id ? ui.editPartner : ui.addPartner}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{ui.name}</Label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{ui.websiteOpt}</Label>
                <Input
                  value={editing.url ?? ""}
                  placeholder="https://"
                  onChange={(e) => setEditing({ ...editing, url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{ui.logo}</Label>
                <div className="flex items-center gap-3">
                  <div className="flex h-16 w-32 items-center justify-center rounded-lg border border-border/60 bg-muted/30">
                    {editing.logo ? (
                      <img src={editing.logo} alt="" className="h-full w-full object-contain p-1" />
                    ) : (
                      <span className="text-xs text-muted-foreground">{ui.noLogo}</span>
                    )}
                  </div>
                  <Button variant="outline" className="gap-2" disabled={busy} onClick={() => fileRef.current?.click()}>
                    <Upload className="h-4 w-4" /> {ui.upload}
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
                <Label>{ui.enabled}</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {ui.cancel}
            </Button>
            <Button onClick={save} disabled={busy}>
              {ui.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
