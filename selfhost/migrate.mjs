#!/usr/bin/env node
/**
 * Nailvlora — migrate content, users and files from the current backend to a
 * self-hosted Supabase stack on your own server.
 *
 * Usage (run from the project root, Node 18+):
 *
 *   SRC_URL=https://<current-backend-url> \
 *   SRC_SERVICE_KEY=<current service role key> \
 *   DST_URL=https://api.yourdomain.com \
 *   DST_SERVICE_KEY=<new service role key> \
 *   node selfhost/migrate.mjs
 *
 * Steps performed, in order:
 *   1. users     – recreates admin accounts (same ids/emails) on the new server
 *   2. tables    – copies every content table
 *   3. storage   – copies every file in the site-media bucket
 *   4. relink    – regenerates the image links stored in the database
 *
 * Safe to re-run: every write is an upsert.
 *
 * IMPORTANT about passwords: password hashes cannot be read through the API,
 * so accounts are recreated with a random temporary password. After the
 * migration, each admin uses "Forgot password" on the new site to set a new
 * one (this needs SMTP configured in the new auth service).
 */

import { createClient } from "@supabase/supabase-js";

const { SRC_URL, SRC_SERVICE_KEY, DST_URL, DST_SERVICE_KEY } = process.env;

for (const [k, v] of Object.entries({ SRC_URL, SRC_SERVICE_KEY, DST_URL, DST_SERVICE_KEY })) {
  if (!v) {
    console.error(`Missing environment variable: ${k}`);
    process.exit(1);
  }
}

const BUCKET = "site-media";
const FOLDERS = ["branding", "partners", "news", "about", "products"];
const SIGNED_TTL = 60 * 60 * 24 * 365;

const opts = { auth: { persistSession: false, autoRefreshToken: false } };
const src = createClient(SRC_URL, SRC_SERVICE_KEY, opts);
const dst = createClient(DST_URL, DST_SERVICE_KEY, opts);

const log = (...a) => console.log("•", ...a);

/* ------------------------------------------------------------------ users */

async function migrateUsers() {
  let page = 1;
  let total = 0;
  for (;;) {
    const { data, error } = await src.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    if (!data.users.length) break;

    for (const u of data.users) {
      const { error: createErr } = await dst.auth.admin.createUser({
        id: u.id,
        email: u.email,
        email_confirm: true,
        user_metadata: u.user_metadata ?? {},
        password: crypto.randomUUID() + crypto.randomUUID(),
      });
      if (createErr && !/already/i.test(createErr.message)) {
        console.warn(`  ! ${u.email}: ${createErr.message}`);
      } else {
        total += 1;
      }
    }
    if (data.users.length < 200) break;
    page += 1;
  }
  log(`users: ${total} account(s) ready on the new server`);
}

/* ----------------------------------------------------------------- tables */

// Order matters: parents before children (foreign keys).
const TABLES = [
  "site_settings",
  "profiles",
  "user_roles",
  "user_permissions",
  "product_categories",
  "products",
  "news",
  "partners",
];

async function migrateTables() {
  for (const table of TABLES) {
    const { data, error } = await src.from(table).select("*");
    if (error) throw new Error(`${table}: ${error.message}`);
    if (!data.length) {
      log(`${table}: empty`);
      continue;
    }
    const { error: upErr } = await dst.from(table).upsert(data, { onConflict: "id" });
    if (upErr) throw new Error(`${table}: ${upErr.message}`);

    const { count } = await dst.from(table).select("id", { count: "exact", head: true });
    log(`${table}: ${data.length} row(s) copied, ${count} row(s) on the new server`);
  }
}

/* ---------------------------------------------------------------- storage */

async function listAll(client, folder) {
  const out = [];
  let offset = 0;
  for (;;) {
    const { data, error } = await client.storage
      .from(BUCKET)
      .list(folder, { limit: 100, offset });
    if (error) throw error;
    if (!data?.length) break;
    out.push(...data.filter((f) => f.id).map((f) => `${folder}/${f.name}`));
    if (data.length < 100) break;
    offset += 100;
  }
  return out;
}

async function migrateStorage() {
  await dst.storage.createBucket(BUCKET, { public: false }).catch(() => {});
  let copied = 0;
  for (const folder of FOLDERS) {
    const paths = await listAll(src, folder);
    for (const path of paths) {
      const { data: blob, error } = await src.storage.from(BUCKET).download(path);
      if (error) {
        console.warn(`  ! download ${path}: ${error.message}`);
        continue;
      }
      const buf = Buffer.from(await blob.arrayBuffer());
      const { error: upErr } = await dst.storage
        .from(BUCKET)
        .upload(path, buf, { upsert: true, contentType: blob.type || "application/octet-stream" });
      if (upErr) console.warn(`  ! upload ${path}: ${upErr.message}`);
      else copied += 1;
    }
    log(`storage/${folder}: ${paths.length} file(s)`);
  }
  log(`storage: ${copied} file(s) copied`);
}

/* ----------------------------------------------------------------- relink */

/** Turns an old signed URL into the object path inside the bucket. */
function pathFromSignedUrl(url) {
  if (!url || !url.includes(`/${BUCKET}/`)) return null;
  const withoutQuery = url.split("?")[0];
  const idx = withoutQuery.indexOf(`/${BUCKET}/`);
  return decodeURIComponent(withoutQuery.slice(idx + BUCKET.length + 2));
}

async function resign(url) {
  const path = pathFromSignedUrl(url);
  if (!path) return url;
  const { data } = await dst.storage.from(BUCKET).createSignedUrl(path, SIGNED_TTL);
  return data?.signedUrl ?? url;
}

async function relinkImages() {
  // products.main_image + products.gallery
  const { data: products = [] } = await dst.from("products").select("id, main_image, gallery");
  for (const p of products) {
    const main_image = await resign(p.main_image);
    const gallery = await Promise.all((p.gallery ?? []).map(resign));
    await dst.from("products").update({ main_image, gallery }).eq("id", p.id);
  }
  log(`relink: ${products.length} product(s)`);

  // news.featured_image + news.gallery
  const { data: news = [] } = await dst.from("news").select("id, featured_image, gallery");
  for (const n of news) {
    const featured_image = await resign(n.featured_image);
    const gallery = await Promise.all((n.gallery ?? []).map(resign));
    await dst.from("news").update({ featured_image, gallery }).eq("id", n.id);
  }
  log(`relink: ${news.length} news article(s)`);

  // partners.logo_url (logo_path is the source of truth, so re-sign from it)
  const { data: partners = [] } = await dst.from("partners").select("id, logo_path, logo_url");
  for (const p of partners) {
    const path = p.logo_path || pathFromSignedUrl(p.logo_url);
    if (!path) continue;
    const { data } = await dst.storage.from(BUCKET).createSignedUrl(path, SIGNED_TTL);
    if (data?.signedUrl) await dst.from("partners").update({ logo_url: data.signedUrl }).eq("id", p.id);
  }
  log(`relink: ${partners.length} partner logo(s)`);

  // site_settings.seo_og_image
  const { data: settings } = await dst
    .from("site_settings")
    .select("id, seo_og_image")
    .eq("id", "default")
    .maybeSingle();
  if (settings?.seo_og_image) {
    await dst
      .from("site_settings")
      .update({ seo_og_image: await resign(settings.seo_og_image) })
      .eq("id", "default");
    log("relink: SEO share image");
  }
}

/* ------------------------------------------------------------------- main */

const only = process.argv[2];
try {
  if (!only || only === "users") await migrateUsers();
  if (!only || only === "tables") await migrateTables();
  if (!only || only === "storage") await migrateStorage();
  if (!only || only === "relink") await relinkImages();
  console.log("\nDone. Next: sign in on the new site and run through the checklist in selfhost/README.md.");
} catch (err) {
  console.error("\nMigration stopped:", err.message);
  process.exit(1);
}
