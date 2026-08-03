import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminLang } from "@/lib/admin-i18n";
import { toast } from "sonner";
import { deleteAboutVideo, getAboutVideoUrl, uploadAboutVideo } from "@/lib/about-video";

export const Route = createFileRoute("/admin/_authed/about-video")({
  component: AboutVideoPage,
});

function AboutVideoPage() {
  const { t } = useAdminLang();
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = async () => {
    setUrl(await getAboutVideoUrl());
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    const error = await uploadAboutVideo(file);
    if (error) toast.error(error);
    else toast.success(t("aboutVideo.uploaded"));
    await refresh();
    setBusy(false);
  };

  const onDelete = async () => {
    setBusy(true);
    const error = await deleteAboutVideo();
    if (error) toast.error(error);
    else toast.success(t("aboutVideo.deleted"));
    await refresh();
    setBusy(false);
  };

  return (
    <div>
      <PageHeader title={t("nav.about-video")} description={t("aboutVideo.desc")} />

      <Card className="max-w-3xl rounded-2xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>{t("aboutVideo.current")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/webm"
            className="hidden"
            onChange={onPick}
          />

          <div className="overflow-hidden rounded-2xl border border-border bg-muted/40">
            {loading ? (
              <div className="grid h-56 place-items-center text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : url ? (
              <video
                key={url}
                src={url}
                controls
                muted
                playsInline
                className="aspect-video w-full bg-black object-cover"
              />
            ) : (
              <div className="grid h-56 place-items-center px-6 text-center text-sm text-muted-foreground">
                {t("aboutVideo.empty")}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => inputRef.current?.click()} disabled={busy}>
              {busy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {url ? t("aboutVideo.replace") : t("aboutVideo.upload")}
            </Button>
            {url && (
              <Button variant="destructive" onClick={onDelete} disabled={busy}>
                <Trash2 className="mr-2 h-4 w-4" />
                {t("aboutVideo.delete")}
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">{t("aboutVideo.hint")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
