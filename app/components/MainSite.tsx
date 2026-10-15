"use client";

import { ReactNode, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, Mail, Terminal, X } from "lucide-react";
import {
  Backdrop,
  BackdropSwitch,
  creditFor,
  DEFAULT_BACKDROP,
  type BackdropId,
} from "./scenes/backdrops";
import {
  CrtRoll,
  FrameEdge,
  Grain,
  Scanlines,
  SectionNav,
  SocialRail,
} from "./hero/Chrome";
import HeroMarquee from "./hero/HeroMarquee";
import CircularCarousel, { type CircularCarouselItem } from "./CircularCarousel";
import TypingTest from "./TypingTest";
import {
  awards,
  carouselProjects,
  experience,
  facts,
  featuredProjects,
  links,
  moreProjects,
  profile,
  skills,
  type Experience,
  type Project,
} from "../content";

const DESKTOP_TABLIST_QUERY = "(min-width: 1024px)";

function subscribeTablistOrientation(onStoreChange: () => void) {
  const media = window.matchMedia(DESKTOP_TABLIST_QUERY);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getTablistOrientation() {
  return window.matchMedia(DESKTOP_TABLIST_QUERY).matches ? "vertical" : "horizontal";
}

let isNavVisible = true;
let lastScrollY = 0;
let scrollListenerAttached = false;
let isScrollingActive = false;
let scrollIdleTimer: ReturnType<typeof setTimeout> | null = null;
const navListeners = new Set<() => void>();

function setNavVisibleState(visible: boolean) {
  if (isNavVisible !== visible) {
    isNavVisible = visible;
    navListeners.forEach((l) => l());
  }
}

function clearScrollingFlag() {
  scrollIdleTimer = null;
  if (isScrollingActive) {
    isScrollingActive = false;
    document.documentElement.removeAttribute("data-scrolling");
  }
}

function onGlobalScroll() {
  if (!isScrollingActive) {
    isScrollingActive = true;
    document.documentElement.setAttribute("data-scrolling", "true");
  }
  if (scrollIdleTimer !== null) {
    clearTimeout(scrollIdleTimer);
  }
  scrollIdleTimer = setTimeout(clearScrollingFlag, 140);

  const threshold = 8;
  const currentY = window.scrollY;
  if (currentY <= 60) {
    setNavVisibleState(true);
  } else {
    const delta = currentY - lastScrollY;
    if (delta > threshold) {
      setNavVisibleState(false);
    } else if (delta < -threshold) {
      setNavVisibleState(true);
    }
  }
  lastScrollY = currentY;
}

function subscribeNav(onStoreChange: () => void) {
  navListeners.add(onStoreChange);
  if (typeof window === "undefined") return () => navListeners.delete(onStoreChange);

  if (!scrollListenerAttached) {
    lastScrollY = window.scrollY;
    if (window.scrollY > 60) {
      isNavVisible = false;
    }
    window.addEventListener("scroll", onGlobalScroll, { passive: true });
    scrollListenerAttached = true;
  }

  return () => {
    navListeners.delete(onStoreChange);
    if (navListeners.size === 0 && scrollListenerAttached) {
      window.removeEventListener("scroll", onGlobalScroll);
      scrollListenerAttached = false;
      if (scrollIdleTimer !== null) {
        clearTimeout(scrollIdleTimer);
      }
      clearScrollingFlag();
    }
  };
}

function getNavSnapshot() {
  return isNavVisible;
}

function getNavServerSnapshot() {
  return true;
}

function TopNav({ onSwitch }: { onSwitch: () => void }) {
  const visible = useSyncExternalStore(subscribeNav, getNavSnapshot, getNavServerSnapshot);

  return (
    <header
      onFocus={() => setNavVisibleState(true)}
      className={`fixed inset-x-0 top-0 z-40 flex items-center justify-end gap-2 p-4 will-change-transform transition-all duration-300 motion-reduce:transition-none sm:p-7 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-full opacity-0"
      }`}
    >
      <SectionNav />
      <button
        type="button"
        onClick={onSwitch}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line-soft bg-ink-800/70 px-4 font-mono text-xs tracking-wide text-dim backdrop-blur transition-colors duration-200 hover:border-magenta hover:text-fg"
      >
        <Terminal size={14} aria-hidden="true" />
        Terminal view
      </button>
    </header>
  );
}

export default function MainSite({ onSwitch }: { onSwitch: () => void }) {
  const [scene, setScene] = useState<BackdropId>(DEFAULT_BACKDROP);
  return (
    <div className="relative min-h-screen bg-ink text-fg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:border focus:border-cyan focus:bg-ink-800 focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>

      <Backdrop id={scene} />

      <TopNav onSwitch={onSwitch} />

      <SocialRail className="hidden lg:flex" />

      <main id="main" className="relative z-20">
        <HeroMarquee
          switcher={<BackdropSwitch value={scene} onChange={setScene} />}
        />

        {/* The backdrop used to dim itself as you scrolled, which is what made
            the lighting swing. The darkening lives here instead: it belongs to
            the content and scrolls with it, so any given paragraph always sits
            on the same tone no matter where the page is.

            The ramp is measured in vh rather than in percent. A percentage
            would be a fraction of this block, which is the height of the whole
            page. The fade would still be arriving somewhere around the
            projects list, leaving the first section stranded over the sun. A
            linear-gradient holds its final stop, so past 55vh this is a flat
            wash all the way down. At 81% ink opacity about 19% of the backdrop
            remains visible through the scrim. */}
        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-[16vh] bottom-0 bg-[linear-gradient(to_bottom,transparent_0,color-mix(in_srgb,var(--color-ink)_81%,transparent)_55vh)]"
          />

          <div className="relative mx-auto w-full max-w-5xl space-y-24 px-6 pb-24 pt-24 sm:space-y-32 sm:pb-32">
            <About />
            <Work />
            <Projects />
            <Skills />

            <Reveal>
              <TypingTest />
            </Reveal>

            <Contact backdrop={scene} />
          </div>
        </div>
      </main>

      <FrameEdge />
      <Scanlines />
      <CrtRoll />
      <Grain />
    </div>
  );
}

/* --------------------------------------------------------------- About */

function About() {
  return (
    <Section id="about" title="About">
      <div className="grid gap-12 md:grid-cols-[1.35fr_1fr]">
        <div>
          <p className="max-w-[60ch] text-base leading-relaxed text-dim sm:text-lg">
            {profile.bio}
          </p>

          <div className="mt-8">
            <h3 className="label text-cyan">Awards &amp; Honors</h3>
            <ul className="mt-3 space-y-1.5">
              {awards.map((award) => (
                <li
                  key={award}
                  className="relative pl-4 text-sm leading-relaxed text-dim before:absolute before:left-0 before:top-[0.65em] before:size-1 before:bg-violet"
                >
                  {award}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <dl className="space-y-4">
          {facts.map((fact) => (
            <div key={fact.label} className="grid grid-cols-[7rem_1fr] gap-4">
              <dt className="label pt-0.5">{fact.label}</dt>
              <dd className="text-sm text-fg">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------- Work */

function Work() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const orientation = useSyncExternalStore(
    subscribeTablistOrientation,
    getTablistOrientation,
    () => "horizontal" as const
  );
  const panelId = "experience-focus-panel";
  const activeJob = experience[activeIndex];

  const focusTab = (index: number) => {
    tabRefs.current[index]?.focus();
  };

  const selectTab = (index: number, moveFocus = false) => {
    setActiveIndex(index);
    if (moveFocus) focusTab(index);
  };

  const handleTablistKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement | HTMLDivElement>
  ) => {
    const { key } = event;
    if (key === "Enter" || key === " ") return;

    let next = activeIndex;
    const last = experience.length - 1;

    if (orientation === "vertical") {
      if (key === "ArrowDown") next = activeIndex === last ? 0 : activeIndex + 1;
      else if (key === "ArrowUp") next = activeIndex === 0 ? last : activeIndex - 1;
      else if (key === "Home") next = 0;
      else if (key === "End") next = last;
      else return;
    } else {
      if (key === "ArrowRight") next = activeIndex === last ? 0 : activeIndex + 1;
      else if (key === "ArrowLeft") next = activeIndex === 0 ? last : activeIndex - 1;
      else if (key === "Home") next = 0;
      else if (key === "End") next = last;
      else return;
    }

    event.preventDefault();
    selectTab(next, true);
  };

  return (
    <Section id="work" title="Experience" className="scroll-mt-32">
      <div className="grid gap-6 lg:grid-cols-[12rem_1fr] lg:gap-10">
        <div
          role="tablist"
          aria-label="Experience roles"
          aria-orientation={orientation}
          className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
          onKeyDownCapture={handleTablistKeyDown}
        >
          {experience.map((job, index) => {
            const selected = index === activeIndex;
            return (
              <button
                key={job.company}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                type="button"
                role="tab"
                id={`experience-tab-${index}`}
                aria-selected={selected}
                aria-controls={panelId}
                tabIndex={selected ? 0 : -1}
                className="min-h-10 shrink-0 border border-line-soft px-3 py-2 text-left font-mono text-xs text-dim transition-colors duration-200 hover:border-magenta hover:text-fg aria-selected:border-magenta aria-selected:bg-magenta/10 aria-selected:text-fg lg:w-full"
                onClick={() => selectTab(index)}
              >
                <span className="block text-fg">{job.company}</span>
                <span className="mt-0.5 block text-[0.65rem] text-cyan">{job.role}</span>
                <span className="mt-0.5 block text-[0.65rem] text-faint">
                  {job.period}
                </span>
              </button>
            );
          })}
        </div>

        <div
          id={panelId}
          role="tabpanel"
          aria-labelledby={`experience-tab-${activeIndex}`}
        >
          <ExperiencePanel key={activeJob.company} job={activeJob} />
        </div>
      </div>
    </Section>
  );
}

function ExperiencePanel({ job }: { job: Experience }) {
  return (
    <article>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="display text-2xl text-fg sm:text-3xl">
          {job.href ? (
            <a
              href={job.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition-colors duration-200 hover:text-magenta"
            >
              {job.company}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          ) : (
            job.company
          )}
        </h3>
        <span className="label">{job.period}</span>
      </div>
      <p className="mt-2 font-mono text-sm text-cyan">{job.role}</p>
      <p className="mt-3 max-w-[62ch] text-base leading-relaxed text-dim">
        {job.summary}
      </p>
      <ul className="mt-4 max-w-[68ch] space-y-2">
        {job.highlights.map((point) => (
          <li
            key={point}
            className="relative pl-5 text-sm leading-relaxed text-dim before:absolute before:left-0 before:top-[0.6em] before:h-1 before:w-1 before:bg-violet"
          >
            {point}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap gap-2">
        {job.stack.map((tech) => (
          <span key={tech} className="chip">
            {tech}
          </span>
        ))}
      </div>
    </article>
  );
}

/* ------------------------------------------------------------ Projects */

function projectAnchorId(name: string): string {
  return `project-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
}

const CAROUSEL_ITEMS: CircularCarouselItem[] = carouselProjects.map(
  (project) => ({
    src: project.image!,
    alt: `${project.name} — ${project.summary}`,
    title: project.name,
    subtitle: `${project.status} · ${project.year}`,
    aspectRatio: project.imageAspect,
    href: project.status === "live" ? project.href : undefined,
  })
);

const SYNTHWAVE_LIST_PROJECTS: Project[] = [
  ...featuredProjects,
  ...moreProjects,
].filter((project) => !project.image);

function formatHostLabel(href: string): string {
  try {
    const url = new URL(href);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "Open link";
  }
}

function Projects() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedProject =
    selectedIndex !== null ? carouselProjects[selectedIndex] ?? null : null;

  useEffect(() => {
    if (selectedIndex === null) return;
    const total = carouselProjects.length;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setSelectedIndex(null);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setSelectedIndex((prev) => (prev === null ? 0 : (prev + 1) % total));
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        setSelectedIndex((prev) =>
          prev === null ? 0 : (prev - 1 + total) % total
        );
      } else if (
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === "PageUp" ||
        event.key === "PageDown" ||
        event.key === "Home" ||
        event.key === "End" ||
        event.key === " "
      ) {
        event.preventDefault();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, [selectedIndex]);

  const stepProject = (delta: number) => {
    const total = carouselProjects.length;
    setSelectedIndex((prev) =>
      prev === null ? 0 : (prev + delta + total) % total
    );
  };

  return (
    <Section id="projects" title="Featured Work">
      <div className="relative left-1/2 mb-14 h-[456px] w-[min(120%,calc(100vw-2rem))] -translate-x-1/2 sm:mb-16 sm:h-[528px]">
        <div
          className={`h-full w-full transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            selectedProject
              ? "pointer-events-none scale-[1.06] opacity-25"
              : "scale-100 opacity-100"
          }`}
        >
          <CircularCarousel
            items={CAROUSEL_ITEMS}
            preset="cylinder"
            intro="rise"
            cardWidth={336}
            aspectRatio={1.5}
            gap={29}
            autoplay="drift"
            speed={10}
            fadeColor="#07020f"
            cornerRadius={14}
            captions
            zoomedIndex={selectedIndex}
            onItemClick={(_, index) => setSelectedIndex(index)}
          />
        </div>
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {selectedProject && selectedIndex !== null && (
              <motion.div
                key="carousel-inspector-stage"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="fixed inset-0 z-[42] flex items-center justify-center bg-ink-900/55 p-4 backdrop-blur-md sm:p-6"
                onClick={(event) => {
                  if (event.target === event.currentTarget) {
                    setSelectedIndex(null);
                  }
                }}
              >
                <motion.article
                  key={selectedProject.name}
                  initial={{ opacity: 0, scale: 0.9, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 8 }}
                  transition={{
                    type: "spring",
                    stiffness: 340,
                    damping: 30,
                    mass: 0.85,
                  }}
                  role="dialog"
                  aria-modal="true"
                  aria-label={`${selectedProject.name} details`}
                  className="relative mx-auto max-h-[calc(100vh-2rem)] w-full max-w-5xl overflow-y-auto border border-line-soft bg-ink-900/92 p-5 shadow-[0_32px_90px_-20px_rgba(0,0,0,0.88)] backdrop-blur-xl sm:p-7"
                >
                  {/* Top bar: status / year / navigation / close X (no dividing line, no blue dot, no 01/08 counter) */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
                      <span className="text-cyan">{selectedProject.status}</span>
                      <span className="text-line-soft">·</span>
                      <span className="text-faint">{selectedProject.year}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => stepProject(-1)}
                        aria-label="Previous project"
                        className="inline-flex h-8 w-8 items-center justify-center border border-line-soft text-dim transition-colors duration-150 hover:border-cyan hover:text-fg"
                      >
                        <ChevronLeft size={15} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => stepProject(1)}
                        aria-label="Next project"
                        className="inline-flex h-8 w-8 items-center justify-center border border-line-soft text-dim transition-colors duration-150 hover:border-cyan hover:text-fg"
                      >
                        <ChevronRight size={15} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedIndex(null)}
                        aria-label="Close project inspector"
                        className="ml-2 inline-flex h-8 items-center gap-1.5 border border-line-soft px-2.5 font-mono text-xs text-dim transition-colors duration-150 hover:border-magenta hover:bg-magenta/10 hover:text-fg"
                      >
                        <span className="hidden text-[0.65rem] text-faint sm:inline">
                          ESC
                        </span>
                        <X size={15} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {/* Main split body: uncropped screenshot without outline on left, full specs on right */}
                  <div className="mt-4 grid items-start gap-6 lg:grid-cols-[1.02fr_1.28fr] lg:gap-8">
                    <div className="flex flex-col gap-3">
                      <div className="relative flex max-h-[380px] items-center justify-center overflow-hidden">
                        {selectedProject.image && (
                          <img
                            src={selectedProject.image}
                            alt={selectedProject.name}
                            className="max-h-[360px] w-auto max-w-full rounded-md object-contain"
                          />
                        )}
                      </div>

                      {(selectedProject.href || selectedProject.secondary) && (
                        <div className="flex flex-wrap items-center gap-2.5">
                          {selectedProject.href && (
                            <a
                              href={selectedProject.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-9 items-center gap-2 border border-magenta/55 bg-magenta/12 px-3.5 py-1.5 font-mono text-xs text-fg transition-colors duration-200 hover:border-magenta hover:bg-magenta/22"
                            >
                              <span>{formatHostLabel(selectedProject.href)}</span>
                              <ArrowUpRight size={13} aria-hidden="true" />
                            </a>
                          )}
                          {selectedProject.secondary && (
                            <a
                              href={selectedProject.secondary.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-9 items-center gap-1.5 border border-line-soft px-3 py-1.5 font-mono text-xs text-cyan transition-colors duration-200 hover:border-cyan hover:text-fg"
                            >
                              <span>{selectedProject.secondary.label}</span>
                              <ArrowUpRight size={13} aria-hidden="true" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <h3 className="display text-2xl text-fg sm:text-4xl">
                          {selectedProject.href ? (
                            <a
                              href={selectedProject.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 transition-colors duration-200 hover:text-magenta"
                            >
                              {selectedProject.name}
                              <ArrowUpRight size={18} aria-hidden="true" />
                            </a>
                          ) : (
                            selectedProject.name
                          )}
                        </h3>
                      </div>

                      <p className="mt-3 text-pretty text-sm leading-relaxed text-fg/90 sm:text-base">
                        {selectedProject.summary}
                      </p>

                      <div className="mt-5 border-t border-line-soft pt-4">
                        <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-cyan">
                          Technical Architecture &amp; Specs
                        </p>
                        <ul className="mt-3 space-y-2.5">
                          {selectedProject.details.map((detail) => (
                            <li
                              key={detail}
                              className="relative pl-4 text-xs leading-relaxed text-dim before:absolute before:left-0 before:top-[0.6em] before:size-1 before:bg-violet sm:text-sm"
                            >
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-5 border-t border-line-soft pt-4">
                        <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-faint">
                          Related Skills &amp; Stack
                        </p>
                        <ul className="mt-2.5 flex flex-wrap gap-2">
                          {selectedProject.stack.map((tech) => (
                            <li key={tech} className="chip">
                              {tech}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.article>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {SYNTHWAVE_LIST_PROJECTS.length > 0 && (
        <ol className="grid border-y border-line-soft md:grid-cols-2">
          {SYNTHWAVE_LIST_PROJECTS.map((project) => (
            <ProjectEntry key={project.name} project={project} heading="h3" />
          ))}
        </ol>
      )}
    </Section>
  );
}

function ProjectLinks({
  project,
}: {
  project: { secondary?: { label: string; href: string } };
}) {
  if (!project.secondary) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
      <a
        href={project.secondary.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-cyan transition-colors duration-200 hover:text-fg"
      >
        {project.secondary.label}
        <ArrowUpRight size={12} aria-hidden="true" />
      </a>
    </div>
  );
}

function ProjectEntry({
  project,
  heading: Heading,
}: {
  project: Project;
  heading: "h3" | "h4";
}) {
  return (
    <li
      id={projectAnchorId(project.name)}
      className="scroll-mt-28 border-line-soft py-6 [contain:layout_style] md:odd:border-r md:odd:pr-8 md:even:pl-8"
    >
      <article>
        <div className="flex items-start justify-between gap-5">
          <div>
            <Heading className="display text-xl text-fg">
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
            </Heading>
            <p className="mt-1.5 font-mono text-xs text-cyan">{project.status}</p>
          </div>
          <span className="font-mono text-xs text-faint">{project.year}</span>
        </div>
        <p className="mt-3 text-pretty text-sm leading-relaxed text-dim">
          {project.summary}
        </p>
        <ProjectLinks project={project} />
        <ul className="mt-4 flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <li key={tech} className="chip">
              {tech}
            </li>
          ))}
        </ul>
        <ProjectDetails details={project.details} />
      </article>
    </li>
  );
}

function ProjectDetails({ details }: { details: string[] }) {
  return (
    <details className="mt-4 group/details">
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
        <span>Technical details</span>
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

/* -------------------------------------------------------------- Skills */

function Skills() {
  return (
    <Section id="skills" title="Toolkit">
      <div className="grid gap-x-12 gap-y-8 sm:grid-cols-2">
        {skills.map((category) => (
          <div key={category.group}>
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
    </Section>
  );
}

/* ------------------------------------------------------------- Contact */

/**
 * Carries the backdrop attribution. It belongs to whichever scene is running,
 * but the hero is the wrong place to say so. This is the colophon.
 */
function Contact({ backdrop }: { backdrop: BackdropId }) {
  const credit = creditFor(backdrop);

  return (
    <Reveal>
      <footer id="contact" className="border-t border-line-soft pt-12">
        <h2 className="display max-w-[16ch] text-4xl text-fg sm:text-6xl">
          Let&apos;s build something.
        </h2>

        <a
          href={`mailto:${profile.email}`}
          className="mt-6 inline-flex min-h-12 items-center gap-3 font-mono text-lg text-cyan underline-offset-8 transition-colors duration-200 hover:text-fg hover:underline"
        >
          <Mail size={18} aria-hidden="true" />
          {profile.email}
        </a>

        <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-11 items-center gap-2 font-mono text-sm text-dim transition-colors duration-200 hover:text-fg"
              >
                {link.label}
                <ArrowUpRight
                  size={13}
                  aria-hidden="true"
                  className="text-faint transition-colors duration-200 group-hover:text-magenta"
                />
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-12 space-y-2 font-mono text-xs text-faint">
          <p>© {new Date().getFullYear()} David O. · Austin, TX</p>
          {credit && (
            <p>
              Backdrop:{" "}
              <a
                href={credit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 transition-colors duration-200 hover:text-dim"
              >
                {credit.title}
              </a>{" "}
              by {credit.author} · {credit.license}
            </p>
          )}
        </div>
      </footer>
    </Reveal>
  );
}

/* ------------------------------------------------------------ Primitives */

function Section({
  id,
  title,
  children,
  className = "scroll-mt-24",
}: {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Reveal>
      <section id={id} className={className}>
        <h2 className="display text-balance text-3xl text-fg sm:text-5xl">
          {title}
        </h2>
        <div className="rule mb-10 mt-5" />
        {children}
      </section>
    </Reveal>
  );
}

function Reveal({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  // Nothing the server renders may depend on the motion preference, which only
  // the client can read, not the element, and not its starting style either.
  // So the preference lands on the transition instead: same markup both ways,
  // and a zero duration means the reveal resolves instantly rather than moving.
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
      }
    >
      {children}
    </motion.div>
  );
}
