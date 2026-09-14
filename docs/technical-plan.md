# Andre Archive Technical Plan

## Status and repository baseline

Documentation is the only authorized implementation work at this stage. Wait for explicit user approval before scaffolding the application, installing packages, or creating UI.

At inspection, the repository contained five root Markdown specifications and one concept playbook DOCX. There was no docs directory, package manifest, source tree, component implementation, project-data module, asset directory, or Git metadata. The five specifications are now consolidated in docs without root duplicates. Existing project names, summaries, and editorial structures are reusable content; there is no existing application code to reuse or migrate.

The playbook remains unchanged as historical reference. Only the canonical documents and current user decisions govern implementation.

## Rendering and stack

Build a static, content-driven Next.js App Router and TypeScript portfolio. Generate static HTML routes at build time and serve local public assets. No runtime server, API routes, server actions, database, CMS, authentication, analytics, or external services.

The spatial board is semantic HTML elements positioned and styled with CSS, translated in two dimensions by client-side pointer interaction. It is not a raster canvas renderer or a 3D scene. No WebGL, Three.js, React Three Fiber, physics, first-person behavior, perspective, or 3D transforms.

Use CSS for the mat grid, layering, responsive styling, and restrained transitions. Additional styling, icon, motion, or state packages are not a requirement; select only necessary dependencies during approved implementation. Prefer native browser behavior and a small React interaction store/context first.

Configure static export. Generate all published record paths at build time. Use locally preprocessed responsive images rather than a runtime image-optimization endpoint. Verify direct URLs and refresh behavior on the chosen static host. No hosting or deployment is authorized in this phase.

## Component architecture

| Area | Responsibility |
|---|---|
| ArchiveShell | Fixed navigation, identity, coordinated view selection |
| SpatialViewport | Bounds, pointer input, pan alternatives |
| CuttingMat | Static grid and material styling |
| ArchiveArtifact and variants | Semantic open action, labels, visual treatment |
| ArchiveIndex | Query, filters, sorting, results |
| EditorialSheet | Active reading surface, navigation, focus, close behavior |
| Record renderers | Case File, Field Note, Experiment, Contact Sheet, Culture, Timeline |
| EditorialFeed | Mobile ordering using the same content |
| Utility views | About, Resume, Contact |

Separate content records, visual artifact placement, and interaction state. Reuse the same article renderer for an in-context sheet and a direct record page. Keep only one active reading surface.

## Proposed application structure after approval

```text
src/
  app/
    layout.tsx
    page.tsx
    index/
    archive/[slug]/
    about/
    resume/
    contact/
  components/
    navigation/
    archive/
    artifacts/
    index/
    sheets/
    feed/
    accessibility/
  content/
    case-files/
    field-notes/
    experiments/
    contact-sheets/
    cultural-index/
    timeline/
    profile/
  data/
    archive-manifest.ts
    board-layouts.ts
    featured-order.ts
  hooks/
  stores/
  types/
  lib/
    search.ts
    content-validation.ts
    navigation.ts
  styles/
    tokens.css
public/
  images/
  textures/
  documents/
```

These paths describe future work; no application files are created by this documentation update.

## Content data model

| Group | Fields and rules |
|---|---|
| Identity | Stable ID, unique slug, type, title, summary |
| Classification | Themes and associated project IDs |
| Date | Optional date/year and precision; unknown stays unknown |
| Ordering | Featured rank and explicit mobile order |
| Relationships | Related record IDs, validated against real context |
| Media | Local source, dimensions, alt text, caption, approval/rights status |
| Publication | Draft, reviewed, published; explicit placeholder status |
| Body | Typed sections appropriate to the record type |

Use a discriminated record model for Case File, Field Note, Experiment, Contact Sheet, Cultural Index entry, and Timeline entry. Index itself is not a record type.

Case Files carry role/team, constraints, decisions, results and evidence when supplied. Field Notes distinguish sources, observations, inference, and recommendations. Experiments carry premise, interaction, tools, status, media, and learning. Photo/cultural/timeline records use their own caption and context fields.

Board layout records reference content IDs and store artifact variant, x/y, width/height, rotation, and overlap order. These are layout properties, not content or physical simulation properties. The same record can appear in board, Index, and feed without duplicate body content.

Build validation checks unique slugs/IDs, valid relationships, required alt/caption metadata, publication eligibility, and unsupported claims marked as gaps. Confidential drafts and assets must not enter generated HTML, search manifests, client bundles, or public files. A hidden UI flag is insufficient.

## State and navigation ownership

| State | Owner |
|---|---|
| Destination and open record | URL/navigation |
| Index query, type/year/theme filters, sort | URL query parameters |
| Pan and return context | Small UI store/context |
| Pointer origin, active pointer, drag threshold | Local refs |
| Hover/pressed state | CSS or local state |
| Reduced motion | System preference |
| Guidance dismissal | Session state |
| Record content | Static content modules, never global interaction state |

Do not maintain competing selected-project, selected-record, and active-panel values. Preserve board position and Index context during reading. Route transitions, direct loading, Back/Forward, and focus return must work with static export; do not assume server-dependent overlay routing is available.

## Spatial and responsive implementation

Apply one two-dimensional transform to the board container. Compute finite extents with padding, clamp translation, center fitting axes, and re-clamp on viewport changes. Keep fixed navigation outside the transformed element. Use frame-scheduled updates only while input changes; avoid React-wide renders on every pointer move.

Follow interaction-map.md for the proposed 6 CSS-pixel click/drag threshold, pointer cancellation, capture, pan buttons, and reset behavior. No wheel hijack, momentum, zoom, or individual artifact rearrangement.

Desktop supports pan. Tablet uses a reduced static spatial arrangement. Mobile renders the editorial feed. Base layout selection on available readable space and input capability, including zoom. All views use one content source and preserve destinations. Without discovery enhancements, direct links and static reading pages remain usable.

## Performance and accessibility

- Use a curated board subset; keep all published records in a lightweight Index manifest.
- Pre-size and compress images; defer full case-study media and secondary galleries.
- Limit font weights, shadow complexity, large textures, and unnecessary client code.
- Avoid continuous animation loops and mounting every article on arrival.
- Preserve semantic navigation and visible focus independently of visual layering.
- Follow modal focus containment, Escape, and focus restoration only for modal presentation.
- Keep an operable Index in the active reading surface.
- Support text reflow, contrast, sufficient targets, reduced motion, and image alternatives.

## Prioritized phases after approval

1. Foundation: static app shell, deep blue mat, identity, two Case File artifacts, one Field Note artifact, fixed Index, one reading sheet, desktop pan, tablet composition, mobile feed.
2. Professional content: all five Case Files, approved Field Notes, search/filter behavior, validated relationships, static direct routes.
3. Supporting collections: three Experiments, Timeline, curated photography/culture, About, Resume, Contact.
4. Visual refinement: typography, material cues, authored composition, restrained interaction transitions.
5. Release audit: functional, responsive, keyboard, reduced-motion, performance, content integrity, and privacy checks.

First milestone passes when identity is clear, the same record opens from board and Index, dragging never triggers activation, keyboard reading and return work, and mobile scrolls normally. Use explicit public-safe placeholders where evidence is missing.

## Verification during implementation

- Validate content references and exclude private/draft material from production output.
- Check pan edges, resize, pointer cancellation, accidental activation, and focus visibility.
- Check Index search/filter combinations, sorting with missing dates, empty results, and restored state.
- Check direct URLs, refresh, Back/Forward, closing, related records, and invalid slugs.
- Test keyboard only, screen reader labels, reduced motion, zoom/reflow, tablet touch, and mobile overflow.
- Verify missing images and unavailable Resume/Contact content fail honestly.
- Run appropriate typecheck, lint, static build, and browser checks after application code exists.
- Inspect initial assets and interaction responsiveness on constrained devices.

## Inputs still needed

See content.md for the content/asset checklist. Exact palette tokens, typefaces, final opening artwork, breakpoints, and interaction tuning remain implementation-review decisions. They do not permit fabricated content or extra features.
