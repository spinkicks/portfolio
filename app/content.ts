export const profile = {
  name: "David O.",
  role: "Software Engineer",
  location: "Austin, TX",
  email: "fear@utexas.edu",
  tagline:
    "I build AI/ML tooling and full-stack systems — from LLM evaluation pipelines to products serving real traffic.",
  bio: "CS student at UT Austin minoring in Statistics & Data Science. My work sits where machine learning meets shipping software: analyzing model failures at Mercor, simulating traffic systems at the University of Houston, and building products that hold up under real users. I care about systems that stay fast as they grow.",
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

/** Four numbers worth leading with, before anyone scrolls. */
export const heroStats = [
  { value: "3", label: "Internships" },
  { value: "5", label: "Shipped projects" },
  { value: "200", label: "WPM · top 500" },
  { value: "'26", label: "UT Austin BS CS" },
];

export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#work" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

export const facts = [
  { label: "Education", value: "UT Austin — BS Computer Science" },
  { label: "Minor", value: "Statistics & Data Science" },
  { label: "Based in", value: "Austin, TX" },
  { label: "Focus", value: "AI/ML Engineering · Full-Stack" },
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
    company: "Mercor Intelligence",
    role: "AI/ML Intern",
    period: "Feb 2025 — Apr 2025",
    summary:
      "Analyzed failure modes for a frontier LLM and turned that analysis into better training data.",
    highlights: [
      "Engineered Python tooling to cluster model failures and surface the highest-frequency error classes.",
      "Formatted and validated mathematical reasoning datasets in LaTeX for downstream training.",
      "Drove a ~0.5% accuracy gain by targeting the most common failure categories.",
    ],
    stack: ["Python", "LaTeX", "Data Analysis", "LLM Evaluation"],
  },
  {
    company: "University of Houston",
    role: "ML Researcher & SWE Intern",
    period: "May 2023 — Aug 2023",
    summary:
      "Built real-time traffic simulations to study flow phenomena and congestion paradoxes.",
    highlights: [
      "Modeled traffic networks in SUMO and Flow to reproduce and measure known flow paradoxes.",
      "Wrote TraCI API scripts for programmatic simulation control and automated data collection.",
      "Validated simulated results against real-world traffic models.",
    ],
    stack: ["Python", "SUMO", "Flow", "TraCI"],
  },
  {
    company: "Project: Empower",
    role: "Chief Operations Officer",
    period: "Aug 2022 — Jan 2024",
    summary:
      "Scaled a 501(c)(3) from a single chapter to a multi-chapter organization while shipping its product.",
    highlights: [
      "Grew the org to 100+ members across 10+ chapters and led the chapter leadership teams.",
      "Orchestrated a $100k DevPost hackathon end to end.",
      "Contributed to the Next.js frontend and the Node/Supabase/SQL backend.",
    ],
    stack: ["Next.js", "Node.js", "Supabase", "SQL"],
  },
];

export type Project = {
  name: string;
  blurb: string;
  stack: string[];
  href?: string;
  secondary?: { label: string; href: string };
  year: string;
};

export const projects: Project[] = [
  {
    name: "Illuminate",
    blurb:
      "Searchable database of ~400 high school extracurriculars. Built the responsive UI, wired up GA4, and tuned it to hold up under heavy traffic.",
    stack: ["Next.js", "React", "Supabase", "Tailwind"],
    href: "https://illuminate.projectempower.io/",
    year: "2024",
  },
  {
    name: "Tendir",
    blurb:
      "Fintech web app for organizing official contracts and public tenders. Won 1st Place Best Fintech Hack at Fintectual.",
    stack: ["Vue", "TypeScript", "Node.js", "Opentender"],
    href: "https://devpost.com/software/tender-d70yp5",
    year: "2023",
  },
  {
    name: "PintOS Kernel",
    blurb:
      "Kernel-level systems work in C: thread scheduling, synchronization primitives, and user-program system calls.",
    stack: ["C", "Operating Systems"],
    year: "2024",
  },
  {
    name: "Heap Memory Allocator",
    blurb:
      "Custom malloc/free implementation with block splitting, coalescing, and free-list management.",
    stack: ["C", "Memory Management"],
    year: "2024",
  },
  {
    name: "STEM Today",
    blurb:
      "Science communication platform that reached ~9k followers. Directed a 140+ member team making complex research readable.",
    stack: ["HTML/CSS", "JavaScript"],
    href: "https://sciencehowitworks.wixsite.com/my-site-1",
    secondary: { label: "Instagram", href: "https://www.instagram.com/stemtoday/" },
    year: "2022",
  },
];

export const skills = [
  {
    group: "Languages",
    items: ["Python", "Java", "C", "C++", "SQL", "JavaScript", "LaTeX"],
  },
  {
    group: "Frameworks & Libraries",
    items: [
      "React",
      "Next.js",
      "Node.js",
      "Tailwind CSS",
      "MongoDB",
      "NumPy",
      "Matplotlib",
      "Bootstrap",
    ],
  },
  {
    group: "Tools & Platforms",
    items: [
      "Git",
      "Supabase",
      "Google Cloud VM",
      "Cloudflare R2",
      "Google Analytics (GA4)",
      "Google Tag Manager",
      "Excel",
    ],
  },
];

export const links = [
  { label: "GitHub", href: "https://github.com/spinkicks" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/calmguy/" },
  { label: "MonkeyType", href: "https://monkeytype.com/profile/Dipslox", note: "#500 global" },
  {
    label: "Spotify",
    href: "https://open.spotify.com/user/cxxo2nymwpjcgw7kz5cttbrhj?si=8a890bb5b6584942",
  },
];
