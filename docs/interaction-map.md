# Andre Archive Interaction Map

## Shared navigation model

Spatial artifacts, Index results, and mobile feed entries open the same archive records. Exploration is optional. Long-form content opens directly in editorial sheets without a mandatory Quick Look step.

| Control | Destination or behavior |
|---|---|
| Home | Return to archive and reset desktop opening composition |
| Work | Index filtered to Case Files |
| Index | Full searchable archive; visible during exploration and reading |
| About | Profile and verified experience |
| Resume | Approved preview and download, or explicit unavailable placeholder |
| Contact | Verified email and LinkedIn links, plus approved availability copy |
| Board Index card | Same destination as fixed Index |

## Artifact destinations

| Artifact | Opens |
|---|---|
| Case File folio | Corresponding full Case File sheet |
| Field Note | Question, observation, evidence, inference, recommendation, supported relationships |
| Experiment record | Premise, interaction, tools, status, demonstration, learning |
| Contact Sheet | Curated photos with captioned image detail |
| Cultural reference | Personal annotation and approved reference material |
| Timeline entry | Verified milestone and links to related existing records |

Featured path: arrival -> Badung Sehat -> editorial Case File -> genuinely related Field Note -> return to Case File or Index. SIMRS EMR Giri Asih is the second opening professional destination. Cross-links require real contextual support.

## Index behavior

- Search title, summary, associated project, year, and theme.
- Filter by type, year, and theme. Types are Case Files, Field Notes, Experiments, Contact Sheets, Cultural Index, Timeline, plus All.
- Sort by Featured, Newest, Oldest, or A-Z; default to Featured with a stable title tie-break.
- Unknown dates are not guessed and sort after known dates for chronological sorting.
- Search and separate filter dimensions combine to narrow results; clearing filters restores the full catalogue.
- Each result shows type, title, available year, one-line description, and relevant theme/project context.
- Show result count, clear filters, and a useful no-results state.
- Returning from a record restores query, filters, sort, scroll, and result focus.

Only published, public-safe records enter the production Index. Explicitly labelled safe placeholders may appear in an approved development preview; confidential drafts must never be bundled.

## Bounded desktop pan

Use a finite authored board translated along x and y. Do not move individual artifacts. Provide directional pan buttons and Home reset as alternatives to dragging; all records are also reachable through the Index.

Calculate bounds from artifact extents plus margins, including rotated corners. On each axis where the board exceeds the usable viewport, translation is clamped between viewport size minus board size and zero. Center the board on an axis where it fits. Preserve fixed-navigation clearance and clamp again on resize.

No inertia, bounce, zoom, wheel hijacking, or continuous movement. Preserve pan position while a sheet is open. Tablet and mobile do not enable this gesture.

## Click versus drag

1. Pointer down on an eligible board area records the pointer and pan origin.
2. Movement within a proposed 6 CSS-pixel threshold remains a potential click; tune through device testing.
3. Crossing the threshold starts pan, captures the pointer, and cancels artifact activation.
4. Pointer release after a drag never opens a record, including when the pointer ends over another artifact.
5. Pointer cancellation or lost capture clears gesture state safely.

Exclude navigation, input controls, and reading surfaces from pan handling. Suppress selection only on the board gesture surface during a drag. Sheet text remains selectable. Keyboard activation bypasses pointer gesture logic.

## Artifact feedback

Persistent title and type identify every destination. Hover and focus expose supplementary metadata and the open action; focus must be at least as informative as hover. Use native link/button activation semantics. Touch opens directly without a hover-first step.

## Reading and return behavior

Use one active editorial surface, not a stack of modal sheets. Opening a related record replaces the article while preserving navigable history. Use the section structures in content.md.

- In-context desktop opening uses a modal sheet; the board becomes inert.
- The active sheet contains usable Index and relevant utility access. Do not leave the only Index behind the inert background.
- Index from a sheet replaces the content surface with the Index, rather than nesting dialogs.
- Close and Escape dismiss the modal and restore its invoking context and focus.
- Back to Archive returns to the preserved board position; Home explicitly resets it.
- Browser Back/Forward restores destinations and supported return context without adding history entries for every pan movement.
- Direct record URLs render the same article as a standalone reading page with Back to Archive and Index. Do not rely on browser Back to reach the archive when the visitor arrived externally.
- Mobile uses full-width reading views and ordinary back navigation.

## Orientation and keyboard

Proposed guidance: "Open an artifact or use the Index." Desktop may add "Drag the mat to explore." Dismiss guidance after interaction for the session; omit drag copy elsewhere.

Keyboard order: skip links, fixed navigation, identity-related controls, Case Files, Field Notes, Experiments, supporting records. Semantic reading order is independent of spatial coordinates. Bring a focused offscreen artifact into view, immediately under reduced motion.

For modal sheets, move focus to an appropriate title/content start, contain focus, support Escape, and restore focus to the source. If that source no longer exists, use a logical visible fallback such as Index. Do not trap focus in standalone pages. Announce updated Index counts without repeatedly interrupting input.

## Responsive and error behavior

- Tablet: smaller authored composition, no pan, visible Index for the full catalogue.
- Mobile: identity, featured Case Files, remaining work, Field Notes, Experiments, Contact Sheets/Cultural Index, Timeline, About, Resume, Contact; normal scrolling without overlapping text.
- Missing image: keep title, caption context, and navigation available.
- Missing content or asset: explicit safe placeholder in preview, no fabricated evidence or broken download.
- Failed motion: open the content immediately.
- Invalid record URL: readable not-found state with Index access.
- No autoplay. Approved demonstration media, if supplied, starts only on user action.
