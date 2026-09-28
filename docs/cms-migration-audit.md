# Andre Archive CMS migration audit

## Scope and current decision

Real Supabase production workflow verification is complete. The public archive, Studio publish flow, and anonymous RLS behaviour have been verified. The local fallback remains intentional: a production-style outage simulation that blocked Supabase requests still rendered 34 artifacts, 4 books, and 7 music artifacts with no browser errors.

## Runtime references

| Source | Current role | Classification |
| --- | --- | --- |
| `src/data/local-board.ts` | Initial Studio seed and public board fallback if the published board cannot be fetched | B — migration/failure fallback |
| `src/data/photo-manifest.json` | Public Gallery fallback and Studio migration seed | B — migration/failure fallback |
| `src/data/puzzle-manifest.json` | Public Puzzle fallback and Studio migration seed | B — migration/failure fallback |
| `src/data/tracks.ts` | Builds the local board fallback and supports the legacy standalone Mixtape component | B — migration/failure fallback |
| `public/archive/assets` | Board/mobile fallback imagery | B — migration/failure fallback |
| `public/archive/audio` | Board fallback MP3 sources | B — migration/failure fallback |
| `public/archive/photos` | Gallery fallback sources | B — migration/failure fallback |
| `public/archive/puzzle` | Puzzle fallback sources | B — migration/failure fallback |
| `public/favicon.svg` | Browser metadata asset independent of CMS | A — runtime static asset |

## Scripts

| Script | Function | Current decision |
| --- | --- | --- |
| `scripts/sync-photos.mjs` | Copies `assets/photos` to `public/archive/photos` and generates the Gallery fallback manifest | Retain while fallback exists |
| `scripts/sync-puzzle.mjs` | Copies `assets/puzzle` to `public/archive/puzzle` and generates the Puzzle fallback manifest | Retain while fallback exists |
| `scripts/dev.mjs` | Watches local Puzzle input and invokes synchronization during development | Retain while fallback exists |
| `scripts/studio-asset-manifest.cjs` | Hashes local board, Gallery, Puzzle, and audio inputs for migration evidence | C — migration/reference; retain through production verification |
| `scripts/prepare-studio-baseline.mjs` | Creates isolated baseline validation source | C — development validation |
| `scripts/prepare-studio-current.mjs` | Creates isolated current validation source | C — development validation |
| `scripts/test-studio-model.cjs` | Validates local fallback and registry contracts | C while fallback exists |
| `scripts/test-studio-database.mjs` | Tests RLS, draft isolation, and atomic publication | A — retain |
| `scripts/test-studio-browser.mjs` | Tests public and Studio workflows with mocked Supabase HTTP | A — retain |

## Mobile audit

The previous hardcoded Pokémon, first album, first contact photo, Figma, Marvel, and Bali postcard URLs were in `figma_make/src/App.tsx`. Mobile now derives these elements from the same published board and Gallery snapshots used by desktop. No additional request is made during scrolling.

## Root `assets/` status

**Not safe to delete.** A reversible `assets` to `assets__backup` test was run after production verification. Typecheck, lint, model, and database tests passed, but `prebuild` synchronised zero photo/puzzle inputs and rewrote both manifests to empty arrays. The original folder was restored and normal sync regenerated 9 photos and 3 puzzle entries. This proves `assets/` remains a build-time dependency until the sync/fallback system is deliberately removed.

## Final cleanup classification

| Item | Classification | Evidence |
| --- | --- | --- |
| `assets/` | A — build input | `prebuild`, `dev.mjs`, and sync generators require it; rename test proved it. |
| `public/archive/assets`, `audio`, `photos`, `puzzle` | B — intentional outage fallback | Used by `localBoard` and manifests; outage simulation rendered the fallback instead of a blank public page. |
| `localBoard` | B — intentional board fallback and Studio version-0 seed | `FigmaArchive`, Studio bootstrap/logout, asset migration, tests, and public failure handling import it. |
| `photo-manifest.json`, `puzzle-manifest.json` | B — intentional Gallery/Puzzle fallback and import seed | Used by `FigmaArchive`, `PicturePuzzle`, `CollectionEditor`, `AssetManager`, sync generators, and tests. |
| `sync-photos`, `sync-puzzle`, `dev.mjs` | A — active build/development support | Called from `package.json` and depend on the current fallback contract. |
| `studio-asset-manifest`, prepare scripts, audit documents | C — development/migration evidence | Not public runtime dependencies. Retain for reproducible validation. |
| Candidate files proven safe to remove | D — none | No local fallback group was removed because each has a live production or build dependency. |

## Future cleanup candidates

After verified removal of fallbacks, the following may become D — safe to delete: `assets/photos`, `assets/puzzle`, migrated root image/MP3 inputs, generated Gallery/Puzzle manifests, their sync scripts, and related npm scripts. Each candidate must be re-audited after production verification; this document is not deletion authorization.
