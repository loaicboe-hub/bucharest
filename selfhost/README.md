# Moving the backend to your own server

Everything in this folder is what you need to run the site's database, admin
logins and uploaded files on a Hostinger VPS you own.

Files:

- `schema.sql` — the complete database structure (tables, access rules, roles,
  storage bucket). Run once on the new server.
- `migrate.mjs` — copies accounts, content and files from the current backend
  to the new one, and repairs the image links afterwards.
- `env.example` — the values your live site needs after the switch.

---

## 1. Prepare the VPS

Minimum: 2 vCPU / 4 GB RAM, Ubuntu 22.04+, Docker and Docker Compose.

```bash
curl -fsSL https://get.docker.com | sh
```

Point a subdomain such as `api.yourdomain.com` at the VPS IP, then install
Nginx and a Let's Encrypt certificate for it. Leave only ports 80 and 443 open
— the database port must never be reachable from the internet.

## 2. Install the backend stack

```bash
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker
cp .env.example .env
```

Edit `.env` and set, at minimum:

- `POSTGRES_PASSWORD` — a long random password
- `JWT_SECRET` — a random 40+ character string
- `ANON_KEY` and `SERVICE_ROLE_KEY` — generated from that `JWT_SECRET`
- `SITE_URL` — your public website address
- `API_EXTERNAL_URL` — `https://api.yourdomain.com`
- `SMTP_*` — your Hostinger mailbox, so password-reset emails work

Then:

```bash
docker compose up -d
```

Point Nginx at `http://localhost:8000` for `api.yourdomain.com`.

## 3. Create the database structure

```bash
psql "postgresql://postgres:<POSTGRES_PASSWORD>@localhost:5432/postgres" -f schema.sql
```

## 4. Copy accounts, content and files

Run from the project root on any machine that can reach both servers:

```bash
SRC_URL=<current backend url> \
SRC_SERVICE_KEY=<current service role key> \
DST_URL=https://api.yourdomain.com \
DST_SERVICE_KEY=<new service role key> \
node selfhost/migrate.mjs
```

You can also run one stage at a time: `node selfhost/migrate.mjs tables`
(stages: `users`, `tables`, `storage`, `relink`).

The script prints the row count for every table on both sides so you can check
nothing was left behind. It is safe to run again.

**Passwords:** password hashes cannot be read through the API, so admin
accounts arrive on the new server with a random temporary password. Each admin
uses "Forgot password" on the new site once to set their own again. This is why
SMTP must be configured in step 2.

## 5. Point the website at the new server

Set the values from `env.example` in your Hostinger deployment environment,
then rebuild and redeploy the site. No code changes are needed — the app
already reads its backend address from these variables.

## 6. Verify before switching anything off

- [ ] Admin sign-in works
- [ ] Forgot password sends an email and the reset page works
- [ ] Create, edit, publish and delete a product
- [ ] Upload a product image and see it on the public product page
- [ ] Add a category and see it appear as a tab on the homepage
- [ ] Publish a news article and open it at `/news/<slug>`
- [ ] Partners carousel shows all logos
- [ ] Brand logo and About video load
- [ ] Company details and SEO settings save and appear on the homepage
- [ ] Invoice PDF generates with the logo
- [ ] Homepage looks right in both English and Arabic

Only after all of these pass should you stop using the old backend.

## Notes

- **Freeze window.** Between the copy and the switch, avoid admin edits — they
  would be made on the old backend and lost.
- **Backups become yours.** Schedule a nightly `pg_dump` on the VPS plus an
  off-server copy, and keep Docker images updated.
- **The Lovable editor preview** keeps using the built-in backend unless you
  also set the same variables here, so preview and live site may show different
  data. That is expected.
- **The website itself needs Node.js**, because pages are rendered on the
  server. Plain static hosting will not run it correctly.
