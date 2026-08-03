import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Upload, Eye, EyeOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/admin/PageHeader";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { useAdminLang } from "@/lib/admin-i18n";
import {
  blankArticle,
  deleteNews,
  listAllNews,
  saveNews,
  slugifyNews,
  uploadNewsImage,
  formatDate,
  type NewsArticle,
} from "@/lib/news";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/_authed/news")({
  component: NewsAdminPage,
});

function toDateInput(iso: string) {
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function NewsAdminPage() {
  const { t, lang } = useAdminLang();
  const ar = lang === "ar";
  const [rows, setRows] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<NewsArticle | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    setLoading(true);
    setRows(await listAllNews());
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const openNew = () => {
    setEditing(blankArticle());
    setOpen(true);
  };

  const save = async () => {
    if (!editing) return;
    const title = editing.title.trim();
    if (!title) return toast.error(ar ? "العنوان بالإنجليزية مطلوب" : "English title is required");
    setSaving(true);
    const error = await saveNews({ ...editing, title, slug: editing.slug || slugifyNews(title) });
    setSaving(false);
    if (error) return toast.error(error);
    toast.success(ar ? "تم حفظ الخبر" : "Article saved");
    setOpen(false);
    void refresh();
  };

  const remove = async (id: string) => {
    const error = await deleteNews(id);
    if (error) return toast.error(error);
    toast.success(ar ? "تم الحذف" : "Deleted");
    void refresh();
  };

  const togglePublish = async (item: NewsArticle) => {
    const error = await saveNews({ ...item, published: !item.published });
    if (error) return toast.error(error);
    void refresh();
  };

  const onFeatured = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    const { url, error } = await uploadNewsImage(file);
    if (error || !url) return toast.error(error ?? "Upload failed");
    setEditing({ ...editing, featured_image: url });
  };

  const onGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !editing) return;
    const results = await Promise.all(files.map(uploadNewsImage));
    const urls = results.map((r) => r.url).filter(Boolean) as string[];
    if (!urls.length) return toast.error(results[0]?.error ?? "Upload failed");
    setEditing({ ...editing, gallery: [...editing.gallery, ...urls] });
  };

  return (
    <div>
      <PageHeader
        title={t("nav.news")}
        description={t("news.desc")}
        actions={
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" /> {ar ? "إضافة خبر" : "Add News"}
          </Button>
        }
      />

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">{ar ? "الصورة" : "Image"}</TableHead>
              <TableHead>{ar ? "العنوان" : "Title"}</TableHead>
              <TableHead>{ar ? "التصنيف" : "Category"}</TableHead>
              <TableHead>{ar ? "تاريخ النشر" : "Publish Date"}</TableHead>
              <TableHead>{ar ? "الحالة" : "Status"}</TableHead>
              <TableHead className="text-right">{ar ? "إجراءات" : "Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  {ar ? "جاري التحميل..." : "Loading..."}
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  {ar ? "لا توجد أخبار بعد" : "No news articles yet"}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <img
                      src={item.featured_image || "/placeholder.svg"}
                      alt=""
                      className="h-12 w-16 rounded-md border object-cover"
                    />
                  </TableCell>
                  <TableCell className="max-w-xs font-medium">{item.title}</TableCell>
                  <TableCell>{item.category || "—"}</TableCell>
                  <TableCell>{formatDate(item.published_at, lang)}</TableCell>
                  <TableCell>
                    <Badge variant={item.published ? "default" : "secondary"}>
                      {item.published ? (ar ? "منشور" : "Published") : ar ? "مسودة" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => togglePublish(item)}>
                        {item.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditing({ ...item });
                          setOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing?.id ? (ar ? "تعديل الخبر" : "Edit News") : ar ? "إضافة خبر" : "Add News"}
            </DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{ar ? "التصنيف" : "Category"}</Label>
                  <Input
                    value={editing.category}
                    placeholder={ar ? "أخبار الشركة" : "Company News"}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{ar ? "الكاتب (اختياري)" : "Author (optional)"}</Label>
                  <Input
                    value={editing.author}
                    onChange={(e) => setEditing({ ...editing, author: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{ar ? "تاريخ النشر" : "Publish Date"}</Label>
                  <Input
                    type="date"
                    value={toDateInput(editing.published_at)}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        published_at: new Date(e.target.value || Date.now()).toISOString(),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{ar ? "آخر تحديث" : "Last Updated"}</Label>
                  <Input value={formatDate(editing.updated_at, lang)} disabled />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>{ar ? "رابط الصفحة (slug)" : "Page URL (slug)"}</Label>
                  <Input
                    value={editing.slug}
                    placeholder={slugifyNews(editing.title) || "news-slug"}
                    onChange={(e) => setEditing({ ...editing, slug: slugifyNews(e.target.value) })}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>{ar ? "الوسوم (مفصولة بفاصلة)" : "Tags (comma separated)"}</Label>
                  <Input
                    value={editing.tags.join(", ")}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        tags: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>{ar ? "رابط فيديو يوتيوب (اختياري)" : "YouTube video link (optional)"}</Label>
                  <Input
                    value={editing.video_url}
                    placeholder="https://www.youtube.com/watch?v=..."
                    onChange={(e) => setEditing({ ...editing, video_url: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{ar ? "الصورة الرئيسية" : "Featured image"}</Label>
                  <div className="flex items-center gap-3">
                    <img
                      src={editing.featured_image || "/placeholder.svg"}
                      alt=""
                      className="h-16 w-24 rounded-md border object-cover"
                    />
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-accent">
                      <Upload className="h-4 w-4" /> {ar ? "رفع" : "Upload"}
                      <input type="file" accept="image/*" className="hidden" onChange={onFeatured} />
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>
                    {ar ? "معرض الصور" : "Gallery"} ({editing.gallery.length})
                  </Label>
                  <div className="flex flex-wrap items-center gap-2">
                    {editing.gallery.map((g, i) => (
                      <button
                        key={g + i}
                        type="button"
                        title={ar ? "إزالة" : "Remove"}
                        onClick={() =>
                          setEditing({ ...editing, gallery: editing.gallery.filter((_, x) => x !== i) })
                        }
                        className="relative h-12 w-12 overflow-hidden rounded border"
                      >
                        <img src={g} alt="" className="h-full w-full object-cover" />
                        <X className="absolute right-0 top-0 h-3 w-3 bg-background/80 text-destructive" />
                      </button>
                    ))}
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-accent">
                      <Upload className="h-4 w-4" /> {ar ? "إضافة" : "Add"}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={onGallery}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="en">
                <TabsList>
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="ar">العربية</TabsTrigger>
                </TabsList>

                <TabsContent value="en" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={editing.title}
                      onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Short description</Label>
                    <Textarea
                      rows={2}
                      value={editing.excerpt}
                      onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Full article</Label>
                    <RichTextEditor
                      value={editing.content}
                      onChange={(html) => setEditing({ ...editing, content: html })}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="ar" className="space-y-4 pt-4" dir="rtl">
                  <div className="space-y-2">
                    <Label>العنوان</Label>
                    <Input
                      value={editing.title_ar}
                      onChange={(e) => setEditing({ ...editing, title_ar: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>وصف مختصر</Label>
                    <Textarea
                      rows={2}
                      value={editing.excerpt_ar}
                      onChange={(e) => setEditing({ ...editing, excerpt_ar: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>المقال الكامل</Label>
                    <RichTextEditor
                      dir="rtl"
                      value={editing.content_ar}
                      onChange={(html) => setEditing({ ...editing, content_ar: html })}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex items-center justify-between rounded-md border border-input p-3">
                <div>
                  <Label>{ar ? "منشور" : "Published"}</Label>
                  <p className="text-xs text-muted-foreground">
                    {ar ? "أظهر هذا الخبر على الموقع" : "Show this article on the website"}
                  </p>
                </div>
                <Switch
                  checked={editing.published}
                  onCheckedChange={(v) => setEditing({ ...editing, published: v })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {ar ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? (ar ? "جاري الحفظ..." : "Saving...") : ar ? "حفظ" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
