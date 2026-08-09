-- ---------------------------------------------------------------------------
-- Nailvlora — portable schema for a self-hosted Supabase stack
-- Run this ONCE against the new database on your Hostinger VPS, BEFORE
-- importing any data.
--
--   psql "postgresql://postgres:<password>@localhost:5432/postgres" -f schema.sql
--
-- It assumes the standard self-hosted Supabase bundle is already running
-- (so the auth, storage and extensions schemas exist).
-- ---------------------------------------------------------------------------

BEGIN;

-- ------------------------------------------------------------------ types --
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'super_admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- -------------------------------------------------------------- utilities --
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------- profiles --
CREATE TABLE IF NOT EXISTS public.profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text,
  full_name  text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------- user_roles --
CREATE TABLE IF NOT EXISTS public.user_roles (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------- role check functions --
-- SECURITY DEFINER so RLS policies can call them without recursion.
-- Hardened: a signed-in caller may only ask about their own user id.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE
    WHEN auth.uid() IS NOT NULL AND _user_id IS DISTINCT FROM auth.uid() THEN false
    ELSE EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
  END
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE
    WHEN auth.uid() IS NOT NULL AND _user_id IS DISTINCT FROM auth.uid() THEN false
    ELSE EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin')
  END
$$;

CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RETURN FALSE; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN RETURN FALSE; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (_uid, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN TRUE;
END;
$$;

-- Only signed-in users may execute these (matches the hardened production setup).
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.claim_first_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated, service_role;

-- ------------------------------------------------------- user_permissions --
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_key text NOT NULL,
  can_view   boolean NOT NULL DEFAULT false,
  can_create boolean NOT NULL DEFAULT false,
  can_edit   boolean NOT NULL DEFAULT false,
  can_delete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_permissions TO authenticated;
GRANT ALL ON public.user_permissions TO service_role;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------ product_categories --
CREATE TABLE IF NOT EXISTS public.product_categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       text NOT NULL UNIQUE,
  name_en    text NOT NULL DEFAULT '',
  name_ar    text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 1,
  active     boolean NOT NULL DEFAULT true,
  trade      text NOT NULL DEFAULT 'export',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.product_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_categories TO authenticated;
GRANT ALL ON public.product_categories TO service_role;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------- products --
CREATE TABLE IF NOT EXISTS public.products (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text NOT NULL UNIQUE,
  trade           text NOT NULL DEFAULT 'export',
  category_id     uuid REFERENCES public.product_categories(id),
  name_en         text NOT NULL DEFAULT '',
  name_ar         text NOT NULL DEFAULT '',
  intro_en        text NOT NULL DEFAULT '',
  intro_ar        text NOT NULL DEFAULT '',
  description_en  text NOT NULL DEFAULT '',
  description_ar  text NOT NULL DEFAULT '',
  specs_en        jsonb NOT NULL DEFAULT '{}'::jsonb,
  specs_ar        jsonb NOT NULL DEFAULT '{}'::jsonb,
  hidden_specs    text[] NOT NULL DEFAULT '{}'::text[],
  main_image      text NOT NULL DEFAULT '',
  gallery         text[] NOT NULL DEFAULT '{}'::text[],
  published       boolean NOT NULL DEFAULT true,
  sort_order      integer NOT NULL DEFAULT 1,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------- news --
CREATE TABLE IF NOT EXISTS public.news (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           text NOT NULL UNIQUE,
  title          text NOT NULL DEFAULT '',
  title_ar       text NOT NULL DEFAULT '',
  excerpt        text NOT NULL DEFAULT '',
  excerpt_ar     text NOT NULL DEFAULT '',
  content        text NOT NULL DEFAULT '',
  content_ar     text NOT NULL DEFAULT '',
  featured_image text NOT NULL DEFAULT '',
  gallery        text[] NOT NULL DEFAULT '{}'::text[],
  category       text NOT NULL DEFAULT '',
  tags           text[] NOT NULL DEFAULT '{}'::text[],
  author         text NOT NULL DEFAULT '',
  video_url      text NOT NULL DEFAULT '',
  published      boolean NOT NULL DEFAULT false,
  published_at   timestamptz NOT NULL DEFAULT now(),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.news TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news TO authenticated;
GRANT ALL ON public.news TO service_role;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------- partners --
CREATE TABLE IF NOT EXISTS public.partners (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL DEFAULT '',
  logo_path  text NOT NULL DEFAULT '',
  logo_url   text NOT NULL DEFAULT '',
  url        text NOT NULL DEFAULT '',
  enabled    boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.partners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partners TO authenticated;
GRANT ALL ON public.partners TO service_role;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------- site_settings --
CREATE TABLE IF NOT EXISTS public.site_settings (
  id              text PRIMARY KEY DEFAULT 'default',
  company_name    text NOT NULL DEFAULT '',
  phone           text NOT NULL DEFAULT '',
  email           text NOT NULL DEFAULT '',
  whatsapp        text NOT NULL DEFAULT '',
  address         text NOT NULL DEFAULT '',
  maps_url        text NOT NULL DEFAULT '',
  facebook        text NOT NULL DEFAULT '',
  instagram       text NOT NULL DEFAULT '',
  linkedin        text NOT NULL DEFAULT '',
  twitter         text NOT NULL DEFAULT '',
  seo_title       text NOT NULL DEFAULT '',
  seo_description text NOT NULL DEFAULT '',
  seo_keywords    text NOT NULL DEFAULT '',
  seo_og_image    text NOT NULL DEFAULT '',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------- policies --
-- profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
CREATE POLICY "Super admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));

-- user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Super admins can insert roles" ON public.user_roles;
CREATE POLICY "Super admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.is_super_admin(auth.uid()));
DROP POLICY IF EXISTS "Super admins can delete roles" ON public.user_roles;
CREATE POLICY "Super admins can delete roles" ON public.user_roles
  FOR DELETE TO authenticated USING (public.is_super_admin(auth.uid()) AND user_id <> auth.uid());

-- user_permissions
DROP POLICY IF EXISTS "Users can view their own permissions" ON public.user_permissions;
CREATE POLICY "Users can view their own permissions" ON public.user_permissions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Super admins can view all permissions" ON public.user_permissions;
CREATE POLICY "Super admins can view all permissions" ON public.user_permissions
  FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));
DROP POLICY IF EXISTS "Super admins can insert permissions" ON public.user_permissions;
CREATE POLICY "Super admins can insert permissions" ON public.user_permissions
  FOR INSERT TO authenticated WITH CHECK (public.is_super_admin(auth.uid()));
DROP POLICY IF EXISTS "Super admins can update permissions" ON public.user_permissions;
CREATE POLICY "Super admins can update permissions" ON public.user_permissions
  FOR UPDATE TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
DROP POLICY IF EXISTS "Super admins can delete permissions" ON public.user_permissions;
CREATE POLICY "Super admins can delete permissions" ON public.user_permissions
  FOR DELETE TO authenticated USING (public.is_super_admin(auth.uid()));

-- product_categories
DROP POLICY IF EXISTS "Active categories are publicly readable" ON public.product_categories;
CREATE POLICY "Active categories are publicly readable" ON public.product_categories
  FOR SELECT USING (active = true);
DROP POLICY IF EXISTS "Admins can read all categories" ON public.product_categories;
CREATE POLICY "Admins can read all categories" ON public.product_categories
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can insert categories" ON public.product_categories;
CREATE POLICY "Admins can insert categories" ON public.product_categories
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update categories" ON public.product_categories;
CREATE POLICY "Admins can update categories" ON public.product_categories
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete categories" ON public.product_categories;
CREATE POLICY "Admins can delete categories" ON public.product_categories
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- products
DROP POLICY IF EXISTS "Published products are publicly readable" ON public.products;
CREATE POLICY "Published products are publicly readable" ON public.products
  FOR SELECT USING (published = true);
DROP POLICY IF EXISTS "Admins can read all products" ON public.products;
CREATE POLICY "Admins can read all products" ON public.products
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- news
DROP POLICY IF EXISTS "Published news is publicly readable" ON public.news;
CREATE POLICY "Published news is publicly readable" ON public.news
  FOR SELECT USING (published = true);
DROP POLICY IF EXISTS "Admins can read all news" ON public.news;
CREATE POLICY "Admins can read all news" ON public.news
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can insert news" ON public.news;
CREATE POLICY "Admins can insert news" ON public.news
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update news" ON public.news;
CREATE POLICY "Admins can update news" ON public.news
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete news" ON public.news;
CREATE POLICY "Admins can delete news" ON public.news
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- partners
DROP POLICY IF EXISTS "Partners are publicly viewable" ON public.partners;
CREATE POLICY "Partners are publicly viewable" ON public.partners
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users manage partners" ON public.partners;
CREATE POLICY "Authenticated users manage partners" ON public.partners
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- site_settings
DROP POLICY IF EXISTS "Site settings are publicly readable" ON public.site_settings;
CREATE POLICY "Site settings are publicly readable" ON public.site_settings
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can insert site settings" ON public.site_settings;
CREATE POLICY "Admins can insert site settings" ON public.site_settings
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
CREATE POLICY "Admins can update site settings" ON public.site_settings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- --------------------------------------------------------------- triggers --
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_categories_updated_at ON public.product_categories;
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON public.product_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_news_updated_at ON public.news;
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_permissions_updated_at ON public.user_permissions;
CREATE TRIGGER update_user_permissions_updated_at BEFORE UPDATE ON public.user_permissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------- storage --
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-media', 'site-media', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can read published site media" ON storage.objects;
CREATE POLICY "Public can read published site media" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (
    bucket_id = 'site-media'
    AND (storage.foldername(name))[1] = ANY (ARRAY['branding','partners','news','about','products'])
  );

DROP POLICY IF EXISTS "Admins can read all site media" ON storage.objects;
CREATE POLICY "Admins can read all site media" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can upload site media" ON storage.objects;
CREATE POLICY "Admins can upload site media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update site media" ON storage.objects;
CREATE POLICY "Admins can update site media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete site media" ON storage.objects;
CREATE POLICY "Admins can delete site media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'));

COMMIT;
