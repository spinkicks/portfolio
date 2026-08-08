# Portfolio Content Refresh and Body Redesign

## Goal

Update the portfolio for Summer 2027 software engineering, applied-AI, ML, and LLM-engineering internships. Preserve the landing page and dual-layout identity while replacing stale claims, prioritizing strong work, and tightening the content below the fold.

Both layouts must expose the same canonical portfolio facts. Their visual structures should remain distinct.

## Source Hierarchy

Use the three tailored resumes for concise wording and prioritization. Use `alphaPortfolio.md`, `wslProjectsConsolidated.md`, and the user's factual boundaries to verify metrics, ownership, status, and limitations.

`app/content.ts` remains the only portfolio data source.

## Content Model

Extend `Project` with:

- `tier`: `featured` or `more`
- `status`: `live`, `early release`, `development-only`, `pre-production`, or `prototype`
- `summary`: concise always-visible description
- `details`: optional technical bullets hidden behind progressive disclosure
- existing stack, links, and year fields

Keep one `projects` array. Derive `featuredProjects` and `moreProjects` from it so layouts, terminal commands, Gemini knowledge, and tests share one ordered source.

Use native `details` and `summary` elements for expandable technical depth. They provide keyboard interaction and browser semantics without extra client state.

## Profile and Hero

Keep the synthwave landing composition, backdrop controls, typography, actions, and motion unchanged.

Refresh only its shared copy and metrics:

- Role: Software Engineer and Applied AI
- Positioning: evaluated AI systems, agentic developer tools, and interactive engineering software
- `1.7B`: Qwen audio SLM
- `5,068`: Vitest gate
- `1st`: Synovate Grand Prize
- `'28`: UT Austin CS

The metric labels must preserve their qualifiers. The 5,068 count refers to Subwoofer Central's Vitest unit/parity gate.

## Experience

Render these roles in order:

1. Alpha School, AI Engineering Intern, Jun to Aug 2026
2. Mercor Intelligence, AI/ML Data Contractor, Feb to Apr 2025
3. University of Houston, ML Researcher and SWE Intern, May to Aug 2023
4. Project: Empower, COO, Aug 2022 to Jan 2024

Alpha highlights should cover GT100K, the audio Small Learning Model, Speedrun, Blazing Audio, and the short-video MVP without duplicating each project card's full details.

Mercor copy must describe NDA-bound mathematical-reasoning data creation and independent verification. It must not claim a model improvement.

Project: Empower copy must use the supported 60-plus chapters across 10 countries and the 621-participant Devpost hackathon offering $112,750 in prizes.

## Project Prioritization

Featured work, in this order:

1. Small Learning Model
2. Speedrun
3. GT100K
4. Subwoofer Central
5. GT100K Factory
6. Blazing Audio
7. Univyrse
8. NeuroBaseline

More Projects:

1. Virgilio Acoustics
2. UTMAX
3. UTMap
4. Illuminate
5. Short-video MVP

Remove Tendir, PintOS Kernel, Heap Memory Allocator, and STEM Today from the visible portfolio. They no longer represent the strongest evidence for the target roles.

## Project Boundaries

### Small Learning Model

Describe Qwen3-1.7B, QLoRA, the calculate/defer/abstain/explain contract, and the 80-function Formula Core.

The 30.7 percent to 94.4 percent result belongs only to historical V7.2 with the tuned model and executor on 319 frozen value-and-unit items. V7.4 stays development-only because it failed strict family and behavioral release gates.

### Speedrun

Credit the six custom GRE Math RPCs, Rust analytics and scheduling hooks, Svelte experiences, Windows and Android builds, hybrid retrieval, and mandatory SymPy verification.

State that Speedrun extends Anki. Do not claim ownership of Anki, FSRS, or its sync protocol.

### GT100K

Call it a two-person synthetic, pre-production education platform. Credit David as primary engineer.

Describe the 28 packages, 16 adapters, 9 apps, deterministic Beta-Bernoulli interest inference, evidence decay, uncertainty gates, human-controlled transitions, and child-safety constraints.

Do not call the estimator trained ML or imply real-child validation.

### Subwoofer Central

Describe the live browser enclosure-engineering workstation and its connection between acoustic simulation, geometry, Three.js visualization, warnings, charts, cut sheets, nesting, persistence, and sharing.

Qualify 5,068 as its passing Vitest unit/parity gate. Do not claim universally green CI.

### GT100K Factory

Call it a bounded agentic engineering harness. Describe worktrees, file-backed state, deterministic gates, recovery, semantic browser QA, and pull-request delivery.

Keep it development-only and omit a link because the repository is private. Do not call it a swarm.

### Blazing Audio

Describe the live course with 13 lessons, 50 graded problems, 24 interaction types, Leitner review, and five authenticated OpenAI Cloud Functions.

Do not claim proven learning outcomes or production AI security.

### Univyrse

Describe the live Firebase and Stripe marketplace as co-developed. Attribute David's work to purchase-gated content, administration hardening, API limits, and deployment reliability.

### NeuroBaseline

Describe the two-person, non-diagnostic Isolation Forest and PELT prototype. Include the Synovate first-place Grand Prize among 61 participants.

Do not claim clinical validation.

### More Projects

- Virgilio Acoustics: live audio-services site and administration workflow
- UTMAX: contributor who shipped an 18-file UI revamp
- UTMap: co-developer focused on mobile UX, label clustering, overlay handling, and shuttle styling
- Illuminate: co-developed search product with roughly 400 curated opportunities
- Short-video MVP: React and Firebase prototype with transactional handle signup, a scroll-snap feed, social actions, and telemetry

## Synthwave Body Design

Treat the body as a technical dossier that belongs beneath the existing poster-like landing.

- Keep the current palette, fonts, backdrop, frame, scan effects, and grain.
- Remove repeated section numbers from the synthwave body.
- Replace the identical project-card grid with a ruled vertical project index.
- Use order, type scale, spacing, and disclosure depth instead of extra card surfaces.
- Keep status, year, links, and stack visible at a glance.
- Place technical bullets in native expandable details.
- Render More Projects as a compact two-column index on wide screens and a single list on small screens.
- Tighten About, Experience, and Skills by removing redundant containers and reducing repeated labels.
- Retain the typing test as the synthwave layout's format-specific interaction.
- Keep the existing footer structure.

The body should feel cleaner than the landing, not visually louder than it.

## Terminal Body Design

Keep the terminal window, rail, console, Matrix background, typography, and compact spacing.

- Split projects into featured and more subsections.
- Add status text to each project.
- Use terminal-styled native details for technical bullets.
- Include project status in the `projects` command.
- Preserve command completion and link opening for every linked project.

The terminal may remain denser than synthwave. Content parity means the same facts are available, not that the DOM structure or visual emphasis must match.

## Skills and Contact

Replace stale skill groups with:

- Languages
- AI and ML
- Web and Systems
- Testing and Tools

Use only technologies supported by the resumes and project evidence.

Keep GitHub, LinkedIn, and email as primary professional links. Remove Spotify and MonkeyType from the shared contact list.

## Metadata

Replace the generic title and description with concise software-engineering and applied-AI metadata. Keep the existing icon and avoid adding unverified social images.

## Testing

Follow a red-green implementation:

1. Update the Playwright parity test to require project tiers, status, summary, technical details, and the two subsection headings.
2. Run the test and confirm it fails against the current implementation.
3. Implement the content and both renderers.
4. Confirm both layouts expose every canonical field.
5. Verify mobile and desktop availability, project links, details semantics, terminal commands, and Gemini knowledge.
6. Run ESLint, the production build, and the full content-parity test.

## Link Verification

Verify every final external URL before completion. Do not add a GT100K Factory URL. Record any inaccessible or redirected link in the final handoff.

## Non-Goals

- No landing-page redesign
- No backdrop or shader changes
- No terminal shell redesign
- No new API or data store
- No commits or pushes

## Approved Follow-Up

- Rename GT100K Factory to Agentic Software Factory v1. Present it as a cross-project harness used for GT100K and Subwoofer Central, not as a GT100K-specific component.
- Render synthwave Featured Work with the same compact two-column rhythm as More Projects. Preserve its separate heading, canonical order, status, stack, links, and expandable details.
- Add the companion Hugging Face dataset link to Small Learning Model.
- Add a date-stamped SLM detail: 377 model downloads and 50 dataset downloads as of August 2026.
- Replace the four hero metrics with one shared credential: `'28` and `UT Austin BS CS`.
- Adapt synthwave and terminal hero-stat markup so the single credential uses the full available width instead of leaving an empty four-cell grid.
