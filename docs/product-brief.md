# Andre Archive Product Brief

## Status and authority

This is the canonical product brief for Andre Archive. The five documents in this directory are the active specification. The root concept experiment playbook is historical reference, not an implementation instruction source. The user's approved archive decisions take precedence over earlier concept material.

Current authorization covers documentation only. Application implementation requires the user's next approval. Do not install packages or create application UI during this documentation phase.

Document responsibilities:

- [Design system](design-system.md): visual language and presentation.
- [Interaction map](interaction-map.md): navigation and interaction behavior.
- [Technical plan](technical-plan.md): architecture, data, state, and delivery.
- [Content](content.md): record inventory, copy status, and evidence gaps.

## Product

Andre Archive is an interactive editorial portfolio for Andre Sanjaya, a Product and UI UX Designer based in Bali, Indonesia. It presents a curated body of professional work, design thinking, experiments, and personal references on a full-screen deep blue cutting mat.

Three coordinated views share the same content:

1. Desktop spatial discovery board with bounded two-dimensional drag-to-pan.
2. Conventional searchable Index for direct navigation.
3. Readable editorial sheets for record content.

Tablet uses a reduced spatial composition without drag-to-pan. Mobile uses a curated editorial feed and standard scrolling.

## Audience and goals

Primary audiences are product design recruiters, design leads, and potential freelance clients.

- Make Andre's identity and role immediately understandable.
- Let visitors reach professional work, About, Resume, and Contact within one or two intentional actions.
- Demonstrate contribution and design reasoning through honest, readable evidence.
- Communicate personality through meaningful, curated artifacts.
- Preserve equivalent access for keyboard users, touch users, reduced-motion preferences, and constrained devices.

## Experience principles

- The board is for discovery; sheets are for reading.
- Case Files dominate professional and personal content visually.
- Every artifact reveals work, thinking, perspective, or navigation.
- Spatial exploration is optional. The Index is always a visible, usable route.
- Composition is authored: controlled overlap, limited rotation, underlying alignment, and clear labels.
- Cinematic character comes from composition, typography, cropping, and restrained transitions.
- Missing evidence is a labelled placeholder, never an invented fact.

## Collection hierarchy

| Collection | Purpose | Priority |
|---|---|---|
| Case Files | Professional projects and contribution | Primary |
| Field Notes | Design questions, evidence, inference, recommendations | Primary supporting |
| Experiments | Interaction exploration and learning | Secondary professional |
| Timeline | Education, experience, project milestones, learning | Supporting context |
| Contact Sheets | Curated photography and personal moments | Personal |
| Cultural Index | Annotated movies, music, Pokemon, books, interfaces | Personal |

Index is the navigation system across collections, not a record type. Healthcare is a theme spanning relevant Case Files, not a duplicate collection. About, Resume, and Contact are direct utility destinations.

## Professional inventory and opening priority

- Badung Sehat: proposed flagship and largest opening Case File.
- SIMRS EMR Giri Asih: second professional Case File.
- Hemodialysis EMR, NurTani, Sanata CMS: remaining Case Files.
- Field Notes: the nine topics listed in content.md.
- Experiments: JARVIS, Body Drummer, Teach the Machine.

The opening view exposes identity, the flagship title, and fixed Index access without panning. Supporting Case Files and Field Notes precede Experiments and personal references. The board may show a curated subset; the Index exposes every published record.

## Responsive hierarchy

- Desktop: full-screen spatial board with finite bounds and fixed navigation.
- Tablet: reduced non-pannable spatial composition, readable artifact targets, visible Index.
- Mobile: identity, featured Case Files, remaining work, Field Notes, Experiments, Contact Sheets and Cultural Index, Timeline, About, Resume, Contact.
- Constrained or non-interactive presentation: readable content and direct links remain available; discovery effects are progressive enhancements.

## Success criteria

- Identity is understandable on arrival; the playbook's 15-second task is a validation target, not a measured result.
- Badung Sehat opens directly from its artifact or Index result without a mandatory preview step.
- Visitors can read, close, and return to their previous context.
- Dragging does not accidentally open a record.
- Index remains usable during exploration and reading.
- Mobile has normal scrolling, readable text, and no forced landscape orientation or horizontal page overflow.
- Keyboard and reduced-motion users can reach every published destination.

## Explicit exclusions

No 3D, WebGL, Three.js, React Three Fiber, physics, first-person navigation, perspective navigation, or simulated rooms. No unbounded panning, zoom system, individually rearrangeable artifacts, continuous floating, autoplay, or forced cinematic sequences.

No conventional vertical desktop portfolio, random scrapbook, meaningless decorative artifacts, or shrunken mobile board. No database, CMS, authentication, backend, analytics, external services, accounts, or multiplayer. No invented outcomes, metrics, dates, research, or citations. No patient data, confidential information, or unapproved client assets.
