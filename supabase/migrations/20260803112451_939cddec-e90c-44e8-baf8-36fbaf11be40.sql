CREATE TABLE public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL DEFAULT '',
  title_ar text NOT NULL DEFAULT '',
  excerpt text NOT NULL DEFAULT '',
  excerpt_ar text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  content_ar text NOT NULL DEFAULT '',
  featured_image text NOT NULL DEFAULT '',
  gallery text[] NOT NULL DEFAULT '{}',
  category text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  author text NOT NULL DEFAULT '',
  video_url text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.news TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news TO authenticated;
GRANT ALL ON public.news TO service_role;

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published news is publicly readable"
  ON public.news FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can read all news"
  ON public.news FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert news"
  ON public.news FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update news"
  ON public.news FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete news"
  ON public.news FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX news_published_at_idx ON public.news (published_at DESC);

CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();