# Andre Archive Studio: repository and interaction audit

## Production path and deployment

`src/app/page.tsx` → `src/components/archive/FigmaArchive.tsx` → `figma_make/src/App.tsx`. The nested Vite project is not the Next deployment entry. Next 14 / React 18, static export. No existing Supabase integration or environment configuration found. Keep static export: admin shells are public static HTML; private data and mutations are protected by Supabase Auth + database/Storage RLS. No claim of server route protection. A future SSR deployment requires a Next server and SSR cookies; this implementation deliberately does not change hosting.

## Existing interactions before migration

| Type | Existing implementation | State / behavior retained |
| --- | --- | --- |
| Identity | App JSX + SocialIcon, `.identity-*` | Theme, social anchors, content/experience; no image modal |
| Book | `.book-artifact-scene`, front/back/pages | 600px perspective, ±15px depth, rotateY(-20deg) scale(1.03) translateX(-2px), 300ms; no generic image replacement |
| Cinema (movie/series) | ProjectorPoster | Diagonal projector sweep, poster lift/scale/shadow; sound on click |
| Polaroid | Polaroid + Tape | Frame, tape, caption, object fit/focus, lift tooltip; no image modal |
| Music | Record markup + App shared audio | Vinyl extends/spins/retracts; singleton audio, request token protects rapid switching |
| Sticker | Sticker | Local pointer drag offset, click discovery/sound, tooltip, entrance |
| Pokémon / Marvel / stamp / decoration | Artifact with dedicated content | Discovery and card sound for Pokémon; native image presentation, preserved shadows and cursors |
| Secret | Conditional Artifact | Appears after Figma + Pokémon discovery |
| Tiny Pixel | TinyPixelCanvas file, currently not mounted | 16×16 pencil/eraser, localStorage, PNG export; keep optional, do not re-add automatically |
| Puzzle | lazy PicturePuzzle | Existing game state and navigation; stays a shared destination |

Desktop pan is imperative RAF translation and momentum; mobile is native two-axis scroll of the scaled board. Preserve this behavior during CMS migration. Audio state is owned above all artifact records, never keyed by layout/snapshot.

## Assets and generated files

Board and audio: `/public/archive/assets` and `/public/archive/audio`, referenced by App / tracks. Photos and puzzle have generated JSON manifests and copies produced by `scripts/sync-photos.mjs` and `scripts/sync-puzzle.mjs`; dev watches sources. Keep these scripts and all originals. Do not migrate unused legacy variants or build/node_modules files. Migration uses an explicit source-path manifest and unique source path to avoid duplicate uploads. Public fallback remains local until a valid published snapshot exists.

## Boundaries

Data: serializable records and validated supported enums. Registry: renderer + allowed fields, presets/actions/layout. Application: music, discovery, viewers and navigation. Admin-only modules are imported only under `/admin`. Editor pointer controls are local; Save Draft and Publish are explicit transactions. Edit mode makes artifact descendants inert; Preview uses the public renderer and application state.
