# Layout Content Parity

## Goal

Give the synthwave and terminal layouts the same portfolio information while preserving each layout's format-specific interactions and visual structure.

`app/content.ts` remains the source of truth. This change does not alter David's profile, experience, projects, skills, links, or availability.

## Scope

The audit found five gaps:

1. The terminal layout does not render `heroStats`.
2. The terminal layout hides availability on screens where its left rail is absent.
3. The synthwave header navigation omits the Skills section.
4. The terminal's Gemini knowledge payload omits `heroStats`.
5. Synthwave project cards omit the year when a project has a primary link.

The implementation will:

- Add Skills to the synthwave navigation through `navLinks`.
- Render the four `heroStats` values in the terminal masthead.
- Render availability in the terminal masthead on small screens while retaining its desktop rail treatment.
- Add `heroStats` to the server-side Gemini knowledge payload.
- Render the year on every synthwave project card.

## Intentional Differences

The two layouts keep their format-specific features:

- The synthwave layout keeps the typing benchmark.
- The terminal layout keeps its console and `ask` command.
- Backdrop controls and attribution remain synthwave-only.
- The Matrix shader remains terminal-only.

These features change how visitors interact with each layout. They do not change the portfolio information available in either layout.

## Components and Data Flow

`app/content.ts` exports all portfolio records. `MainSite`, `HeroMarquee`, `Chrome`, `TerminalSite`, terminal commands, and the pure `portfolioKnowledge()` builder read those exports. The ask route serializes the builder's result for Gemini.

The implementation adds no duplicated strings:

- `navLinks` supplies the new synthwave Skills link.
- `TerminalSite` maps `heroStats` into a compact terminal readout.
- `TerminalSite` reads the existing `status` object for mobile availability.
- `portfolioKnowledge()` includes `heroStats`, and the ask route serializes the complete result.
- `MainSite` renders `project.year` independently of the project's link state.

## Error Handling

The change adds no network calls or mutable state. Existing terminal ask-route validation, rate limiting, timeout handling, and missing-key behavior remain unchanged.

## Verification

Verification will cover:

- Every profile, fact, experience, project, skill group, and contact link appears in both layouts.
- Hero stats appear in both layouts.
- Availability appears in both layouts at desktop and mobile widths.
- Synthwave navigation includes About, Experience, Projects, Skills, and Contact.
- The Gemini knowledge payload includes `heroStats`.
- Every project year appears in both layouts.
- TypeScript, ESLint, and the production build pass.
- Git reports a clean tree after the commit and push to `main`.
