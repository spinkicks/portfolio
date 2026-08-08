# Portfolio Content Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace stale portfolio content with verified Summer 2027 SWE and applied-AI positioning, then tighten the synthwave body while preserving the landing page and terminal identity.

**Architecture:** Keep `app/content.ts` as the only portfolio source. Extend its project records with tier, status, summary, and technical details, derive the two editorial groups from the single array, and let each layout render those facts in its own visual language. Native `details` elements provide progressive disclosure without new state.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Playwright Test

## Global Constraints

- Do not change the synthwave landing composition, backdrop controls, shaders, frame, CRT effects, or grain.
- Both layouts must expose the same profile, experience, project, skill, status, link, and technical-detail content.
- Layout markup and visual emphasis may differ.
- `app/content.ts` remains the canonical source.
- GT100K is a two-person synthetic, pre-production platform; its Beta-Bernoulli estimator is deterministic inference.
- The Small Learning Model's 30.7 percent to 94.4 percent result belongs only to historical V7.2 with the tuned model and Formula Core.
- The public V7.4 checkpoint remains development-only because it failed strict family and behavioral release gates.
- Speedrun extends Anki and reuses FSRS and Anki sync; do not claim ownership of those inherited systems.
- GT100K Factory is an agentic harness, never a swarm, and receives no public repository link.
- Subwoofer Central's 5,068 count is its passing Vitest unit/parity gate, not universally green CI.
- NeuroBaseline stays non-diagnostic and makes no clinical-validation claim.
- Avoid raw line, commit, or exclusively manual-authorship claims.
- Do not claim real-child validation, production AI security, or proven learning outcomes.
- Do not add dependencies.
- Do not commit or push.

---

## File Structure

- Modify `tests/content-parity.spec.ts`: add the failing canonical project contract and cross-layout tier/status/disclosure assertions.
- Modify `app/content.ts`: replace stale profile, role, experience, projects, skills, and contact links; add the richer project type and derived groups.
- Modify `app/components/MainSite.tsx`: replace the numbered body scaffold and card grid with the synthwave dossier layout.
- Modify `app/components/terminal/TerminalSite.tsx`: render the same featured/more split, statuses, and technical disclosures in terminal form.
- Modify `app/components/terminal/commands.ts`: include status and tier information in project output while retaining link completion.
- Modify `app/layout.tsx`: replace generic metadata.
- Keep `app/api/ask/knowledge.ts` unchanged because it already serializes the full `projects` export.
- Keep `app/components/hero/HeroMarquee.tsx` structurally unchanged; refreshed shared profile and metrics flow into it.

### Canonical Interfaces

```ts
export type ProjectTier = "featured" | "more";

export type ProjectStatus =
  | "live"
  | "early release"
  | "development-only"
  | "pre-production"
  | "prototype";

export type Project = {
  name: string;
  tier: ProjectTier;
  status: ProjectStatus;
  summary: string;
  details: string[];
  stack: string[];
  href?: string;
  secondary?: { label: string; href: string };
  year: string;
};

export const featuredProjects = projects.filter(
  (project) => project.tier === "featured"
);

export const moreProjects = projects.filter(
  (project) => project.tier === "more"
);
```

### Required Project Contract

```ts
const expectedProjectContract = [
  ["Small Learning Model", "featured", "development-only"],
  ["Speedrun", "featured", "early release"],
  ["GT100K", "featured", "pre-production"],
  ["Subwoofer Central", "featured", "live"],
  ["GT100K Factory", "featured", "development-only"],
  ["Blazing Audio", "featured", "live"],
  ["Univyrse", "featured", "live"],
  ["NeuroBaseline", "featured", "prototype"],
  ["Virgilio Acoustics", "more", "live"],
  ["UTMAX", "more", "live"],
  ["UTMap", "more", "live"],
  ["Illuminate", "more", "live"],
  ["Short-video MVP", "more", "prototype"],
] as const;

type RichProject = {
  name: string;
  tier: "featured" | "more";
  status:
    | "live"
    | "early release"
    | "development-only"
    | "pre-production"
    | "prototype";
  summary: string;
  details: string[];
  stack: string[];
  href?: string;
  secondary?: { label: string; href: string };
  year: string;
};

const richProjects = projects as unknown as RichProject[];
const linkedProjects = richProjects.filter((project) => project.href);
```

---

### Task 1: Add the failing content and presentation regression

**Files:**
- Modify: `tests/content-parity.spec.ts`

**Interfaces:**
- Consumes: current `projects` export and existing `openLayout` helper
- Produces: explicit failing requirements for the richer project contract and both project presentations

- [ ] **Step 1: Add a runtime-safe canonical contract test**

Add the required contract constant above, then add:

```ts
test("canonical projects carry the approved order, tier, status, and detail model", () => {
  const records = projects as unknown as Array<Record<string, unknown>>;

  expect(
    records.map((project) => [
      project.name,
      project.tier,
      project.status,
    ])
  ).toEqual(expectedProjectContract);

  for (const project of records) {
    expect(project.summary, `${project.name} needs a concise summary`).toEqual(
      expect.any(String)
    );
    expect(
      (project.summary as string).length,
      `${project.name} summary is too long`
    ).toBeLessThanOrEqual(260);
    expect(project.details, `${project.name} needs technical details`).toEqual(
      expect.any(Array)
    );
    expect(
      (project.details as unknown[]).length,
      `${project.name} needs at least one technical detail`
    ).toBeGreaterThan(0);
  }
});
```

- [ ] **Step 2: Add a cross-layout presentation helper**

Replace the project loop inside `expectCanonicalContent` with the rich canonical records:

```ts
const projectSection = page.locator("#projects");
for (const project of richProjects) {
  const record = projectSection
    .getByRole("heading", { name: project.name, exact: true })
    .locator("xpath=ancestor::*[self::article or self::li][1]");

  await expect(record, `${project.name} is missing its summary`).toContainText(
    matchingText(project.summary)
  );
  await expect(record, `${project.name} is missing its status`).toContainText(
    project.status
  );
  await expect(
    record.getByText(exactText(project.year)).first(),
    `${project.name} is missing year ${project.year}`
  ).toBeVisible();

  for (const detail of project.details) {
    await expect(
      record,
      `${project.name} is missing technical detail: ${detail}`
    ).toContainText(matchingText(detail));
  }
  for (const tech of project.stack) {
    await expect(
      record.getByText(exactText(tech)).first(),
      `${project.name} is missing stack item: ${tech}`
    ).toBeVisible();
  }
  if (project.href) {
    await expect(record.locator(`a[href="${project.href}"]`)).toHaveAttribute(
      "href",
      project.href
    );
  }
  if (project.secondary) {
    const anchor = record.locator(`a[href="${project.secondary.href}"]`);
    await expect(anchor).toHaveAttribute("href", project.secondary.href);
    await expect(anchor).toContainText(matchingText(project.secondary.label));
  }
}
```

Then add the presentation helper:

```ts
async function expectProjectPresentation(page: Page) {
  const section = page.locator("#projects");

  await expect(
    section.getByRole("heading", { name: "Featured Work", exact: true })
  ).toBeVisible();
  await expect(
    section.getByRole("heading", { name: "More Projects", exact: true })
  ).toBeVisible();

  for (const [name, , status] of expectedProjectContract) {
    const record = section
      .getByRole("heading", { name, exact: true })
      .locator("xpath=ancestor::*[self::article or self::li][1]");

    await expect(record, `${name} is missing status ${status}`).toContainText(
      status
    );
    await expect(
      record.getByText("Technical details", { exact: true }),
      `${name} is missing its technical disclosure`
    ).toBeVisible();
  }
}
```

Add separate browser tests so each layout has an independent red-green cycle:

```ts
for (const layout of [
  { name: "terminal", terminal: true },
  { name: "synthwave", terminal: false },
] as const) {
  test(`${layout.name} exposes project tiers, statuses, and technical disclosures`, async ({
    page,
  }) => {
    await openLayout(page, layout.terminal);
    await expectProjectPresentation(page);
  });
}
```

- [ ] **Step 3: Run the three new tests and verify the expected red state**

Run:

```powershell
npx playwright test tests/content-parity.spec.ts --workers=1 --grep "canonical projects|exposes project tiers"
```

Expected:

- the canonical contract fails because the current array starts with Illuminate and has no tier/status fields;
- the browser test fails because neither layout has Featured Work, More Projects, statuses, or technical disclosures.

Do not proceed if the new tests pass.

---

### Task 2: Replace the canonical portfolio content

**Files:**
- Modify: `app/content.ts`
- Modify: `app/layout.tsx`
- Modify: `app/components/terminal/commands.ts`

**Interfaces:**
- Produces: `ProjectTier`, `ProjectStatus`, `Project`, `projects`, `featuredProjects`, and `moreProjects`
- Preserves: `profile`, `status`, `heroStats`, `navLinks`, `facts`, `experience`, `skills`, and `links`
- Consumed later by: both layout renderers, terminal commands, Gemini knowledge, and parity tests

- [ ] **Step 1: Replace profile, hero metrics, and facts**

Use:

```ts
export const profile = {
  name: "David O.",
  role: "Software Engineer · Applied AI",
  location: "Austin, TX",
  email: "fear@utexas.edu",
  tagline:
    "I build evaluated AI systems, agentic developer tools, and interactive engineering software.",
  bio: "UT Austin computer science student minoring in Statistics & Data Science. Recent work spans QLoRA model routing, deterministic verification, Rust engine extensions, and deployed TypeScript products. I care about explicit limits, measurable gates, and useful interfaces.",
};

export const heroStats = [
  { value: "1.7B", label: "Qwen audio SLM" },
  { value: "5,068", label: "Vitest gate" },
  { value: "1st", label: "Synovate Grand Prize" },
  { value: "'28", label: "UT Austin BS CS" },
];

export const facts = [
  { label: "Education", value: "UT Austin, BS Computer Science" },
  { label: "Minor", value: "Statistics & Data Science" },
  { label: "Based in", value: "Austin, TX" },
  { label: "Focus", value: "SWE · Applied AI · ML/LLM Systems" },
  { label: "Languages", value: "English · Spanish (fluent)" },
];
```

Keep the existing Summer 2027 `status` and navigation.

- [ ] **Step 2: Replace experience**

Use four records in the approved order:

```ts
export const experience: Experience[] = [
  {
    company: "Alpha School",
    role: "AI Engineering Intern",
    period: "Jun 2026 to Aug 2026",
    summary:
      "Built evaluated applied-AI and learning systems across model routing, native study tooling, deterministic learner modeling, and a public audio course.",
    highlights: [
      "GT100K: served as primary engineer on a two-person, pre-production platform spanning 28 packages, 16 adapters, and 9 apps, with deterministic Beta-Bernoulli interest inference and human-controlled transitions.",
      "Small Learning Model: fine-tuned Qwen3-1.7B with QLoRA around a calculate/defer/abstain/explain contract and an 80-function Formula Core.",
      "Speedrun: extended Anki's Rust engine with six GRE Math RPCs and shared Svelte experiences for early Windows and Android builds.",
      "Blazing Audio: shipped 13 lessons, 50 graded problems, 24 interaction types, Leitner review, and five authenticated OpenAI Cloud Functions.",
      "Short-video MVP: built a React/Firebase prototype with transactional handles, a realtime scroll-snap feed, social actions, and telemetry.",
    ],
    stack: ["TypeScript", "Python", "Rust", "Svelte", "Firebase", "QLoRA"],
  },
  {
    company: "Mercor Intelligence",
    role: "AI/ML Data Contractor",
    period: "Feb 2025 to Apr 2025",
    summary:
      "Created and independently verified NDA-bound mathematical-reasoning data for frontier-model training and evaluation.",
    highlights: [
      "Authored structured LaTeX solutions across discrete mathematics, geometry, and algorithms, then independently checked reasoning and final answers.",
    ],
    stack: ["LaTeX", "Mathematical Reasoning", "Data Verification"],
  },
  {
    company: "University of Houston",
    role: "ML Researcher & SWE Intern",
    period: "May 2023 to Aug 2023",
    summary:
      "Built traffic-network simulations and experiment automation for repeatable congestion research.",
    highlights: [
      "Used Python, SUMO, Flow, and TraCI to control simulations and collect evaluation data.",
    ],
    stack: ["Python", "SUMO", "Flow", "TraCI"],
  },
  {
    company: "Project: Empower",
    role: "Chief Operations Officer",
    period: "Aug 2022 to Jan 2024",
    summary:
      "Helped scale a 501(c)(3) while leading operations and contributing to its software products.",
    highlights: [
      "Helped grow the organization to 60+ chapters across 10 countries.",
      "Led a 621-participant Devpost hackathon offering $112,750 in prizes and co-developed Illuminate.",
    ],
    stack: ["Operations", "Next.js", "React", "Supabase"],
  },
];
```

- [ ] **Step 3: Replace the project type and project records**

Use the canonical interfaces at the top of this plan. Populate the single array with this exact content:

```ts
export const projects: Project[] = [
  {
    name: "Small Learning Model",
    tier: "featured",
    status: "development-only",
    summary:
      "Fine-tuned Qwen3-1.7B with QLoRA to route audio questions across calculate, defer, abstain, and explain, with accepted calls executed by an 80-function Formula Core.",
    details: [
      "A historical V7.2 tuned-model-plus-executor evaluation scored 94.4% versus 30.7% for base on 319 frozen value-and-unit items.",
      "V7.4 reached 91.9% numeric accuracy but remained development-only after failing strict family and behavioral release gates.",
      "The pipeline includes deterministic data generation, fail-closed tool compilation, hash-pinned training, Gradio inference, and a 387-row evaluation manifest.",
    ],
    stack: ["Qwen3", "QLoRA", "PyTorch", "Python"],
    href: "https://huggingface.co/audiuphile/blazing-audio-slm-v7-4-dev",
    year: "2026",
  },
  {
    name: "Speedrun",
    tier: "featured",
    status: "early release",
    summary:
      "Extended Anki's Rust engine with six GRE Math RPCs, exam-aware queue behavior, shared Svelte experiences, and early Windows and Android builds.",
    details: [
      "Custom layers add uncertainty-aware Memory, Performance, Readiness, calibration, and scheduling hooks while preserving inherited FSRS due dates and Anki sync.",
      "The optional FastAPI/LangGraph generator grounds proposals with hybrid retrieval and requires SymPy verification before emission.",
      "Offline checks reverified 50/50 gold answers, rejected 6/6 invalid specifications, and measured a 0.900 Recall@10 tie across BM25, dense, and hybrid retrieval.",
    ],
    stack: ["Rust", "Svelte", "Kotlin", "FastAPI", "SymPy"],
    href: "https://github.com/spinkicks/speedrun/releases/tag/v0.1.0-early",
    year: "2026",
  },
  {
    name: "GT100K",
    tier: "featured",
    status: "pre-production",
    summary:
      "Primary engineer on a two-person, synthetic education platform organized as 28 packages, 16 adapters, and 9 apps behind deterministic ports.",
    details: [
      "Implemented Beta-Bernoulli learner-interest inference with evidence decay, normalized negative evidence, uncertainty gates, and distinct-day requirements.",
      "Kept consequential hypothesis transitions under human authority and excluded duration and performance from interest-belief updates through a type-enforced signal firewall.",
      "Encoded deny-by-default consent, child-safety constraints, evidence-class governance, and opt-in LLM adapters while preserving deterministic offline behavior.",
    ],
    stack: ["TypeScript", "React", "PostgreSQL", "PGlite"],
    href: "https://github.com/spinkicks/gt100k",
    year: "2026",
  },
  {
    name: "Subwoofer Central",
    tier: "featured",
    status: "live",
    summary:
      "Browser enclosure-engineering workstation connecting acoustic simulation, physical geometry, Three.js visualization, warnings, charts, cut sheets, nesting, persistence, and sharing.",
    details: [
      "One normalized design model drives sealed, ported, passive-radiator, and release-gated bandpass calculations plus fabrication geometry.",
      "WebGL and geometry work use independent computation fingerprints, demand rendering, a persistent canvas, and adaptive worker offload.",
      "The current Vitest unit/parity gate passes 5,068 cases across 422 files; that figure does not claim universally green CI.",
    ],
    stack: ["Next.js", "TypeScript", "Three.js", "Vitest"],
    href: "https://www.subwoofer.live/",
    year: "2026",
  },
  {
    name: "GT100K Factory",
    tier: "featured",
    status: "development-only",
    summary:
      "Bounded Claude and Codex agentic engineering harness for repeated implementation, review, recovery, browser QA, and pull-request delivery.",
    details: [
      "Isolates lanes in worktrees and carries cross-turn state through files rather than hidden process memory.",
      "Applies deterministic target gates, time and no-progress caps, stranded-run recovery, and host-side Git controls.",
      "Uses semantic browser QA and specialized review passes before pull-request delivery; the repository remains private.",
    ],
    stack: ["Python", "Bash", "Claude", "Codex"],
    year: "2026",
  },
  {
    name: "Blazing Audio",
    tier: "featured",
    status: "live",
    summary:
      "Public interactive audio course with 13 lessons, 50 graded problems, 24 interaction types, concept-level Leitner review, and real-time learning tools.",
    details: [
      "A typed content registry drives deterministic local grading, progress, prerequisite warm-ups, and interleaved review.",
      "Five authenticated OpenAI Cloud Functions handle generated review, semantic judgment, tutoring, and capstone evaluation through strict schemas and private rubrics.",
      "The product makes no claim of measured learning outcomes and does not use the custom audio SLM.",
    ],
    stack: ["React", "TypeScript", "Firebase", "OpenAI"],
    href: "https://blazing-audio-alpha.web.app/",
    year: "2026",
  },
  {
    name: "Univyrse",
    tier: "featured",
    status: "live",
    summary:
      "Co-developed Firebase and Stripe marketplace for browsing and purchasing verified college-application content.",
    details: [
      "Focused on purchase-gated content, administration hardening, API limits, and deployment reliability.",
      "Kept ownership wording collaborative and limited claims to the product areas directly supported by project history.",
    ],
    stack: ["Next.js", "Firebase", "Stripe"],
    href: "https://univyrse.ai/",
    year: "2026",
  },
  {
    name: "NeuroBaseline",
    tier: "featured",
    status: "prototype",
    summary:
      "Co-developed a non-diagnostic typing-behavior prototype using Isolation Forest and PELT for personalized baseline-change analysis.",
    details: [
      "Combined anomaly detection and change-point analysis into a personalized Neuro Variability Index without making diagnostic claims.",
      "Won the Synovate Hackathon first-place Grand Prize among 61 participants.",
    ],
    stack: ["Python", "scikit-learn", "FastAPI", "Next.js"],
    href: "https://github.com/spinkicks/neurobaseline",
    year: "2025",
  },
  {
    name: "Virgilio Acoustics",
    tier: "more",
    status: "live",
    summary:
      "Built the public site and administration workflow for an Austin custom-audio design and installation business.",
    details: [
      "Combined a Next.js and TypeScript marketing site with Vercel Analytics and a password-protected Neon and Vercel Blob administration workflow.",
    ],
    stack: ["Next.js", "TypeScript", "Neon", "Vercel Blob"],
    href: "https://www.virgilio.systems/",
    year: "2026",
  },
  {
    name: "UTMAX",
    tier: "more",
    status: "live",
    summary:
      "Contributed an 18-file UI revamp to the live UT Austin schedule-planning experience.",
    details: [
      "Focused on tightening the product's frontend presentation and interaction quality rather than claiming ownership of the full platform.",
    ],
    stack: ["Frontend", "Responsive UI"],
    href: "https://www.utmax.tech/",
    year: "2026",
  },
  {
    name: "UTMap",
    tier: "more",
    status: "live",
    summary:
      "Co-developed a live UT Austin campus map with a focus on mobile interaction and map readability.",
    details: [
      "Worked on mobile UX, label clustering, overlay handling, and shuttle styling.",
    ],
    stack: ["Frontend", "Geospatial UI"],
    href: "https://www.utmap.app/",
    year: "2026",
  },
  {
    name: "Illuminate",
    tier: "more",
    status: "live",
    summary:
      "Co-developed a searchable Next.js, React, and Supabase product spanning roughly 400 curated extracurricular opportunities.",
    details: [
      "Contributed the responsive product experience without implying sole ownership or personal curation of every entry.",
    ],
    stack: ["Next.js", "React", "Supabase"],
    href: "https://illuminate.projectempower.io/",
    year: "2024",
  },
  {
    name: "Short-video MVP",
    tier: "more",
    status: "prototype",
    summary:
      "React and Firebase prototype with transactional unique-handle signup, a realtime scroll-snap feed, social actions, and watch telemetry.",
    details: [
      "Implemented the central consumption loop, optimistic likes and favorites, live comments, and append-only engagement events.",
      "The prototype did not include uploads, personalized recommendations, Cloud Functions, or a moderation interface.",
    ],
    stack: ["React", "TypeScript", "Firebase"],
    year: "2026",
  },
];

export const featuredProjects = projects.filter(
  (project) => project.tier === "featured"
);

export const moreProjects = projects.filter(
  (project) => project.tier === "more"
);
```

- [ ] **Step 4: Replace skills and professional links**

```ts
export const skills = [
  {
    group: "Languages",
    items: ["Python", "TypeScript/JavaScript", "Rust", "SQL", "C/C++", "Go", "Java"],
  },
  {
    group: "AI & ML",
    items: [
      "PyTorch",
      "Transformers",
      "QLoRA/PEFT",
      "Hugging Face",
      "scikit-learn",
      "LangGraph",
      "OpenAI API",
      "SymPy",
      "NumPy/SciPy",
    ],
  },
  {
    group: "Web & Systems",
    items: [
      "React",
      "Next.js",
      "Svelte",
      "FastAPI",
      "Three.js",
      "Firebase",
      "PostgreSQL/Supabase",
    ],
  },
  {
    group: "Testing & Tools",
    items: ["Vitest", "Pytest", "Playwright", "Git", "Linux/WSL", "Vercel"],
  },
];

export const links = [
  { label: "GitHub", href: "https://github.com/spinkicks" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/calmguy/" },
];
```

- [ ] **Step 5: Update metadata**

```ts
export const metadata: Metadata = {
  title: "David Ordonez | Software Engineer & Applied AI",
  description:
    "UT Austin computer science student building evaluated AI systems, agentic developer tools, and interactive engineering software.",
  icons: {
    icon: "/hooded.svg",
  },
  openGraph: {
    title: "David Ordonez | Software Engineer & Applied AI",
    description:
      "Evaluated AI systems, agentic developer tools, and interactive engineering software.",
    images: [],
  },
};
```

Preserve fonts, analytics, and root markup. Add the missing semicolon to the Analytics import while touching the file.

- [ ] **Step 6: Update terminal command output**

Import `featuredProjects` and `moreProjects`. Replace the `projects` command with:

```ts
{
  name: "projects",
  summary: "featured systems and more work",
  run: (_arg, ctx) => {
    ctx.goto("projects");
    return [
      dim("Featured work"),
      ...featuredProjects.map((project) =>
        kv(
          pad(`${project.year}  ${project.name}`, 31),
          `${project.status} · ${project.stack.join(", ")}`
        )
      ),
      dim(""),
      dim("More projects"),
      ...moreProjects.map((project) =>
        kv(
          pad(`${project.year}  ${project.name}`, 31),
          `${project.status} · ${project.stack.join(", ")}`
        )
      ),
    ];
  },
},
```

Keep `openTargets()` based on the complete `projects` array so every public project remains discoverable.

- [ ] **Step 7: Run the canonical data test**

Run:

```powershell
npx playwright test tests/content-parity.spec.ts --workers=1 --grep "canonical projects"
```

Expected: PASS.

The browser presentation test may still fail until both renderers change.

---

### Task 3: Rebuild the synthwave body as a technical dossier

**Files:**
- Modify: `app/components/MainSite.tsx`

**Interfaces:**
- Consumes: `featuredProjects`, `moreProjects`, and the existing shared profile/experience/skills exports
- Produces: `#projects` with visible `Featured Work` and `More Projects` headings, one record per project, status text, and native technical disclosures

- [ ] **Step 1: Replace project imports**

Import `featuredProjects` and `moreProjects` from `../content`. Stop importing the raw `projects` array into this component.

- [ ] **Step 2: Remove numbered synthwave section scaffolding**

Change each call from:

```tsx
<Section id="about" index="01" title="About">
```

to:

```tsx
<Section id="about" title="About">
```

Use the same change for Experience, Projects, and Skills. Replace `Section` with:

```tsx
function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <Reveal>
      <section id={id} className="scroll-mt-24">
        <h2 className="display text-balance text-3xl text-fg sm:text-5xl">
          {title}
        </h2>
        <div className="rule mb-10 mt-5" />
        {children}
      </section>
    </Reveal>
  );
}
```

Delete the `index` prop and section-index span. Preserve `Reveal`.

- [ ] **Step 3: Tighten the experience list**

Remove the visual ordinal that uses the mapped array index. Keep the chronological border, company, period, role, summary, highlights, and stack. Reduce vertical padding from `py-8` to `py-7`, and use `space-y-0` at the list boundary so the hairline establishes the rhythm.

Do not delete any shared experience field.

- [ ] **Step 4: Replace the card grid with dossier rows**

Use:

```tsx
function Projects() {
  return (
    <Section id="projects" title="Featured Work">
      <div>
        <ol className="divide-y divide-line-soft border-y border-line-soft">
          {featuredProjects.map((project, index) => (
            <ProjectEntry
              key={project.name}
              project={project}
              ordinal={String(index + 1).padStart(2, "0")}
            />
          ))}
        </ol>
      </div>

      <div className="mt-16 sm:mt-20">
        <div className="mb-6 flex items-baseline justify-between gap-6">
          <h3 className="display text-2xl text-fg sm:text-3xl">More Projects</h3>
          <span className="font-mono text-xs text-faint">
            {String(moreProjects.length).padStart(2, "0")} entries
          </span>
        </div>
        <ol className="grid border-y border-line-soft md:grid-cols-2">
          {moreProjects.map((project) => (
            <MoreProjectEntry key={project.name} project={project} />
          ))}
        </ol>
      </div>
    </Section>
  );
}
```

The visible section title names the featured tier directly; the compact subsection names More Projects.

- [ ] **Step 5: Add the full dossier entry**

```tsx
function ProjectEntry({
  project,
  ordinal,
}: {
  project: (typeof featuredProjects)[number];
  ordinal: string;
}) {
  return (
    <li>
      <article className="group grid gap-5 py-8 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:py-10">
        <span className="font-mono text-xs text-faint">{ordinal}</span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-3">
            <div>
              <h3 className="display text-balance text-2xl text-fg transition-colors duration-200 group-hover:text-magenta sm:text-3xl">
                {project.href ? (
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    {project.name}
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </a>
                ) : (
                  project.name
                )}
              </h3>
              <p className="mt-2 font-mono text-xs text-cyan">
                {project.status}
              </p>
            </div>
            <span className="font-mono text-xs text-faint">{project.year}</span>
          </div>

          <p className="mt-4 max-w-[68ch] text-pretty text-sm leading-relaxed text-dim sm:text-base">
            {project.summary}
          </p>

          <ul className="mt-5 flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <li key={tech} className="chip">
                {tech}
              </li>
            ))}
          </ul>

          <ProjectDetails details={project.details} />
        </div>
      </article>
    </li>
  );
}
```

- [ ] **Step 6: Add the compact More Projects entry and disclosure**

```tsx
function MoreProjectEntry({
  project,
}: {
  project: (typeof moreProjects)[number];
}) {
  return (
    <li className="border-line-soft py-6 md:odd:border-r md:odd:pr-8 md:even:pl-8">
      <article>
        <div className="flex items-start justify-between gap-5">
          <div>
            <h3 className="display text-xl text-fg">
              {project.href ? (
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-colors duration-200 hover:text-magenta"
                >
                  {project.name}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              ) : (
                project.name
              )}
            </h3>
            <p className="mt-1.5 font-mono text-xs text-cyan">{project.status}</p>
          </div>
          <span className="font-mono text-xs text-faint">{project.year}</span>
        </div>
        <p className="mt-3 text-pretty text-sm leading-relaxed text-dim">
          {project.summary}
        </p>
        <ProjectDetails details={project.details} compact />
      </article>
    </li>
  );
}

function ProjectDetails({
  details,
  compact = false,
}: {
  details: string[];
  compact?: boolean;
}) {
  return (
    <details className={`${compact ? "mt-4" : "mt-6"} group/details`}>
      <summary className="flex min-h-11 w-fit list-none items-center gap-2 font-mono text-xs text-faint transition-colors duration-200 hover:text-cyan [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden="true"
          className="text-cyan group-open/details:hidden"
        >
          +
        </span>
        <span
          aria-hidden="true"
          className="hidden text-cyan group-open/details:inline"
        >
          -
        </span>
        Technical details
      </summary>
      <ul className="max-w-[70ch] space-y-2 pb-2 pt-2">
        {details.map((detail) => (
          <li
            key={detail}
            className="relative pl-4 text-sm leading-relaxed text-dim before:absolute before:left-0 before:top-[0.65em] before:size-1 before:bg-violet"
          >
            {detail}
          </li>
        ))}
      </ul>
    </details>
  );
}
```

No project link should use the old stretched-card pseudo-element because it would cover the disclosure control.

- [ ] **Step 7: Tighten Skills without changing shared data**

Use a responsive two-column ledger rather than three equal columns:

```tsx
<div className="grid gap-x-12 gap-y-8 sm:grid-cols-2">
  {skills.map((category) => (
    <div key={category.group} className="border-t border-line-soft pt-4">
      <h3 className="font-mono text-xs text-cyan">{category.group}</h3>
      <ul className="mt-4 flex flex-wrap gap-2">
        {category.items.map((item) => (
          <li key={item} className="chip">
            {item}
          </li>
        ))}
      </ul>
    </div>
  ))}
</div>
```

- [ ] **Step 8: Verify synthwave presentation**

Run:

```powershell
npx playwright test tests/content-parity.spec.ts --workers=1 --grep "synthwave exposes project tiers"
```

Expected: the synthwave presentation test passes. The terminal presentation test remains red until Task 4.

---

### Task 4: Add terminal project parity without copying synthwave markup

**Files:**
- Modify: `app/components/terminal/TerminalSite.tsx`

**Interfaces:**
- Consumes: `featuredProjects`, `moreProjects`
- Produces: the same project names, statuses, summaries, details, stacks, years, and links under `#projects`

- [ ] **Step 1: Replace the project import**

Import `featuredProjects` and `moreProjects`; stop importing raw `projects` into this component.

- [ ] **Step 2: Replace terminal Projects**

```tsx
function Projects() {
  return (
    <Section id="projects" index={3} title="projects">
      <div>
        <h3 className="mb-5 text-xs text-amber">Featured Work</h3>
        <TerminalProjectList projects={featuredProjects} />
      </div>

      <div className="mt-10">
        <h3 className="mb-5 text-xs text-amber">More Projects</h3>
        <TerminalProjectList projects={moreProjects} />
      </div>
    </Section>
  );
}

function TerminalProjectList({
  projects,
}: {
  projects: typeof featuredProjects | typeof moreProjects;
}) {
  return (
    <ol className="space-y-7">
      {projects.map((project) => (
        <li key={project.name} className="flex gap-4 sm:gap-6">
          <span className="w-[4ch] shrink-0 pt-0.5 text-xs text-faint">
            {project.year}
          </span>

          <article className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h4 className="text-sm text-fg">{project.name}</h4>
              <span className="text-xs text-amber">{project.status}</span>
              {project.href ? (
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-baseline gap-1 text-xs text-lime underline-offset-4 hover:underline"
                >
                  open
                  <ArrowUpRight
                    size={11}
                    aria-hidden="true"
                    className="translate-y-0.5"
                  />
                </a>
              ) : null}
            </div>

            <p className="mt-2 max-w-[66ch] text-sm leading-relaxed text-dim">
              {project.summary}
            </p>

            <ul className="mt-3 flex flex-wrap gap-1.5">
              {project.stack.map((tech) => (
                <li key={tech} className="tty-chip">
                  {tech}
                </li>
              ))}
            </ul>

            <details className="group/details mt-3">
              <summary className="flex min-h-9 w-fit list-none items-center gap-2 text-xs text-faint hover:text-lime [&::-webkit-details-marker]:hidden">
                <span aria-hidden="true" className="group-open/details:hidden">
                  +
                </span>
                <span
                  aria-hidden="true"
                  className="hidden group-open/details:inline"
                >
                  -
                </span>
                Technical details
              </summary>
              <ul className="mt-1 space-y-1.5">
                {project.details.map((detail) => (
                  <li
                    key={detail}
                    className="flex max-w-[66ch] gap-2.5 text-sm leading-relaxed text-dim"
                  >
                    <span aria-hidden="true" className="shrink-0 text-faint">
                      -
                    </span>
                    {detail}
                  </li>
                ))}
              </ul>
            </details>
          </article>
        </li>
      ))}
    </ol>
  );
}
```

Use `h4` for each project because `h3` labels the subsection. Update test record lookup to allow either heading level through `getByRole("heading", { name })`; no selector change is required.

- [ ] **Step 3: Run the full parity suite**

Run:

```powershell
npm run test:parity
```

Expected: all parity tests pass in both layouts.

If a project record locator fails, scope it to the nearest `article` in terminal and nearest `article` in synthwave. Do not weaken assertions to global body searches.

---

### Task 5: Verify links, responsive behavior, accessibility, and production output

**Files:**
- Test: `app/components/MainSite.tsx`
- Test: `app/components/terminal/TerminalSite.tsx`
- Modify: `tests/content-parity.spec.ts`

**Interfaces:**
- Consumes: final rendered site and every `href` in canonical content
- Produces: verified final implementation and a list of any remaining factual confirmations

- [ ] **Step 1: Verify public GitHub targets with GitHub CLI**

Run:

```powershell
gh api users/spinkicks --jq '.html_url'
gh api repos/spinkicks/gt100k --jq '.html_url'
gh api repos/spinkicks/speedrun/releases/tags/v0.1.0-early --jq '.html_url'
gh api repos/spinkicks/neurobaseline --jq '.html_url'
```

Expected: each command exits 0 and returns the requested canonical URL.

- [ ] **Step 2: Verify non-GitHub URLs**

Check:

```text
https://terrify.vercel.app/
https://www.linkedin.com/in/calmguy/
https://blazing-audio-alpha.web.app/
https://huggingface.co/audiuphile/blazing-audio-slm-v7-4-dev
https://www.subwoofer.live/
https://www.virgilio.systems/
https://univyrse.ai/
https://www.utmax.tech/
https://www.utmap.app/
https://illuminate.projectempower.io/
```

Use a browser or HTTP fetch with redirects enabled. Record timeout, authentication, or anti-bot responses separately from confirmed broken URLs.

- [ ] **Step 3: Add mobile disclosure checks**

Extend the cross-layout presentation test with 390 by 844 contexts. For each layout:

```ts
const details = page.locator("#projects details").first();
await expect(details.getByText("Technical details", { exact: true })).toBeVisible();
await details.locator("summary").click();
await expect(details).toHaveAttribute("open", "");
```

Run:

```powershell
npm run test:parity
```

Expected: all tests pass at desktop and mobile widths.

- [ ] **Step 4: Run lint**

Run:

```powershell
npm run lint
```

Expected: exit code 0 with no ESLint errors.

- [ ] **Step 5: Run the production build**

Run:

```powershell
npm run build
```

Expected: exit code 0 and a successful Next.js production build.

- [ ] **Step 6: Re-run the complete parity suite after the build**

Run:

```powershell
npm run test:parity
```

Expected: all tests pass with zero failures.

- [ ] **Step 7: Inspect the final diff and repository state**

Run:

```powershell
git diff --check
git diff --stat
git status --short
```

Expected:

- no whitespace errors;
- only the approved source, tests, spec, and plan files changed;
- no generated Playwright or Next.js artifacts tracked;
- no commit created.

## Final Handoff

Return:

1. concise summary of content and layout changes;
2. exact changed-file list;
3. link-verification results;
4. lint, build, and Playwright results with command outcomes;
5. remaining confirmations, especially the displayed 2026 years for UTMAX and UTMap if no primary source verifies them.

---

### Task 6: Compact Featured Work and update SLM/factory identity

**Files:**
- Modify: `tests/content-parity.spec.ts`
- Modify: `app/content.ts`
- Modify: `app/components/MainSite.tsx`
- Modify: `app/components/hero/HeroMarquee.tsx`
- Modify: `app/components/terminal/TerminalSite.tsx`
- Modify: `app/components/terminal/commands.ts`

**Interfaces:**
- Adds: `Project.secondary?: { label: string; href: string }`
- Produces: one shared hero stat, generic factory identity, SLM model/dataset metrics and links, compact synthwave featured grid

- [ ] **Step 1: Add failing assertions**

- Require `heroStats` to equal `[{ value: "'28", label: "UT Austin BS CS" }]`.
- Replace the expected factory name with `Agentic Software Factory v1`.
- Require Small Learning Model to expose a `Dataset` link at `https://huggingface.co/datasets/audiuphile/blazing-audio-slm-v7-4-dataset-dev`.
- Require the SLM details to contain `377 model downloads` and `50 dataset downloads`.
- Require the synthwave Featured Work list to compute two grid columns at 1440px.
- Update the terminal projects-command assertion to expect Agentic Software Factory v1 with no factory URL.

Run the targeted tests and confirm they fail against the current implementation.

- [ ] **Step 2: Update canonical content**

- Replace the four hero stats with the single UT Austin credential.
- Rename GT100K Factory to Agentic Software Factory v1.
- Describe it as a cross-project bounded Claude/Codex harness used for GT100K and Subwoofer Central.
- Add the SLM dataset secondary link.
- Add: `As of August 2026, the public V7.4 development checkpoint had 377 model downloads and its companion dataset had 50 downloads.`

- [ ] **Step 3: Compact synthwave Featured Work**

- Render `featuredProjects` in a two-column grid using the compact project-entry treatment.
- Keep Featured Work and More Projects as separate headings and ordered lists.
- Preserve status, year, primary link, secondary link, stack, and native technical disclosures.
- Remove the large ordinal dossier rows.

- [ ] **Step 4: Update shared consumers**

- Render project secondary links in both layouts.
- Include secondary project links in terminal `openTargets`.
- Render the single hero stat as one centered credential in synthwave and one full-width terminal record.

- [ ] **Step 5: Verify**

Run:

```powershell
npm run lint
npm run build
npm run test:parity
git diff --check
```

Expected: all commands exit 0 and the full parity suite passes.
