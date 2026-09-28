# Andre Archive Studio setup

The public archive remains a statically exported Next.js site. Supabase stores draft data, approved public assets, the admin allowlist, and one atomic published snapshot. The browser never receives a Supabase secret or service-role key.

## 1. Create the Supabase project

1. Create a Supabase project.
2. Open **SQL Editor** and run the complete migration in `supabase/migrations/202609270001_archive_studio.sql`.
3. Confirm that the `archive-drafts` private bucket and `archive-public` public bucket exist.

The migration enables RLS, limits draft access and storage writes to allowlisted admins, exposes only the published snapshot and approved asset metadata publicly, validates board payloads, protects referenced assets, and publishes the board atomically. Image uploads are converted to WebP. MP3 uploads retain their original format.

## 2. Create and allowlist the admin

Public registration is intentionally unavailable.

1. In **Authentication > Users**, create Andre's user manually.
2. Copy the user's UUID.
3. Run this in the SQL Editor, replacing the placeholder:

```sql
insert into public.admin_users (user_id)
values ('YOUR-AUTH-USER-UUID');
```

Adding a row here is the only way to grant Studio access. Authentication alone does not grant access.

## 3. Configure the application

Copy `.env.example` to `.env.local` and fill in the project's browser-safe values:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR-PUBLISHABLE-OR-ANON-KEY
```

Do not put a service-role or secret key in a `NEXT_PUBLIC_` variable.

Install and start the site:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000/admin`. The available routes are:

- `/admin` — private login
- `/admin/dashboard` — Studio overview
- `/admin/board` — visual editor and real-component preview
- `/admin/artifacts` — artifact inventory
- `/admin/assets` — upload, optimize, approve, replace, and remove assets
- `/admin/settings` — board-level settings

## 4. Create the first draft and publish it

When the database version is `0`, the editor starts from the current local archive layout. This preserves the existing production board as the migration baseline.

1. Open **Board** and choose **Save Draft**.
2. Open **Assets** to upload new files. Uploads are converted to WebP in the browser, resized, and stored privately first.
3. Approve every asset that the public board will reference. Approval copies it to the public bucket; publishing rejects unapproved references.
4. Return to **Board**, inspect **Preview**, and choose **Publish**.

Draft changes remain invisible to public visitors until Publish completes. Publishing writes a single versioned snapshot, so visitors never receive a partially updated layout.

### Existing project hotfix

If Studio shows `DELETE requires a WHERE clause` when saving, run `supabase/migrations/202609280001_fix_safe_draft_replace.sql` once in the Supabase SQL Editor. Then reload Studio before saving again. The original migration is also corrected for new projects.

To import MP3 tracks, also run `supabase/migrations/202609280002_enable_audio_assets.sql` once. It allows `audio/mpeg` in the asset table and both Storage buckets, preserves private-to-public approval, and prevents publishing a board that references unapproved audio.

To create and publish flip cards, run `supabase/migrations/202609280004_add_card_artifact.sql` once. It registers the `card` artifact validator and protects both front and back asset references. Without it, the Board editor can display a card but Supabase will reject Save Draft with `Unsupported artifact type`.

## 5. Local asset migration

`docs/studio-asset-manifest.json` records the currently referenced local files, hashes, and uses. Existing `/archive/...` media remains a valid fallback, so introducing the CMS does not require a risky all-at-once upload.

Use **Assets > Import assets folder** to upload supported images and MP3 files from the complete local `assets` folder, including nested `photos` and `puzzle` images. Images are optimized to WebP, MP3 files retain their original format, each source path is recorded, and matching board image/audio references are updated in the draft. A file-level decode or upload error is reported while the remaining files continue.

The separate **Import local board**, **Import local photos**, and **Import local puzzle** actions remain available for targeted imports. **Import local board** imports both music covers and their MP3 tracks. Approve both before publishing; the published board then plays audio from Supabase Storage.

Recommended order:

1. Publish the current local-path board once as a known-good baseline.
2. In **Assets**, click **Import local board**. This imports every raster or SVG image currently referenced by a board artifact, converts it to WebP, creates a thumbnail, and rewrites that artifact's draft image URL and `asset_id`.
3. Wait for the success status; do not close the tab while files are being processed.
4. Review names, categories, alt text, dimensions, and previews.
5. Approve each imported board asset for public access.
6. Save Draft, open Preview, and check every custom interaction, especially books, projector posters, Polaroids, stickers, and music covers.
7. Publish, then hard-refresh the public archive in a private window.
8. Click **Import local photos**, approve the imported photo files, and verify Photos before the next publish.
9. Click **Import local puzzle**, approve those files, and verify Mini Games before the next publish.
10. Upload unused archive images only if you want them available for future artifacts. They do not need to be migrated for the current public page.

SVG sources are rasterized to WebP during import. The public bucket therefore serves optimized images rather than executable SVG documents. MP3 files are uploaded without conversion; `/public/archive/audio` remains the migration/failure fallback until the hosted workflow is verified.

## 6. Gallery and Puzzle collections

Run `supabase/migrations/202609280003_published_collections.sql` once for an existing project. Studio then provides `/admin/gallery` and `/admin/puzzle`. Add approved image assets directly or use **Import approved local fallback**, edit metadata and order, choose **Save Draft**, inspect **Preview**, and use **Publish Collections**. One atomic public snapshot contains both collections; board publication remains separate.

The public archive requests the published board once and the published collection snapshot once per page load. During migration, `photo-manifest.json`, `puzzle-manifest.json`, and `localBoard` remain fallback data if their corresponding public snapshot cannot be fetched.

Do not delete `public/archive/assets` after the first successful upload. Keep it until all three import groups have been approved, saved, published, and verified on the deployed production site. It remains the offline and first-load fallback for installations with no published Supabase snapshot.

## 7. Deployment

`next.config.mjs` still uses `output: 'export'`. Deploy the generated `out` directory as before. Admin authentication runs in the browser, while RLS and security-definer RPC functions enforce authorization in Supabase.

Static hosting cannot protect the `/admin/*.html` files at the HTTP edge; an unauthenticated visitor may download the login shell, but cannot read or mutate drafts, assets, settings, or admin membership. If edge-level route secrecy becomes a requirement, move the deployment to an SSR-capable host and add middleware. That is optional and is not required for data security.

## 8. Validation

Run the repository checks:

```powershell
npm run typecheck
npm run lint
node scripts/test-studio-model.cjs
node scripts/test-studio-database.mjs
```

The browser workflow test expects the development site on port `3006` with its mocked Supabase endpoint configuration. It verifies the public registry, book geometry, repeated track switching, private admin gate, editor interactions, draft/publish separation, and the full private-upload-to-public-approval asset flow.

Before a production release, also verify login, upload, preview, publish, logout, and public rendering once against the real hosted Supabase project.
