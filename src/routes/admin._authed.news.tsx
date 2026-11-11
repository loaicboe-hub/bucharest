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
import { useAdminLang, type AdminLang } from "@/lib/admin-i18n";
import {
  blankArticle,
  deleteNews,
  formatDate,
  hydrateArticleForEditor,
  listAllNews,
  localizedArticle,
  saveNews,
  slugifyNews,
  uploadNewsImage,
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

const NEWS_UI: Record<
  AdminLang,
  {
    addNews: string;
    editNews: string;
    image: string;
    title: string;
    category: string;
    categoryPlaceholder: string;
    publishDate: string;
    lastUpdated: string;
    status: string;
    actions: string;
    loading: string;
    empty: string;
    published: string;
    draft: string;
    authorOpt: string;
    slug: string;
    tags: string;
    youtube: string;
    featuredImage: string;
    upload: string;
    gallery: string;
    add: string;
    remove: string;
    publishHint: string;
    cancel: string;
    save: string;
    saving: string;
    titleRequired: string;
    saved: string;
    deleted: string;
    uploadFailed: string;
  }
> = {
  en: {
    addNews: "Add News",
    editNews: "Edit News",
    image: "Image",
    title: "Title",
    category: "Category",
    categoryPlaceholder: "Company News",
    publishDate: "Publish Date",
    lastUpdated: "Last Updated",
    status: "Status",
    actions: "Actions",
    loading: "Loading...",
    empty: "No news articles yet",
    published: "Published",
    draft: "Draft",
    authorOpt: "Author (optional)",
    slug: "Page URL (slug)",
    tags: "Tags (comma separated)",
    youtube: "YouTube video link (optional)",
    featuredImage: "Featured image",
    upload: "Upload",
    gallery: "Gallery",
    add: "Add",
    remove: "Remove",
    publishHint: "Show this article on the website",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving...",
    titleRequired: "English title is required",
    saved: "Article saved",
    deleted: "Deleted",
    uploadFailed: "Upload failed",
  },
  fr: {
    addNews: "Ajouter une actualité",
    editNews: "Modifier l'actualité",
    image: "Image",
    title: "Titre",
    category: "Catégorie",
    categoryPlaceholder: "Actualités de l'entreprise",
    publishDate: "Date de publication",
    lastUpdated: "Dernière mise à jour",
    status: "Statut",
    actions: "Actions",
    loading: "Chargement...",
    empty: "Aucun article pour le moment",
    published: "Publié",
    draft: "Brouillon",
    authorOpt: "Auteur (optionnel)",
    slug: "URL de la page (slug)",
    tags: "Mots-clés (séparés par des virgules)",
    youtube: "Lien vidéo YouTube (optionnel)",
    featuredImage: "Image à la une",
    upload: "Télécharger",
    gallery: "Galerie",
    add: "Ajouter",
    remove: "Supprimer",
    publishHint: "Afficher cet article sur le site web",
    cancel: "Annuler",
    save: "Enregistrer",
    saving: "Enregistrement...",
    titleRequired: "Le titre en anglais est requis",
    saved: "Article enregistré",
    deleted: "Supprimé",
    uploadFailed: "Échec du téléchargement",
  },
  ar: {
    addNews: "إضافة خبر",
    editNews: "تعديل الخبر",
    image: "الصورة",
    title: "العنوان",
    category: "التصنيف",
    categoryPlaceholder: "أخبار الشركة",
    publishDate: "تاريخ النشر",
    lastUpdated: "آخر تحديث",
    status: "الحالة",
    actions: "إجراءات",
    loading: "جاري التحميل...",
    empty: "لا توجد أخبار بعد",
    published: "منشور",
    draft: "مسودة",
    authorOpt: "الكاتب (اختياري)",
    slug: "رابط الصفحة (slug)",
    tags: "الوسوم (مفصولة بفاصلة)",
    youtube: "رابط فيديو يوتيوب (اختياري)",
    featuredImage: "الصورة الرئيسية",
    upload: "رفع",
    gallery: "معرض الصور",
    add: "إضافة",
    remove: "إزالة",
    publishHint: "أظهر هذا الخبر على الموقع",
    cancel: "إلغاء",
    save: "حفظ",
    saving: "جاري الحفظ...",
    titleRequired: "العنوان بالإنجليزية مطلوب",
    saved: "تم حفظ الخبر",
    deleted: "تم الحذف",
    uploadFailed: "فشل الرفع",
  },
  ru: {
    addNews: "Добавить новость",
    editNews: "Редактировать новость",
    image: "Фото",
    title: "Заголовок",
    category: "Категория",
    categoryPlaceholder: "Новости компании",
    publishDate: "Дата публикации",
    lastUpdated: "Обновлено",
    status: "Статус",
    actions: "Действия",
    loading: "Загрузка...",
    empty: "Новостей пока нет",
    published: "Опубликовано",
    draft: "Черновик",
    authorOpt: "Автор (необязательно)",
    slug: "URL страницы (slug)",
    tags: "Теги (через запятую)",
    youtube: "Ссылка на видео YouTube (необязательно)",
    featuredImage: "Главное изображение",
    upload: "Загрузить",
    gallery: "Галерея",
    add: "Добавить",
    remove: "Удалить",
    publishHint: "Показывать эту статью на сайте",
    cancel: "Отмена",
    save: "Сохранить",
    saving: "Сохранение...",
    titleRequired: "Необходим заголовок на английском",
    saved: "Статья сохранена",
    deleted: "Удалено",
    uploadFailed: "Ошибка загрузки",
  },
};

function NewsAdminPage() {
  const { t, lang } = useAdminLang();
  const ui = NEWS_UI[lang];
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
    if (!title) return toast.error(ui.titleRequired);
    setSaving(true);
    const error = await saveNews({ ...editing, title, slug: editing.slug || slugifyNews(title) });
    setSaving(false);
    if (error) return toast.error(error);
    toast.success(ui.saved);
    setOpen(false);
    void refresh();
  };

  const remove = async (id: string) => {
    const error = await deleteNews(id);
    if (error) return toast.error(error);
    toast.success(ui.deleted);
    void refresh();
  };

  const togglePublish = async (item: NewsArticle) => {
    const error = await saveNews({ ...item, published: !item.published });
    if (error) return toast.error(error);
    void refresh();
  };

  const onFeatured = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editing) return;
    const { url, error } = await uploadNewsImage(file);
    if (error || !url) return toast.error(error ?? ui.uploadFailed);
    setEditing((prev) => (prev ? { ...prev, featured_image: url } : prev));
  };

  const onGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length || !editing) return;
    const results = await Promise.all(files.map(uploadNewsImage));
    const urls = results.map((r) => r.url).filter(Boolean) as string[];
    if (!urls.length) return toast.error(results[0]?.error ?? ui.uploadFailed);
    setEditing((prev) => (prev ? { ...prev, gallery: [...prev.gallery, ...urls] } : prev));
  };

  return (
    <div>
      <PageHeader
        title={t("nav.news")}
        description={t("news.desc")}
        actions={
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" /> {ui.addNews}
          </Button>
        }
      />

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">{ui.image}</TableHead>
              <TableHead>{ui.title}</TableHead>
              <TableHead>{ui.category}</TableHead>
              <TableHead>{ui.publishDate}</TableHead>
              <TableHead>{ui.status}</TableHead>
              <TableHead className="text-right">{ui.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  {ui.loading}
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  {ui.empty}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((item) => {
                const loc = localizedArticle(item, lang);
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <img
                        src={item.featured_image || "/placeholder.svg"}
                        alt=""
                        className="h-12 w-16 rounded-md border object-cover"
                      />
                    </TableCell>
                    <TableCell className="max-w-xs font-medium">{loc.title || item.title}</TableCell>
                    <TableCell>{loc.category || item.category || "—"}</TableCell>
                    <TableCell>{formatDate(item.published_at, lang)}</TableCell>
                    <TableCell>
                      <Badge variant={item.published ? "default" : "secondary"}>
                        {item.published ? ui.published : ui.draft}
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
                            setEditing(hydrateArticleForEditor(item));
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
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? ui.editNews : ui.addNews}</DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{ui.category}</Label>
                  <Input
                    value={editing.category}
                    placeholder={ui.categoryPlaceholder}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{ui.authorOpt}</Label>
                  <Input
                    value={editing.author}
                    onChange={(e) => setEditing({ ...editing, author: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{ui.publishDate}</Label>
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
                  <Label>{ui.lastUpdated}</Label>
                  <Input value={formatDate(editing.updated_at, lang)} disabled />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>{ui.slug}</Label>
                  <Input
                    value={editing.slug}
                    placeholder={slugifyNews(editing.title) || "news-slug"}
                    onChange={(e) => setEditing({ ...editing, slug: slugifyNews(e.target.value) })}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>{ui.tags}</Label>
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
                  <Label>{ui.youtube}</Label>
                  <Input
                    value={editing.video_url}
                    placeholder="https://www.youtube.com/watch?v=..."
                    onChange={(e) => setEditing({ ...editing, video_url: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{ui.featuredImage}</Label>
                  <div className="flex items-center gap-3">
                    <img
                      src={editing.featured_image || "/placeholder.svg"}
                      alt=""
                      className="h-16 w-24 rounded-md border object-cover"
                    />
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-accent">
                      <Upload className="h-4 w-4" /> {ui.upload}
                      <input type="file" accept="image/*" className="hidden" onChange={onFeatured} />
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>
                    {ui.gallery} ({editing.gallery.length})
                  </Label>
                  <div className="flex flex-wrap items-center gap-2">
                    {editing.gallery.map((g, i) => (
                      <button
                        key={g + i}
                        type="button"
                        title={ui.remove}
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
                      <Upload className="h-4 w-4" /> {ui.add}
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
                <TabsList className="grid w-full grid-cols-4 sm:inline-flex sm:w-auto">
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="fr">Français</TabsTrigger>
                  <TabsTrigger value="ar">العربية</TabsTrigger>
                  <TabsTrigger value="ru">Русский</TabsTrigger>
                </TabsList>

                <TabsContent value="en" className="space-y-4 pt-4" dir="ltr">
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

                <TabsContent value="fr" className="space-y-4 pt-4" dir="ltr">
                  <div className="space-y-2">
                    <Label>Titre (Français)</Label>
                    <Input
                      value={editing.title_fr ?? ""}
                      onChange={(e) => setEditing({ ...editing, title_fr: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description courte</Label>
                    <Textarea
                      rows={2}
                      value={editing.excerpt_fr ?? ""}
                      onChange={(e) => setEditing({ ...editing, excerpt_fr: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Article complet</Label>
                    <RichTextEditor
                      value={editing.content_fr ?? ""}
                      onChange={(html) => setEditing({ ...editing, content_fr: html })}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="ar" className="space-y-4 pt-4" dir="rtl">
                  <div className="space-y-2">
                    <Label>العنوان (بالعربية)</Label>
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

                <TabsContent value="ru" className="space-y-4 pt-4" dir="ltr">
                  <div className="space-y-2">
                    <Label>Заголовок (Русский)</Label>
                    <Input
                      value={editing.title_ru ?? ""}
                      onChange={(e) => setEditing({ ...editing, title_ru: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Краткое описание</Label>
                    <Textarea
                      rows={2}
                      value={editing.excerpt_ru ?? ""}
                      onChange={(e) => setEditing({ ...editing, excerpt_ru: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Полная статья</Label>
                    <RichTextEditor
                      value={editing.content_ru ?? ""}
                      onChange={(html) => setEditing({ ...editing, content_ru: html })}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex items-center justify-between rounded-md border border-input p-3">
                <div>
                  <Label>{ui.published}</Label>
                  <p className="text-xs text-muted-foreground">{ui.publishHint}</p>
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
              {ui.cancel}
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? ui.saving : ui.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
