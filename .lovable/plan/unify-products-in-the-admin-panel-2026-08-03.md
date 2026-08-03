# Unify Products in the Admin Panel

## What's wrong today

There are three overlapping product concepts, and none of them are connected:

1. **Products table** (top of the admin Products page) — a demo list held in memory only. Edits vanish on refresh and never reach the website.
2. **Website product information** (bottom table + "Add Website Product") — stored in the browser's local storage. This is the only one that feeds `/products/<slug>` pages.
3. **The homepage product grid** — hardcoded fruit/vegetable lists in the translation file. It ignores both admin tables entirely.

On top of that there are two near-identical classification fields: **Category** (Fruits / Vegetables) and **Group** (fruits / vegetables), plus **Sub Category** (Export / Import). And categories are fixed in code, which is why the admin cannot add a new one.

## Proposed structure

One product record, one editor, three clear fields:

- **Type**: Export Products / Import Products (stays a tab)
- **Category**: admin-managed list (Fruits, Vegetables, and anything new they add), with English + Arabic names
- **Product**: name, intro, description, images, specs with Show/Hide toggles, publish switch, ordering

The duplicated "Group" field goes away — Category replaces it. The two tables on the admin Products page merge into one table with a single "Edit" dialog covering both the listing fields and the website page content.

## Work

1. **Database**: create `product_categories` (slug, name EN/AR, sort order, active) and `products` (type, category, slug, EN/AR name/intro/description, specs JSON, hidden specs, main image, gallery, published, sort order) in the backend, with public read for published rows and admin-only writes. Seed the existing catalog products so nothing is lost.
2. **Categories manager**: new admin page — add, rename (EN/AR), reorder, enable/disable, delete (blocked when products still use it).
3. **Products page rewrite**: single table per Export/Import tab, filter by category, reorder, publish toggle, one unified edit dialog (replacing the current two-dialog split), delete.
4. **Public site**: homepage product grid and `/products/<slug>` read from the database, grouped by the admin's categories, so new categories and products appear with no code change.
5. Remove the mock product data and the local-storage product store once the pages read from the database.

## Technical notes

- New tables in Lovable Cloud with row-level security: published products and active categories readable by anyone, writes restricted to the admin role. Grants issued in the same migration.
- Reads go through public server functions so the homepage and product pages keep server-side rendering and SEO metadata.
- Images continue to use the existing `site-media` storage bucket instead of embedding data URLs in the record.
- `src/lib/products-catalog.ts` stays as the seed source for the migration, then is no longer read at runtime.
