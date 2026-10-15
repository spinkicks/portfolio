export const profile = {
  name: "David O.",
  role: "Software Engineer · Applied AI",
  location: "Austin, TX",
  email: "fear@utexas.edu",
  tagline:
    "I build evaluated AI systems, agentic developer tools, and interactive engineering software.",
  bio: "UT Austin computer science student minoring in Data Science (3.71 GPA). Recent work spans QLoRA model routing, C++17/C++20 systems engines, Rust and Go backend services, and deployed TypeScript/Three.js products. I care about explicit limits, measurable gates, and useful interfaces.",
};

/**
 * Availability line for the hero. Flip `open` when that changes.
 *
 * Split into tag and detail because the hero renders them as two typographic
 * weights; `label` is the run-together version for screen readers.
 */
export const status = {
  open: false,
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
  { label: "Education", value: "UT Austin, BS Computer Science (3.71 GPA)" },
  { label: "Minor", value: "Data Science" },
  { label: "Based in", value: "Austin, TX" },
  { label: "Focus", value: "Full-Stack · Distributed Systems · ML" },
  { label: "Languages", value: "English · Spanish (fluent)" },
];

export const awards = [
  "1st Place, Fintectual FinTech Hackathon (out of 40+ teams, 2025)",
  "Grand Prize, Synovate by Synertech (out of 80+ teams, 2025)",
  "Eagle Scout (2024)",
  "President's Volunteer Service Award, Gold (2023)",
];

export type Experience = {
  company: string;
  role: string;
  period: string;
  summary: string;
  highlights: string[];
  stack: string[];
  href?: string;
};

export const experience: Experience[] = [
  {
    company: "IEXDevs",
    role: "Technical Officer",
    period: "May 2026 to Present",
    href: "https://iexdevs.com/",
    summary:
      "Direct technical architecture, RFCs, and code review standards across 15+ student developers building UTMAX and UTMap for the UT Austin campus.",
    highlights: [
      "Direct technical architecture and code review standards across a team of 15+ student developers through architecture RFCs, guiding production delivery for campus platforms including UTMAX and UTMap.",
      "Grew campus adoption to 100+ active student users across UTMAX and UTMap, collaborating with UT Enterprise Technology and the Office of the Registrar toward official university publication and review.",
      "Built an automated data pipeline preprocessing UT course catalogs across 106k+ sections and 234 departments (10+ CPU-hours per run), running refreshes 3 times per week with multi-source fallbacks to prevent downtime.",
      "Engineered a schedule solver that balances section locks, time blocks, walking times, professor ratings, and grade distributions, built on a privacy-first local architecture that never requires university passwords.",
      "Built a Chrome extension registration assistant that overlays saved schedules and a step-by-step queue directly onto UT Direct pages, enabling one-click registration without manual section lookups.",
      "Consolidated campus search, walking navigation, and live transit into UTMap; integrated Texas Open Data GTFS-RT feeds to render real-time bus telemetry across an interactive 3D map covering 350+ campus buildings and 50 geospatial layers.",
    ],
    stack: [
      "Next.js 16",
      "TypeScript",
      "Supabase",
      "Mapbox GL",
      "GTFS-RT",
      "Chrome Extension",
      "MCP",
    ],
  },
  {
    company: "Alpha AI",
    role: "AI Engineering Intern",
    period: "Jun 2026 to Aug 2026",
    summary:
      "Delivered five full-stack and AI products across TypeScript, Rust, Python, and Kotlin, shipping production web services alongside packaged Windows and Android clients.",
    highlights: [
      "Delivered five full-stack and AI products across TypeScript, Rust, Python, and Kotlin; shipped production web services alongside packaged Windows (MSI) and Android (APK) clients for internal teams and public end users.",
      "Designed GitHub Actions CI/CD pipelines and an autonomous multi-agent review swarm enforcing type-checking and deterministic test suites before pull request merges.",
      "Engineered Speedrun at Alpha AI, extending Anki's Rust core with six Protobuf-defined RPC endpoints for GRE Math readiness scoring; reused shared Svelte UI routes across packaged Windows MSI and Android APK clients.",
      "Built Blazing Audio (selected by leadership as a Top 10 project across company-wide engineering demos); engineered a Brilliant-style interactive learning platform for audio systems in React 18, TypeScript, and Zustand with 24 custom interaction types, Web Audio synthesis, and Firebase Cloud Functions.",
      "Fine-tuned a 1.7B-parameter Qwen3 model (Audio SLM) via QLoRA on scraped DIY audio forum data and literature; engineered deterministic Python tool routing across an 80-function Formula Core, reducing invalid calculation responses from ~69% to 5.6% on 319 held-out items (400+ model downloads on Hugging Face).",
    ],
    stack: [
      "TypeScript",
      "Rust",
      "Python",
      "Kotlin",
      "Svelte",
      "React 18",
      "Firebase",
      "QLoRA",
    ],
  },
  {
    company: "Mercor",
    role: "AI Quality & Mathematical Data Contractor",
    period: "Feb 2025 to Apr 2025 · Aug 2026 to Sep 2026",
    summary:
      "Evaluated multi-candidate frontier model outputs across frontend web apps and delivered verified mathematical-reasoning datasets across two contractor engagements.",
    highlights: [
      "AI Quality & Preference Evaluation (Aug 2026 to Sep 2026): Evaluated multi-candidate frontier model outputs across frontend web apps, slide decks, and copy; documented visual inconsistencies, CSS animation defects, color and theme mismatches, responsive spacing issues, component overlap, and AI slop.",
      "AI/ML Mathematical Data (Feb 2025 to Apr 2025): Engineered Python inspection scripts and delivered ~400 verified LaTeX solutions across discrete math, geometry, and algorithms with a 95.5% reviewer acceptance rate; validated solutions through independent derivation and reviewer verification where frontier models failed spatial reasoning.",
    ],
    stack: [
      "Python",
      "LaTeX",
      "UI/UX Evaluation",
      "Mathematical Reasoning",
      "Data Verification",
    ],
  },
  {
    company: "Chakra Labs",
    role: "AI Workflow & Trajectory Contractor",
    period: "Nov 2025 to Jan 2026",
    summary:
      "Recorded structured multi-application desktop workflows and UI trajectories for multimodal computer-use model training.",
    highlights: [
      "Created step-by-step demonstrations for complex Word, Excel, and PowerPoint workflows, recording UI actions, application state, screen coordinates, and structured task rationales for multimodal computer-use model training.",
      "Delivered 70 completed multi-application trajectories with a 98% acceptance rate, validating desktop automation across advanced data filtering, workbook calculations, and presentation design.",
    ],
    stack: [
      "Computer-Use Trajectories",
      "Multimodal Data",
      "Desktop Automation",
      "Excel",
      "PowerPoint",
      "Word",
    ],
  },
  {
    company: "Virgilio Acoustics",
    role: "Founder & Audio Engineer",
    period: "2026 to Present",
    href: "https://www.virgilio.systems/",
    summary:
      "Founded a custom-audio business in Austin serving 10+ clients and converted recurring enclosure-design workflows into Subwoofer Central.",
    highlights: [
      "Founded a custom-audio business serving 10+ clients with $14K revenue ($5K profit); converted recurring enclosure-design workflows into Subwoofer Central, a browser CAD and acoustic simulation platform.",
    ],
    stack: [
      "Acoustic Engineering",
      "CAD",
      "Next.js",
      "TypeScript",
      "Neon",
      "Vercel Blob",
    ],
  },
  {
    company: "Project: Empower",
    role: "Chief Operations Officer & Full-Stack Lead",
    period: "Aug 2022 to Jan 2024",
    summary:
      "Directed operations and full-stack engineering for an educational 501(c)(3) non-profit and co-developed its Illuminate opportunity platform.",
    highlights: [
      "Co-developed Illuminate with a 5-person engineering team using Next.js, React, Node.js, and Supabase (PostgreSQL); designed relational database schemas with connection pooling and composite indexing, supporting 1M+ cumulative pageviews across ~400 opportunities with sub-50ms p95 query latency.",
      "Directed operations for an educational 501(c)(3) non-profit (core team of 15; 60+ registered chapters nationwide); organized a 621-participant hackathon securing $112,750 in prize sponsorships (cash and platform credits).",
    ],
    stack: [
      "Next.js",
      "React",
      "Node.js",
      "Supabase",
      "PostgreSQL",
      "Tailwind CSS",
    ],
  },
  {
    company: "University of Houston",
    role: "Machine Learning Researcher & Software Engineering Intern",
    period: "May 2023 to Aug 2023",
    summary:
      "Compared reinforcement-learning and conventional actuated signal-control policies across simulated urban traffic networks.",
    highlights: [
      "Compared reinforcement-learning and conventional actuated signal-control policies using average queue delay and vehicle waiting time across 12 simulated traffic networks with 1,000+ simulated vehicles.",
      "Automated experiment configuration, vehicle routing, and TraCI telemetry collection, enabling reproducible comparisons across control policies and traffic scenarios.",
    ],
    stack: ["Python", "Reinforcement Learning", "SUMO", "Flow", "TraCI"],
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
  image?: string;
  imageAspect?: number;
  year: string;
};

export const projects: Project[] = [
  {
    name: "Subwoofer Central",
    tier: "featured",
    status: "live",
    summary:
      "Browser-based 3D loudspeaker enclosure CAD workstation reaching 1,000+ unique visitors, pairing parametric Three.js modeling and 2D cut-sheet nesting with a pure-TypeScript Thiele/Small acoustics solver.",
    details: [
      "Built and launched a browser-based 3D loudspeaker enclosure CAD workstation reaching 1,000+ unique visitors; engineered parametric 3D modeling for custom driver sizes via Three.js (@react-three/fiber) with 2D cut-sheet nesting.",
      "Developed a pure-TypeScript acoustics simulation solver modeling sealed, ported, and passive-radiator alignments from Thiele/Small parameters; plotted SPL, excursion vs. Xmax, port velocity, group delay, and impedance via uPlot.",
      "Architected state and data layers using Next.js App Router, Zustand for interactive 3D builder state, and Supabase (PostgreSQL, Auth, RLS) with type-safe Drizzle ORM migrations and TanStack Query caching.",
      "Automated 5,068 Vitest test cases validating acoustic formulas and boundary constraints; offloaded CSG mesh boolean operations to Web Workers, keeping the main UI thread responsive during real-time 3D re-renders.",
    ],
    stack: [
      "Next.js",
      "TypeScript",
      "Three.js",
      "Supabase",
      "Drizzle ORM",
      "Zustand",
      "Vitest",
    ],
    href: "https://www.subwoofer.live/",
    image: "/projects/subwoofercentral.png",
    imageAspect: 2854 / 1622,
    year: "2026",
  },
  {
    name: "Audio SLM",
    tier: "featured",
    status: "development-only",
    summary:
      "1.7B-parameter Qwen3 model fine-tuned via QLoRA with a 4-way routing contract (calculate, defer_measurement, abstain, explain) dispatching numeric queries to an 80-tool Python Formula Core.",
    details: [
      "Fine-tuned a 1.7B-parameter Qwen3 model via QLoRA embedding niche electro-acoustic knowledge; engineered a 4-way routing contract (calculate, defer_measurement, abstain, explain) dispatching numeric queries to an 80-tool Python Formula Core.",
      "Curated domain datasets by scraping DIY audio forums (DIYAudio, AVS Forum) and Thiele/Small literature to capture niche tribal knowledge missing from frontier models; authored 4,200+ JSONL training rows (60+ dataset downloads).",
      "Evaluated 319 numeric and 68 behavioral dev rows, achieving 94.4% headline accuracy (301/319 items) and 98.12% argument validity; reduced invalid calculation responses from ~69% to 5.6% on paired benchmarks (400+ model downloads).",
    ],
    stack: ["Python", "PyTorch", "Qwen3", "QLoRA", "Hugging Face", "PEFT"],
    href: "https://huggingface.co/audiuphile/blazing-audio-slm-v7-4-dev",
    secondary: {
      label: "Dataset",
      href: "https://huggingface.co/datasets/audiuphile/blazing-audio-slm-v7-4-dataset-dev",
    },
    image: "/projects/audioSLM.png",
    imageAspect: 2842 / 1552,
    year: "2026",
  },
  {
    name: "Blazing Audio",
    tier: "featured",
    status: "live",
    summary:
      "Brilliant-style interactive learning platform for home audio systems (selected as a Top 10 company-wide engineering demo at Alpha AI), shipping 13 lessons and 50 graded problems across 24 custom interaction types.",
    details: [
      "Built a Brilliant-style interactive learning platform for home audio systems (selected by leadership as a Top 10 project across company-wide engineering demos); shipped 13 lessons and 50 graded problems across 24 custom interaction types.",
      "Engineered deterministic client-side exercise grading via pure synchronous physics functions; implemented Leitner spaced repetition across a 17-concept acyclic dependency graph validated with Vitest.",
      "Architected backend services using Firebase Gen2 Cloud Functions on Node 22, integrating OpenAI gpt-4o-mini with Zod-validated structured outputs for semantic free-recall grading and dynamic tutoring.",
    ],
    stack: [
      "React 18",
      "TypeScript",
      "Vite",
      "Tailwind CSS",
      "Zustand",
      "Web Audio",
      "Firebase",
    ],
    href: "https://blazing-audio-alpha.web.app/",
    image: "/projects/blazingaudio.png",
    imageAspect: 2832 / 1556,
    year: "2026",
  },
  {
    name: "Speedrun",
    tier: "featured",
    status: "early release",
    summary:
      "Adaptive GRE Math platform extending Anki's Rust engine with six Protobuf RPC endpoints, statistical readiness scoring, a pure-SVG prerequisite graph, and shared SvelteKit UI across Windows MSI and Android APK builds.",
    details: [
      "Extended Anki's Rust engine with six Protobuf RPC endpoints for topic mastery and undo-safe card reordering; cross-compiled via PyO3 for desktop and JNI AAR for Android, sharing SvelteKit UI across packaged Windows MSI and signed ARM64 APKs.",
      "Engineered three statistical scoring models: FSRS retrievability with Wilson 95% confidence intervals for topic recall, key-checked MCQ accuracy for performance, and Item Response Theory (IRT) with conformal bands for 200-990 exam readiness.",
      "Architected an interactive pure-SVG prerequisite graph (THE MAP) showing which later topics depend on each concept; implemented weakness-aware scheduling interleaving due cards by predicted retrievability decay and ETS topic weights.",
      "Built a decoupled FastAPI generation service pairing exact-notation BM25 retrieval (matching dense vectors at 0.90 Recall@10 across 50 held-out queries) with fail-closed SymPy CAS verification and gold-set gating to filter invalid questions.",
    ],
    stack: ["Rust", "SvelteKit", "Kotlin", "FastAPI", "SymPy"],
    href: "https://github.com/spinkicks/speedrun/releases/tag/v0.1.0-early",
    year: "2026",
  },
  {
    name: "GT100K",
    tier: "featured",
    status: "pre-production",
    summary:
      "Lead engineer on a 4-person team building Go microservices, Temporal workflows, a tamper-evident student code provenance graph (EvidenceGraph), and decayed Beta-Bernoulli interest inference.",
    details: [
      "Directed a 4-person team building backend services; engineered Go microservices with Protobuf schemas, Temporal distributed workflows, OPA policies, and transactional outbox patterns deployed across AWS ECS and RDS.",
      "Built a hash-linked history of student code changes (EvidenceGraph), tracking state transitions, incremental snapshots, and git diffs to reveal tampering and document how projects were built without intrusive AI detectors.",
      "Implemented a decayed Beta-Bernoulli model with a 14-day half-life to infer student passions and rank topic recommendations based on research-backed voluntary return signals without gamification bias.",
    ],
    stack: ["Go", "TypeScript", "Next.js", "PostgreSQL", "AWS", "Temporal"],
    href: "https://github.com/spinkicks/gt100k",
    year: "2026",
  },
  {
    name: "Agentic Factory v1",
    tier: "featured",
    status: "development-only",
    summary:
      "Autonomous coding harness driving headless Claude Code and Codex across isolated Git worktrees, paired with an adversarial Playwright QA suite, 2x2 consensus PR review, and a systemd Socket-Mode Slack daemon.",
    details: [
      "Engineered an autonomous coding harness driving headless Claude Code and Codex across isolated Git worktrees; enforced host-side atomic commits, durable markdown turn memory (.loop), and pluggable test gates across 15 tasks.",
      "Built an adversarial Playwright QA suite detecting dead canvases via pixel hashing and checking for unexpected changes in application state; automated a 2x2 consensus review engine (2 code, 2 UX reviewers) across pull requests, assigning fixes to AI models based on issue severity.",
      "Architected a systemd Socket-Mode Slack daemon driving read-only agent sessions across DM threads; enforced operator whitelisting, 6 req/min rate limits, least-privilege tools (Read, Grep, Glob), secret path blocking, and audit trails.",
    ],
    stack: ["Python", "Bash", "Claude Code", "Codex", "Playwright", "systemd"],
    year: "2026",
  },
  {
    name: "Turing Machine Runtime Ranking Engine",
    tier: "featured",
    status: "development-only",
    summary:
      "C++17 systems engine ranking seven ring-tape Turing machines by runtime within a single-core, 250 ms, 64 MiB budget, reaching 90.1% instructor test accuracy and 99.67% across 20,601 local benchmark comparisons.",
    details: [
      "Built a C++17 program ranking seven Turing machines by runtime within a single-core, 250 ms, 64 MiB budget; achieved 90.1% pairwise accuracy across 120 instructor-held test racks over three runs.",
      "Automated Docker builds of statically linked Linux executables and verified source/binary consistency; added 21 release-check regression tests and completed 984 test hands under CPU and RAM limits without failures or missed deadlines.",
      "Accelerated simulation by detecting repeating tape patterns without waiting for complete rotations and batching steps where the head stays stationary; answered all 981 local test hands in under 179 ms each.",
      "Built a 16 MiB memory-mapped cache that recognizes equivalent machines despite renamed states or reversed movement and resumes unfinished simulations; improved local accuracy from 98.10% without caching to 99.67%.",
      "Benchmarked baseline and optimized builds across six suites and 20,601 comparisons, measuring accuracy gains from 94.39% to 99.67%; used independent Python/C simulators, forced hash collisions, and memory-error checks to test correctness.",
    ],
    stack: ["C++17", "Docker", "Linux", "Python"],
    year: "2026",
  },
  {
    name: "UTMAX",
    tier: "featured",
    status: "live",
    summary:
      "Conflict-free course schedule planner and Chrome extension registration assistant for UT Austin (106k+ sections across 9 terms), paired with the npm-published @iexdevs/utmax-mcp 20-tool agent server.",
    details: [
      "Engineered a conflict-free course schedule planner for UT Austin (106k+ sections across 9 terms); integrated walking-time constraints and a Chrome extension providing a side-by-side registration queue with live UT Direct sync.",
      "Architected the npm-published @iexdevs/utmax-mcp server exposing 20 agent tools across public APIs; built multi-client installers across 10 IDEs (74 automated tests) and passwordless Web3 SIWE/OAuth authentication that merges saved schedules across linked accounts.",
    ],
    stack: [
      "Next.js 16",
      "TypeScript",
      "Supabase",
      "Chrome Extension",
      "MCP",
    ],
    href: "https://www.utmax.tech/",
    image: "/projects/utmax.png",
    imageAspect: 2878 / 1510,
    year: "2026",
  },
  {
    name: "UTMap",
    tier: "featured",
    status: "live",
    summary:
      "Interactive 3D campus explorer for UT Austin with automatic Mapbox-to-MapLibre failover, 350 mapped facilities, 50 ArcGIS layers, 4-tier multi-stop routing, and real-time GTFS-RT shuttle tracking.",
    details: [
      "Built an interactive 3D campus explorer with automatic Mapbox-to-MapLibre failover; mapped 350 campus facilities and 50 ArcGIS layers alongside a live building hours engine (UT LibCal and 42 curated schedules in Central time).",
      "Implemented multi-stop routing (up to 8 stops) with a 4-tier provider fallback chain (Mapbox to OSRM to straight-line); engineered real-time GTFS-RT shuttle tracking across 7 transit routes, animating estimated shuttle movement when live location updates stop.",
    ],
    stack: [
      "Next.js 16",
      "TypeScript",
      "Mapbox GL",
      "MapLibre",
      "GTFS-RT",
      "GeoJSON",
    ],
    href: "https://www.utmap.app/",
    image: "/projects/utmap.png",
    imageAspect: 2880 / 1620,
    year: "2026",
  },
  {
    name: "keyAC",
    tier: "featured",
    status: "development-only",
    summary:
      "Native C++20 Win32 autoclicker using SendInput, a hybrid waitable-timer and 2ms QPC spin-wait engine, stochastic AR(1) and Ornstein-Uhlenbeck timing models, and a zero-dependency double-buffered GDI UI.",
    details: [
      "Engineered a native Win32 autoclicker in C++20; synthesized low-latency mouse events via SendInput, driven by a hybrid timer (PreciseWaiter) pairing high-resolution waitable timers with a 2ms QPC spin-wait tail to bypass 15.6ms OS quantization.",
      "Modeled human clicking dynamics using an AR(1) log-normal process with Ito drift correction to preserve mean CPS; simulated multi-second rhythm drift via an Ornstein-Uhlenbeck mean-reverting SDE and Beta(7,13) press duty cycles.",
      "Seeded launch profiles with 64-bit entropy (PID, clock, random_device) to prevent deterministic anti-cheat profiling; built real-time window filters for active LWJGL classes and cursor-visibility heuristics for inventory pausing.",
      "Architected a double-buffered GDI control panel with zero external DLL dependencies and High-DPI scaling; built automated regression test suites (--self-test, --timing-test) compiled under strict MSVC security flags (/GUARD:CF, /GS, /sdl, /WX).",
    ],
    stack: [
      "C++20",
      "Win32 API",
      "GDI",
      "SendInput",
      "Multithreading",
      "MSVC",
    ],
    image: "/projects/keyac.png",
    imageAspect: 996 / 1338,
    year: "2026",
  },
  {
    name: "Graphics API Telemetry & Energy Efficiency Benchmark",
    tier: "more",
    status: "development-only",
    summary:
      "Empirical graphics API energy-efficiency benchmark across Vulkan, Direct3D 12, and OpenGL on an NVIDIA RTX 3070 GPU (140W TGP), quantifying frames-per-watt and driver synchronization overhead.",
    details: [
      "Benchmarked graphics API energy efficiency across Vulkan, Direct3D 12, and OpenGL on an NVIDIA RTX 3070 GPU (140W TGP); built an automated telemetry harness logging board/chip power, hotspot thermals, clock voltage, and VRAM via TechPowerUp GPU-Z across 3 cold-reboot trials with locked fan speeds to eliminate thermal drift.",
      "Quantified frames-per-watt (FPS/W) under a ~139W board-power limit in GravityMark (500k asteroids, 1440p); Vulkan achieved 101.1 FPS (0.727 FPS/W) at 91.9W chip power, outperforming OpenGL (89.0 FPS, 0.641 FPS/W) by +13.6% and D3D12 (88.2 FPS, 0.633 FPS/W) by +14.6% throughput (+14.8% energy efficiency).",
      "Profiled driver runtime overhead and synchronization models; determined that explicit command buffers and application-managed resource barriers eliminated CPU-side driver validation stalls, sustaining 99.0% GPU load in Vulkan/D3D12 versus 90.9% in OpenGL where driver-thread bookkeeping starved the hardware command queue.",
    ],
    stack: ["Vulkan", "Direct3D 12", "OpenGL", "GPU-Z", "Python"],
    year: "2026",
  },
  {
    name: "Univyrse",
    tier: "more",
    status: "development-only",
    summary:
      "Co-developed a college-application marketplace with Stripe Connect multi-party checkout workflows, webhook idempotency, Redis rate limiting, and purchase-gated Firestore rules.",
    details: [
      "Co-developed a college-application marketplace; engineered Stripe Connect multi-party checkout workflows with webhook idempotency to prevent duplicate charges and race conditions.",
      "Maintained worker stability during concurrent checkout load tests using Redis-backed rate limiting and asynchronous queues; enforced purchase-gated Firestore security rules.",
    ],
    stack: ["Next.js", "Firebase", "Stripe Connect", "Redis"],
    year: "2026",
  },
  {
    name: "NeuroBaseline",
    tier: "more",
    status: "prototype",
    summary:
      "Grand Prize winner (out of 80+ teams at Synovate by Synertech) tracking keystroke dynamics and longitudinal behavioral drift via PELT change-point detection and Isolation Forest.",
    details: [
      "Co-built in 48 hours with a 2-person team (Grand Prize out of 80+ teams at Synovate by Synertech); engineered a lightweight prototype tracking keystroke dynamics across reaction times, typing rhythm (inter-key intervals), and backspace rates.",
      "Implemented change-point detection via the PELT algorithm (ruptures) and Isolation Forest (scikit-learn, statsmodels) to establish individual baselines and detect statistically significant behavioral drift over time.",
      "Built an asynchronous FastAPI backend for statistical inference and a Next.js visualization dashboard with interactive Plotly charts, isolating sensitive telemetry client-side to safeguard user data.",
    ],
    stack: [
      "Python",
      "FastAPI",
      "statsmodels",
      "ruptures",
      "scikit-learn",
      "Next.js",
      "Plotly",
    ],
    href: "https://github.com/spinkicks/neurobaseline",
    year: "2025",
  },
  {
    name: "Short-Video MVP",
    tier: "more",
    status: "prototype",
    summary:
      "Short-video social prototype in React 19, TypeScript, and Firebase with transactional unique-handle signup reservation, compensating Auth rollback, and Intersection Observer autoplay.",
    details: [
      "Built a short-video social prototype featuring transactional unique-handle signup reservation, compensating Auth rollback on failure, and a vertical feed with Intersection Observer autoplay.",
    ],
    stack: ["React 19", "TypeScript", "Firebase"],
    href: "https://github.com/spinkicks/short-form-video-app",
    year: "2026",
  },
  {
    name: "Virgilio Acoustics",
    tier: "more",
    status: "live",
    summary:
      "Custom-audio installation business serving 10+ Austin clients ($14K revenue, $5K profit) alongside its public Next.js marketing platform and Neon/Vercel Blob administration workflow.",
    details: [
      "Founded a custom-audio business serving 10+ clients with $14K revenue ($5K profit); converted recurring enclosure-design workflows into Subwoofer Central, a browser CAD and acoustic simulation platform.",
      "Combined a Next.js and TypeScript marketing site with Vercel Analytics and a password-protected Neon and Vercel Blob administration workflow, reaching 500+ site visitors.",
    ],
    stack: ["Next.js", "TypeScript", "Neon", "Vercel Blob"],
    href: "https://www.virgilio.systems/",
    image: "/projects/virgilioacoustics.png",
    imageAspect: 2880 / 1618,
    year: "2026",
  },
  {
    name: "Illuminate",
    tier: "more",
    status: "live",
    summary:
      "Searchable extracurricular opportunity platform co-developed at Project: Empower with Next.js, React, Node.js, and Supabase, supporting 1M+ cumulative pageviews across ~400 opportunities.",
    details: [
      "Co-developed Illuminate with a 5-person engineering team using Next.js, React, Node.js, and Supabase (PostgreSQL); designed relational database schemas with connection pooling and composite indexing, supporting 1M+ cumulative pageviews across ~400 opportunities with sub-50ms p95 query latency.",
    ],
    stack: ["Next.js", "React", "Node.js", "Supabase", "PostgreSQL"],
    href: "https://illuminate.projectempower.io/",
    image: "/projects/illuminate.png",
    imageAspect: 2880 / 1550,
    year: "2024",
  },
];

export const featuredProjects = projects.filter(
  (project) => project.tier === "featured"
);

export const moreProjects = projects.filter(
  (project) => project.tier === "more"
);

export const carouselProjects = projects.filter((project) =>
  Boolean(project.image)
);

export const skills = [
  {
    group: "Languages",
    items: [
      "Python",
      "TypeScript",
      "JavaScript",
      "Rust",
      "Go",
      "SQL",
      "C/C++",
      "Java",
      "Kotlin",
      "Bash",
    ],
  },
  {
    group: "Machine Learning & Scientific",
    items: [
      "PyTorch",
      "Hugging Face Transformers/PEFT",
      "QLoRA",
      "vLLM",
      "scikit-learn",
      "SymPy",
      "NumPy",
      "SciPy",
      "Pandas",
      "statsmodels",
    ],
  },
  {
    group: "Web & Backend",
    items: [
      "React",
      "Next.js",
      "Node.js",
      "FastAPI",
      "Svelte",
      "Three.js",
      "Tailwind CSS",
    ],
  },
  {
    group: "Data & Infrastructure",
    items: [
      "PostgreSQL",
      "MySQL",
      "Supabase",
      "Redis",
      "Temporal",
      "Docker",
      "AWS ECS/RDS",
      "Firebase",
      "GitHub Actions",
    ],
  },
  {
    group: "Testing & Tooling",
    items: ["Vitest", "Pytest", "Playwright", "Git", "Linux", "Web Workers"],
  },
  {
    group: "Systems & Graphics",
    items: [
      "Vulkan",
      "Direct3D 12 (D3D12)",
      "OpenGL",
      "Win32 API",
      "GDI",
      "GPU-Z Telemetry",
      "Energy-Efficient Computing",
    ],
  },
];

export const links = [
  { label: "GitHub", href: "https://github.com/spinkicks" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/calmguy/" },
  { label: "X", href: "https://x.com/audiuphile" },
  { label: "Devpost", href: "https://devpost.com/davidos" },
];
