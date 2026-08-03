import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, Trash2, Search, Replace } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminLang } from "@/lib/admin-i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/_authed/media")({
  component: MediaPage,
});

type Media = { id: string; name: string; url: string };

const initial: Media[] = Array.from({ length: 8 }, (_, i) => ({
  id: `m${i}`, name: `image-${i + 1}.jpg`, url: "/placeholder.svg",
}));

function MediaPage() {
  const { t } = useAdminLang();
  const [items, setItems] = useState<Media[]>(initial);
  const [q, setQ] = useState("");

  const filtered = items.filter((i) => i.name.toLowerCase().includes(q.toLowerCase()));

  const upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const next = Array.from(files).map((f, i) => ({ id: `up_${Date.now()}_${i}`, name: f.name, url: URL.createObjectURL(f) }));
    setItems((it) => [...next, ...it]);
    toast.success(`${next.length} file(s) uploaded`);
  };

  const replace = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setItems((it) => it.map((x) => x.id === id ? { ...x, name: f.name, url: URL.createObjectURL(f) } : x));
    toast.success("Replaced");
  };
  const remove = (id: string) => { setItems((it) => it.filter((x) => x.id !== id)); toast.success("Deleted"); };

  return (
    <div>
      <PageHeader
        title={t("nav.media")}
        description={t("media.desc")}
        actions={
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Upload className="h-4 w-4" /> Upload
            <input type="file" multiple accept="image/*" onChange={upload} className="hidden" />
          </label>
        }
      />

      <Card className="rounded-2xl border-border/60 p-4 shadow-sm">
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search files…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {filtered.map((m) => (
            <div key={m.id} className="group relative overflow-hidden rounded-xl border border-border bg-background">
              <img src={m.url} alt={m.name} className="aspect-square w-full object-cover" />
              <div className="p-2 text-xs text-muted-foreground truncate">{m.name}</div>
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition group-hover:opacity-100">
                <label className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-white px-2 py-1 text-xs text-foreground">
                  <Replace className="h-3 w-3" /> Replace
                  <input type="file" accept="image/*" onChange={(e) => replace(m.id, e)} className="hidden" />
                </label>
                <button onClick={() => remove(m.id)} className="inline-flex items-center gap-1 rounded-md bg-destructive px-2 py-1 text-xs text-destructive-foreground">
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="col-span-full py-10 text-center text-muted-foreground">No media found</p>}
        </div>
      </Card>
    </div>
  );
}
