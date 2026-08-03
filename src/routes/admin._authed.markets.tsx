import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminLang } from "@/lib/admin-i18n";
import { markets as seed, type Market } from "@/lib/admin-mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/_authed/markets")({
  component: MarketsPage,
});

function MarketsPage() {
  const { t } = useAdminLang();
  const [rows, setRows] = useState<Market[]>(seed);
  const [editing, setEditing] = useState<Market | null>(null);
  const [open, setOpen] = useState(false);

  const openNew = () => { setEditing({ id: `m_${Date.now()}`, country: "", region: "", volume: "Medium" }); setOpen(true); };
  const openEdit = (m: Market) => { setEditing({ ...m }); setOpen(true); };
  const save = () => {
    if (!editing) return;
    setRows((rs) => rs.some((r) => r.id === editing.id) ? rs.map((r) => r.id === editing.id ? editing : r) : [...rs, editing]);
    setOpen(false);
    toast.success("Market saved");
  };
  const remove = (id: string) => { setRows((rs) => rs.filter((r) => r.id !== id)); toast.success("Deleted"); };

  return (
    <div>
      <PageHeader
        title={t("nav.markets")}
        description={t("markets.desc")}
        actions={<Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Add Market</Button>}
      />
      <Card className="rounded-2xl border-border/60 p-4 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Country</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Volume</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.country}</TableCell>
                <TableCell>{m.region}</TableCell>
                <TableCell><Badge variant="secondary">{m.volume}</Badge></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(m)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing && rows.some((r) => r.id === editing.id) ? "Edit Market" : "Add Market"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-2"><Label>Country</Label><Input value={editing.country} onChange={(e) => setEditing({ ...editing, country: e.target.value })} /></div>
              <div className="space-y-2"><Label>Region</Label><Input value={editing.region} onChange={(e) => setEditing({ ...editing, region: e.target.value })} /></div>
              <div className="space-y-2"><Label>Volume</Label><Input value={editing.volume} onChange={(e) => setEditing({ ...editing, volume: e.target.value })} /></div>
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
