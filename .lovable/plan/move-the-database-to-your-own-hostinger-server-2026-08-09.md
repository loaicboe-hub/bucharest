# Move the database to your own Hostinger server

Goal: the site's data, admin accounts and uploaded images live on a server you own at Hostinger, instead of on Lovable Cloud.

## The important decision first

Your site's backend is not just "a database". It is three things working together:

1. **Database** (Postgres) — products, categories, news, partners, settings, invoices data
2. **Authentication** — admin login, password reset, roles and permissions
3. **File storage** — logos, product images, partner logos, the About video

Hostinger's shared/web hosting only offers **MySQL + PHP**. It cannot run any of the three as they exist today. So there are two realistic routes:

**Route A — Self-hosted Supabase on a Hostinger VPS (recommended)**
You run the same open-source stack (Postgres + Auth + Storage) in Docker on a VPS you own. All the app code keeps working; we only change which server it points at. Data, users and files are fully yours.

**Route B — Rewrite onto Hostinger MySQL**
Every data call, the whole login system, the roles/permissions engine and all image uploads get rebuilt from scratch against MySQL plus a custom auth system. This is essentially rebuilding the entire admin backend, with a real risk of losing password hashes (they cannot be moved into a hand-rolled auth system safely) and of new security holes replacing the current row-level rules.

This plan assumes **Route A**. If you only have shared hosting today, the first step is upgrading to a Hostinger VPS — Route B is not something I'd recommend for a live site.

## What happens, step by step

### 1. Prepare the server (you, on Hostinger)
- A VPS with at least 2 vCPU / 4 GB RAM, Ubuntu, Docker installed
- A subdomain pointed at it, e.g. `api.yourdomain.com`, with an SSL certificate
- Open ports 80/443 only; database port stays closed to the internet

### 2. Install the backend stack on the VPS
Run the official self-hosted Supabase Docker bundle (Postgres, Auth, Storage, REST API, Studio) behind Nginx on that subdomain, with new secrets generated on your server.

### 3. Move the data
- Export the current schema: all tables (`products`, `product_categories`, `news`, `partners`, `site_settings`, `profiles`, `user_roles`, `user_permissions`), the `app_role` type, the `has_role` / `is_super_admin` / `claim_first_admin` functions, triggers, grants and row-level security policies
- Export the table rows
- Export the `auth.users` table so existing admin logins and passwords keep working
- Import all of it into the VPS database and verify row counts match

### 4. Move the uploaded files
Download everything in the `site-media` bucket (logos, product images, partner logos, About video) and upload it into the same bucket on your server. Image links stored in the database are time-limited signed URLs, so they get regenerated to point at the new host — that is part of this step, not an afterthought.

### 5. Point the app at your server
- Add a small config layer so the app reads the backend URL and public key from your own settings instead of the built-in Lovable Cloud ones, with a fallback so the editor preview keeps working
- Set the new values in your Hostinger deployment environment
- Rebuild and redeploy the site

### 6. Verify before switching off anything
Admin login, password reset, creating/editing a product, uploading an image, adding a category, publishing news, partners carousel, invoice PDF, and the public homepage in both English and Arabic. Only after all pass do we stop writing to Lovable Cloud.

## Things to know up front

- **A freeze window is needed.** Between the export and the switch, any change made in the admin panel would be lost. Plan a short window with no admin edits.
- **Ongoing responsibility moves to you.** Backups, security updates, uptime and SSL renewal on the VPS become your job.
- **The Lovable editor preview** will keep talking to Lovable Cloud unless you also give it your server's URL and public key; otherwise preview and live site show different data. That is expected and manageable, just worth knowing.
- **Email.** Password-reset emails currently go through the built-in mail service. On your own server you'll need SMTP credentials (Hostinger provides these) configured in the auth service.
- **Also check the site host itself.** This app renders pages on the server, so it needs a Node.js runtime. If it is currently deployed on Hostinger as plain static files, some pages may not behave correctly — worth confirming during step 6.

## Technical detail

- Self-hosted Supabase via the official `docker-compose` bundle; Nginx reverse proxy + Let's Encrypt on `api.yourdomain.com`
- Schema migration: `pg_dump --schema-only` for `public` + `auth`, then `--data-only` with `--disable-triggers`; RLS policies and `SECURITY DEFINER` function grants (already hardened) must be carried over verbatim
- New `ANON_KEY` / `SERVICE_ROLE_KEY` generated from the VPS `JWT_SECRET`
- Code change is limited to a config module consumed by `src/integrations/supabase/client.ts` equivalents plus the server-side client, reading `VITE_APP_SUPABASE_URL` / `VITE_APP_SUPABASE_ANON_KEY` and server-side `APP_SUPABASE_URL` / `APP_SUPABASE_SERVICE_ROLE_KEY`, falling back to the current values when unset
- Storage: bucket `site-media` recreated with the same private access policies; signed-URL TTL logic in `src/lib/products-db.ts` unchanged, URLs regenerated on the new host

## What I can and cannot do

I can prepare the code changes, produce the exact export/import commands, and generate the SQL and file-migration scripts. I cannot log into your Hostinger account, provision the VPS, or run commands on it — those steps are yours, and I'll walk you through each one.
