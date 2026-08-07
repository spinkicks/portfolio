# Layout Content Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make both portfolio layouts expose the same canonical portfolio data while preserving their format-specific interactions.

**Architecture:** Keep `app/content.ts` as the only portfolio data source. Add the missing terminal renderers and Gemini payload field, then expose the two missing synthwave fields through existing components. A Playwright regression script checks the rendered gaps in both layouts and at both terminal breakpoints.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Playwright Test

## Global Constraints

- Keep the typing benchmark synthwave-only.
- Keep the command console and `ask` command terminal-only.
- Keep backdrop controls and attribution synthwave-only.
- Keep the Matrix shader terminal-only.
- Add no runtime dependency.
- Use no em dash or en dash in source or visible copy.

---

## File Structure

- Create `tests/content-parity.spec.ts`: browser-level regression checks for every audited parity gap and every canonical portfolio field.
- Create `playwright.config.ts`: start the local Next.js server and run checks in installed Chrome.
- Modify `package.json` and `package-lock.json`: add Playwright Test as a development dependency and expose `npm run test:parity`.
- Modify `.gitignore`: exclude Playwright output.
- Modify `app/content.ts`: add Skills to the synthwave navigation data.
- Modify `app/components/terminal/TerminalSite.tsx`: render terminal hero stats and small-screen availability.
- Modify `app/components/MainSite.tsx`: render every project's year whether or not it has a link.
- Create `app/api/ask/knowledge.ts`: build the canonical portfolio payload as a pure, directly tested value.
- Modify `app/api/ask/route.ts`: serialize the shared knowledge value for Gemini.
- Modify `docs/superpowers/specs/2026-08-07-layout-content-parity-design.md`: record the linked-project year gap found during final audit.

### Task 1: Add the failing parity regression

**Execution adjustment:** The first draft used Python Playwright, but none of the installed Python environments had that module. The implemented test uses `@playwright/test` and the installed Chrome channel. This keeps the test inside the TypeScript toolchain and adds no runtime dependency.

**Files:**
- Create: `tests/content-parity.spec.ts`
- Create: `playwright.config.ts`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: `PORTFOLIO_URL`, defaulting to `http://127.0.0.1:8422`
- Produces: process exit code `0` when all parity checks pass, otherwise raises one assertion containing every failed check

- [ ] **Step 1: Create the Playwright verifier**

```python
import os
from pathlib import Path

from playwright.sync_api import Browser, Page, sync_playwright


BASE_URL = os.environ.get("PORTFOLIO_URL", "http://127.0.0.1:8422")
ROOT = Path(__file__).resolve().parents[1]
HERO_STATS = [
    ("3", "Internships"),
    ("5", "Shipped projects"),
    ("200", "WPM · top 500"),
    ("'28", "UT Austin BS CS"),
]
LINKED_PROJECTS = [
    ("Illuminate", "2024"),
    ("Tendir", "2023"),
    ("STEM Today", "2022"),
]


def open_layout(
    browser: Browser, *, terminal: bool, width: int = 1440
) -> tuple[Page, object]:
    context = browser.new_context(viewport={"width": width, "height": 1000})
    context.add_init_script(
        f"Math.random = () => {0.1 if terminal else 0.9};"
    )
    page = context.new_page()
    page.goto(BASE_URL, wait_until="domcontentloaded")
    switch_label = "Synthwave layout" if terminal else "Terminal view"
    page.get_by_role("button", name=switch_label).wait_for()
    return page, context


def check(condition: bool, message: str, failures: list[str]) -> None:
    if not condition:
        failures.append(message)


def body_text(page: Page) -> str:
    return page.locator("body").inner_text()


def main() -> None:
    failures: list[str] = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)

        terminal, terminal_context = open_layout(browser, terminal=True)
        terminal_text = body_text(terminal)
        for value, label in HERO_STATS:
            check(value in terminal_text, f"terminal is missing stat value {value}", failures)
            check(label in terminal_text, f"terminal is missing stat label {label}", failures)
        terminal_context.close()

        mobile, mobile_context = open_layout(browser, terminal=True, width=390)
        check(
            "Summer 2027 internships" in body_text(mobile),
            "terminal mobile is missing availability",
            failures,
        )
        mobile_context.close()

        synthwave, synthwave_context = open_layout(browser, terminal=False)
        check(
            synthwave.get_by_role("link", name="Skills", exact=True).count() == 1,
            "synthwave navigation is missing Skills",
            failures,
        )
        for name, year in LINKED_PROJECTS:
            heading = synthwave.get_by_role("heading", name=name, exact=True)
            card = heading.locator(
                "xpath=ancestor::*[self::article or self::li][1]"
            )
            check(
                card.count() == 1 and year in card.inner_text(),
                f"synthwave project {name} is missing year {year}",
                failures,
            )
        synthwave_context.close()
        browser.close()

    route_source = (ROOT / "app/api/ask/route.ts").read_text(encoding="utf-8")
    check(
        "heroStats" in route_source,
        "Gemini knowledge source is missing heroStats",
        failures,
    )

    if failures:
        raise AssertionError("\n".join(f"- {failure}" for failure in failures))

    print("Content parity checks passed.")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run the verifier and confirm the expected failure**

Run:

```powershell
npm run dev -- --hostname 127.0.0.1 --port 8422
npm run test:parity
```

Expected: exit code `1` with failures for terminal stats, terminal mobile availability, synthwave Skills navigation, linked-project years, and Gemini `heroStats`.

### Task 2: Expose the missing canonical fields

**Files:**
- Modify: `app/content.ts:32-37`
- Modify: `app/components/terminal/TerminalSite.tsx:9-17,255-280`
- Modify: `app/components/MainSite.tsx:205-235`
- Create: `app/api/ask/knowledge.ts`
- Modify: `app/api/ask/route.ts:1-49`
- Modify: `docs/superpowers/specs/2026-08-07-layout-content-parity-design.md`
- Test: `tests/content-parity.spec.ts`

**Interfaces:**
- Consumes: existing `navLinks`, `heroStats`, `status`, `project.year`, and all existing portfolio exports
- Produces: identical portfolio information in both rendered layouts and Gemini's terminal knowledge payload

- [ ] **Step 1: Add Skills to canonical synthwave navigation**

Insert this entry between Projects and Contact in `navLinks`:

```typescript
{ label: "Skills", href: "#skills" },
```

- [ ] **Step 2: Import hero stats into the terminal layout**

Add `heroStats` to the existing import from `../../content`:

```typescript
import {
  experience,
  facts,
  heroStats,
  links,
  profile,
  projects,
  skills,
  status,
} from "../../content";
```

- [ ] **Step 3: Render availability and stats in the terminal masthead**

Insert this block after the tagline and before the mobile email link:

```tsx
{status.open && (
  <p className="mt-6 flex items-baseline gap-2 text-xs lg:hidden">
    <span className="border border-lime/50 px-1.5 py-0.5 uppercase tracking-[0.18em] text-lime">
      {status.tag}
    </span>
    <span className="text-faint">{status.detail}</span>
  </p>
)}

<dl className="mt-7 grid grid-cols-2 gap-px border border-line-soft bg-line-soft sm:grid-cols-4">
  {heroStats.map((stat) => (
    <div key={stat.label} className="bg-ink-900/90 px-3 py-3">
      <dt className="text-[0.65rem] leading-snug text-faint">
        {stat.label.toLowerCase()}
      </dt>
      <dd className="mt-1 text-base text-amber">{stat.value}</dd>
    </div>
  ))}
</dl>
```

Change the mobile email wrapper's top margin from `mt-7` to `mt-6` so the added stats do not create an oversized gap:

```tsx
<div className="mt-6 lg:hidden">
```

- [ ] **Step 4: Render project year independently from link state**

Replace the conditional right side of each synthwave project-card header with:

```tsx
<div className="flex shrink-0 items-center gap-3">
  <span className="label">{project.year}</span>
  {project.href && (
    <ArrowUpRight
      size={20}
      aria-hidden="true"
      className="text-faint transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-magenta"
    />
  )}
</div>
```

- [ ] **Step 5: Add hero stats to Gemini knowledge**

Create a pure knowledge builder that returns every canonical export:

```typescript
import {
  experience,
  facts,
  heroStats,
  links,
  profile,
  projects,
  skills,
  status,
} from "../../content";

export function portfolioKnowledge() {
  return {
    profile,
    status,
    heroStats,
    facts,
    experience,
    projects,
    skills,
    links,
  };
}
```

Import `portfolioKnowledge` in `route.ts` and serialize its result:

```typescript
import { portfolioKnowledge } from "./knowledge";

function knowledge() {
  return JSON.stringify(portfolioKnowledge());
}
```

- [ ] **Step 6: Run the parity verifier**

Run:

```powershell
npm run test:parity
```

Expected: exit code `0` with all Playwright tests passing.

- [ ] **Step 7: Commit the parity implementation**

Stage:

```powershell
git add .gitignore app/content.ts app/components/terminal/TerminalSite.tsx app/components/MainSite.tsx app/api/ask/knowledge.ts app/api/ask/route.ts package.json package-lock.json playwright.config.ts tests/content-parity.spec.ts docs/superpowers/specs/2026-08-07-layout-content-parity-design.md docs/superpowers/plans/2026-08-07-layout-content-parity.md
```

Commit message:

```text
Keep portfolio content aligned across layouts

Expose the missing stats, status, navigation, project metadata, and AI context while preserving each layout's format-specific interactions.
```

### Task 3: Verify and publish

**Files:**
- Verify only

**Interfaces:**
- Consumes: completed implementation from Task 2
- Produces: passing checks, a pushed `main`, and a clean local worktree

- [ ] **Step 1: Run static checks**

Run:

```powershell
npx tsc --noEmit
npm run lint
```

Expected: both commands exit `0` with no TypeScript or ESLint errors.

- [ ] **Step 2: Run the production build**

Run:

```powershell
npm run build
```

Expected: exit code `0` and a successful Next.js production build.

- [ ] **Step 3: Confirm the repository contains no prohibited dash characters**

Search tracked source and documentation for Unicode em dash and en dash characters.

Expected: no matches.

- [ ] **Step 4: Verify GitHub identity and remote**

Run:

```powershell
gh auth status
gh api user --jq .login
git remote -v
```

Expected: GitHub login `spinkicks` and `origin` points to `https://github.com/spinkicks/portfolio`.

- [ ] **Step 5: Push and verify the clean tree**

Run:

```powershell
git push origin main
git status --short --branch
```

Expected: `main` matches `origin/main` and `git status --short` prints no file entries.
