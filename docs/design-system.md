# Andre Archive Design System

## Direction

Use a deep blue cutting mat with layered paper and print artifacts. The experience should feel editorial, technical, playful, cinematic, personal, tactile, and curated. Follow [product-brief.md](product-brief.md) for scope and [interaction-map.md](interaction-map.md) for behavior.

Deep blue is the approved primary direction. Green is not a second release theme; no theme switcher is planned. Exact color values, typefaces, and final composition remain visual refinement decisions, not approved assets.

## Material and color roles

| Role | Treatment |
|---|---|
| Mat | Muted deep blue covering the spatial viewport |
| Grid | Low-contrast fine lines and slightly clearer major divisions |
| Paper | Warm off-white with restrained variation |
| Paper text | Near-black |
| Fixed navigation | High-contrast neutral text and controls |
| Accent | Small orange-red marks used purposefully |
| Texture | Subtle static grain; never heavy distressing |

Construct the grid with CSS. Use a small repeatable texture only if needed. Grid and artifacts share board coordinates. Texture cannot obscure labels, focus indicators, or text. Color must never be the sole indicator of action or state.

## Typography and spacing

- Use readable sans-serif body and interface text, a restrained optional serif display role, and limited monospace metadata.
- Keep font families, weights, and downloads economical.
- Artifact labels remain upright and readable; long-form text is never rotated.
- Reading text should target approximately 60-75 characters per line, with comfortable line height and responsive margins.
- Use a consistent spacing scale, fine borders, limited corner rounding, and restrained shadows.
- Avoid giant rounded cards, broad gradients, glass effects, random stickers, and generic decorative quotes.

## Hierarchy and opening composition

1. Identity and flagship Case File.
2. Second Case File and Field Notes.
3. Experiments and supporting professional records.
4. Personal photography and cultural references.

Suggested opening layout, to refine with approved assets:

| Area | Content |
|---|---|
| Upper-left | Identity card: name, role, Bali |
| Center-left, largest | Badung Sehat folio |
| Center-right | SIMRS EMR Giri Asih folio |
| Adjacent professional area | Two Field Note artifacts |
| Secondary right area | One Experiment record |
| Lower/peripheral area | Up to three curated photographs |
| Near personal photographs | Meaningful cultural ticket and location fragment, only if supported by actual content |
| Clearly exposed | Index card, supplementing the fixed Index control |

Use placeholders where assets are not approved. Do not invent a photograph, ticket history, map location, or project relationship to fill space. Remove unsupported artifact slots rather than adding random filler.

Use an underlying layout grid with manually authored positions. A starting rotation range of approximately -3 to +3 degrees is a tuning proposal. Overlap margins only: titles, actions, and focus rings must remain unobstructed. Preserve enough empty mat to understand grouping and initiate panning.

## Artifact language

- Case Files: numbered folios with title, type, supported metadata, problem summary, and approved screenshot crop or labelled placeholder.
- Field Notes: concise annotated note artifacts.
- Experiments: lab-style records with premise and status.
- Contact Sheets: curated photographic layouts.
- Cultural Index: meaningful tickets, reference lists, or covers with personal annotations.
- Timeline: dated entries using verified dates.

Case File numbers are editorial identifiers, not implied chronology. Different forms share typography, metadata rules, and interaction feedback.

## Navigation and reading sheets

Fixed navigation contains Home, Work, Index, About, Resume, Contact. Work opens the Index filtered to Case Files. Index uses a visible text label.

Sheets use stable, high-contrast paper surfaces, upright text, clear title and context, readable figures, Close, Back to Archive, and Index access. Case Files may use a sticky section index when space permits. On narrow screens, section navigation must not obscure reading content.

## Interaction states and motion

Support default, hover, focus-visible, pressed, active, and genuinely unavailable states. Persistent title/type labels must not require hover. Supplementary metadata may appear on hover or focus.

Use a small two-dimensional offset, outline, or shadow change for artifact feedback. Layer order expresses overlap only; no perspective or translateZ effects. Short transitions in the playbook's 160-360 ms range are a starting point for testing, not a required delay before content appears.

No ambient animation loops, floating paper, parallax, flashing, forced entrances, or scroll-triggered travel. Reduced motion removes lift/travel transitions and opens content immediately. Manual pan remains directly controlled by the user.

## Responsive and accessibility requirements

Desktop permits bounded pan. Tablet simplifies the composition without pan. Mobile removes overlap and rotation and uses an editorial feed. Choose breakpoints based on readable content, usable space, input capabilities, and browser zoom; do not rely on device names alone.

Use semantic controls, logical focus order, visible focus, adequate target sizes, sufficient text and control contrast, and text reflow. Meaningful images need useful alternatives; purely decorative textures are hidden from assistive technology. Image failures preserve labels and destination controls.
