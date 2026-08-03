# Move the brand logo to the backend

Today the logo is saved as a data URL in the admin's browser (`localStorage`), so it only appears on the device where it was uploaded. This moves it into cloud storage so every visitor sees it.

## What changes for you

- Uploading a logo in Admin → Branding stores it in the backend's media storage instead of your browser.
- The logo then appears for all visitors on all devices: site header, footer, product pages and invoice PDFs.
- Removing the logo deletes the stored file for everyone.

## Approach

Reuse the exact pattern already working for the About Us video: the existing private `site-media` bucket, a `branding/` folder, and a long-lived signed URL for public display.

## Technical details

1. **Storage policies** — add policies on `storage.objects` for the `branding/` prefix in `site-media`: public read, admin-only insert/update/delete (matching the video setup).
2. **`src/lib/admin-branding.ts`** — replace the localStorage store with async functions mirroring `about-video.ts`:
   - `getLogoUrl()` — lists `branding/`, returns a signed URL or `null`
   - `uploadLogo(file)` — validates image type and size (max 1.5 MB), replaces the existing file
   - `deleteLogo()` — removes the stored file
   - keep `readFileAsDataUrl` only if still needed for local preview
3. **`src/routes/admin._authed.branding.tsx`** — upload/remove call the new async functions, with loading state and toasts.
4. **`src/routes/index.tsx`** and **`src/routes/products.$slug.tsx`** — fetch the logo URL from storage in the existing effect instead of `loadLogo()`; no visual/layout change.
5. **`src/lib/admin-invoice-pdf.ts`** — fetch the stored logo (as a data URL for embedding) before rendering the PDF.

No database schema change is needed; the file's presence in storage is the source of truth.
