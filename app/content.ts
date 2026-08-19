export const profile = {
  name: "David O.",
  role: "Software Engineer · Applied AI",
  location: "Austin, TX",
  email: "fear@utexas.edu",
  tagline:
    "I build evaluated AI systems, agentic developer tools, and interactive engineering software.",
  bio: "UT Austin computer science student minoring in Statistics & Data Science. Recent work spans QLoRA model routing, deterministic verification, Rust engine extensions, and deployed TypeScript products. I care about explicit limits, measurable gates, and useful interfaces.",
};

/**
 * Availability line for the hero. Flip `open` when that changes.
 *
 * Split into tag and detail because the hero renders them as two typographic
 * weights; `label` is the run-together version for screen readers.
 */
export const status = {
  open: true,
  tag: "Open",
  detail: "Summer 2027 internships",
  label: "Open to Summer 2027 internships",
};

/** Single credential shown in the hero before anyone scrolls. */
export const heroStats = [{ value: "'28", label: "UT Austin Computer Science" }];

export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#work" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

export const facts = [
  { label: "Education", value: "UT Austin, BS Computer Science" },
  { label: "Minor", value: "Statistics & Data Science" },
  { label: "Based in", value: "Austin, TX" },
  { label: "Focus", value: "SWE · Applied AI · ML/LLM Systems" },
  { label: "Languages", value: "English · Spanish (fluent)" },
];

export type Experience = {
  company: string;
  role: string;
  period: string;
  summary: string;
  highlights: string[];
  stack: string[];
};

export const experience: Experience[] = [
  {
    company: "Alpha AI",
    role: "AI Engineering Intern",
    period: "Jun 2026 to Aug 2026",
    summary:
      "Built evaluated applied-AI and learning systems across model routing, native study tooling, deterministic learner modeling, and a public audio course.",
    highlights: [
      "GT100K: served as primary engineer on a two-person, synthetic, pre-production platform spanning 28 packages, 16 adapters, and 9 apps, with deterministic Beta-Bernoulli interest inference and human-controlled transitions.",
      "Small Learning Model: fine-tuned Qwen3-1.7B with QLoRA around a calculate/defer/abstain/explain contract and an 80-function Formula Core.",
      "Speedrun: extended Anki's Rust engine with six GRE Math RPCs and shared Svelte experiences for early Windows and Android builds.",
      "Blazing Audio: shipped 13 lessons, 50 graded problems, 24 interaction types, Leitner review, and five authenticated OpenAI Cloud Functions.",
      "Short-video MVP: built a React/Firebase prototype with transactional handles, a real-time scroll-snap feed, social actions, and telemetry.",
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
      "Used Python scripts to inspect mathematical solution failure patterns and target corrections across the set.",
      "Authored structured LaTeX solutions across discrete mathematics, geometry, algorithms, and statistics/calculus as appropriate, with independent reasoning and final-answer verification.",
      "Contributed verified corrections for roughly 0.5% of a 3,000-problem frontier-model mathematics set, about 15 problems, measured as share of problems corrected in the set.",
    ],
    stack: ["Python", "LaTeX", "Mathematical Reasoning", "Data Verification"],
  },
  {
    company: "University of Houston",
    role: "ML Researcher & SWE Intern",
    period: "May 2023 to Aug 2023",
    summary:
      "Built traffic-network simulations and experiment automation for repeatable congestion research in a real-time embedded-systems research context.",
    highlights: [
      "Ran Python, SUMO, and Flow traffic simulations to investigate traffic-flow phenomena and paradoxes in controlled network models.",
      "Automated TraCI interactions for programmatic simulation control and data collection to compare simulation outcomes with real-world traffic scenarios and models.",
    ],
    stack: ["Python", "SUMO", "Flow", "TraCI"],
  },
  {
    company: "Project: Empower",
    role: "Chief Operations Officer",
    period: "Aug 2022 to Jan 2024",
    summary:
      "Served as COO while the 501(c)(3) expanded internationally, and contributed to its software products.",
    highlights: [
      "During the tenure, Project: Empower grew to 60+ chapters across 10 countries.",
      "Led a 621-participant Devpost hackathon offering $112,750 in prizes.",
      "Collaborated with the development team across React frontend and Node/Supabase/SQL backend work.",
      "Co-developed Illuminate with a team of five using Next.js, React, Node, and Supabase for roughly 400 curated opportunities.",
      "User-confirmed Illuminate surpassed 1M page visits; integrated GA4 and built/styled responsive Tailwind UI.",
    ],
    stack: [
      "Next.js",
      "React",
      "Node.js",
      "Supabase",
      "SQL",
      "Tailwind CSS",
      "GA4",
      "Operations",
    ],
  },
];

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

export const projects: Project[] = [
  {
    name: "Subwoofer Central",
    tier: "featured",
    status: "live",
    summary:
      "Live browser enclosure-engineering workstation used by 1,000+ users and growing, connecting acoustic simulation, physical geometry, Three.js visualization, warnings, charts, cut sheets, nesting, persistence, and sharing.",
    details: [
      "One normalized design model drives sealed, ported, passive-radiator, and release-gated bandpass calculations plus fabrication geometry.",
      "WebGL and geometry work use independent computation fingerprints, demand rendering, a persistent canvas, and adaptive worker offload.",
      "Its current Vitest unit/parity gate passes 5,068 cases across 422 files.",
    ],
    stack: ["Next.js", "TypeScript", "Three.js", "Vitest"],
    href: "https://www.subwoofer.live/",
    year: "2026",
  },
  {
    name: "Small Learning Model",
    tier: "featured",
    status: "development-only",
    summary:
      "Fine-tuned Qwen3-1.7B with QLoRA to route audio questions across calculate, defer, abstain, and explain, with accepted calls executed by an 80-function Formula Core.",
    details: [
      "A historical V7.2 tuned-model-plus-executor evaluation scored 94.4% versus 30.7% for base on 319 frozen value-and-unit items.",
      "V7.4 reached 91.9% numeric accuracy but remained development-only after failing strict family and behavioral release gates.",
      "As of August 2026, the public V7.4 development checkpoint had 434 all-time model downloads (400+ downloads) and its companion dataset had 54 all-time dataset downloads (50+ downloads).",
      "The pipeline includes deterministic data generation, fail-closed tool compilation, hash-pinned training, Gradio inference, and a 387-row evaluation manifest.",
    ],
    stack: ["Qwen3", "QLoRA", "PyTorch", "Python"],
    href: "https://huggingface.co/audiuphile/blazing-audio-slm-v7-4-dev",
    secondary: {
      label: "Dataset",
      href: "https://huggingface.co/datasets/audiuphile/blazing-audio-slm-v7-4-dataset-dev",
    },
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
    name: "Agentic Software Factory v1",
    tier: "featured",
    status: "development-only",
    summary:
      "Cross-project agentic software factory built around bounded Claude and Codex loop harnesses, self-QA agents, deterministic gates, recovery, browser QA, and pull-request delivery.",
    details: [
      "Runs repeated builder-review loops in isolated worktrees with file-backed cross-turn state, time and no-progress caps, and stranded-run recovery.",
      "Self-QA agents combine semantic browser walks, screenshot and pixel checks, model and deterministic graders, and specialized review panels.",
      "Used across GT100K and Subwoofer Central with host-side Git controls and pull-request delivery; the repository remains private.",
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
      "AI grading falls back to deterministic multiple choice when unavailable; the live product does not call the custom audio SLM.",
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
      "Hardened purchase-gated content delivery, administration workflows, API rate limits, and deployment reliability across the Firebase and Stripe marketplace.",
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
      "Co-developed a non-diagnostic prototype using Isolation Forest and PELT to model baseline changes in simulated typing-behavior data.",
    details: [
      "Combined anomaly detection and change-point analysis into a personalized Neuro Variability Index.",
      "Won the Synovate Hackathon first-place Grand Prize among 61 participants.",
    ],
    stack: ["Python", "scikit-learn", "FastAPI", "Next.js"],
    href: "https://github.com/spinkicks/neurobaseline",
    year: "2025",
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
    name: "Virgilio Acoustics",
    tier: "more",
    status: "live",
    summary:
      "Founded Virgilio Acoustics, an Austin audio installation business that has generated $3,000+ in revenue, and built its public site and administration workflow.",
    details: [
      "Design and install custom stereo, home-theater, and high-output audio systems for Austin clients.",
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
      "Ongoing contributor to the team-built UT Austin schedule-planning platform, used by 200+ UT Austin students before the 2026-27 school year began, including an 18-file UI revamp.",
    details: [
      "The 18-file contribution tightened frontend presentation and interaction quality across the shared product.",
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
      "Ongoing co-development on the team-built UT Austin campus map, used by 200+ UT Austin students before the 2026-27 school year began, with a focus on mobile interaction and map readability.",
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
      "Contributed responsive search and discovery flows around the shared opportunity catalog.",
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
      "React and Firebase prototype with transactional unique-handle signup, a real-time scroll-snap feed, social actions, and watch telemetry.",
    details: [
      "Implemented the central consumption loop, optimistic likes and favorites, live comments, and append-only engagement events.",
      "The prototype did not include uploads, personalized recommendations, Cloud Functions, or a moderation interface.",
    ],
    stack: ["React", "TypeScript", "Firebase"],
    href: "https://github.com/spinkicks/short-form-video-app",
    year: "2026",
  },
];

export const featuredProjects = projects.filter(
  (project) => project.tier === "featured"
);

export const moreProjects = projects.filter(
  (project) => project.tier === "more"
);

export const skills = [
  {
    group: "Languages",
    items: ["Python", "TypeScript/JavaScript", "Rust", "SQL", "C/C++", "Go", "Java"],
  },
  {
    group: "AI and ML",
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
    group: "Web and Systems",
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
    group: "Testing and Tools",
    items: ["Vitest", "Pytest", "Playwright", "Git", "Linux/WSL", "Vercel"],
  },
];

export const links = [
  { label: "GitHub", href: "https://github.com/spinkicks" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/calmguy/" },
  { label: "Devpost", href: "https://devpost.com/davidos" },
];
