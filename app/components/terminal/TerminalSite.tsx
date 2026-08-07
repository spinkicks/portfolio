"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Console from "./Console";
import { SECTIONS, type Ctx } from "./commands";
import ShaderScene from "../scenes/ShaderScene";
import { MATRIX_RAIN } from "../scenes/shadertoy/specs";
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

/**
 * The terminal layout.
 *
 * A window rather than a document: the shell is exactly one viewport tall and
 * the reading pane scrolls inside it, so the prompt and the status line stay
 * where a terminal puts them instead of chasing the page. Content comes from
 * app/content.ts, the same module the synthwave layout reads, because the two
 * used to carry separate copies and had already drifted apart on dates, on the
 * project list and on the email address.
 *
 * No film grain and no scanlines here, unlike the other layout. Both are
 * texture bought at the cost of edge definition, and at this type size, in a
 * monospace face, on a page that is almost entirely small text, the edges are
 * worth more. The rain behind it supplies the atmosphere instead.
 */
export default function TerminalSite({ onSwitch }: { onSwitch: () => void }) {
  const paneRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(SECTIONS[0].id);

  const goto = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    setCurrent(id);
  }, []);

  // Marks whichever section owns the top of the pane, for the rail and the
  // status line. Observed against the pane, not the viewport, since the pane
  // is the thing that scrolls.
  useEffect(() => {
    const root = paneRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (records) => {
        const visible = records
          .filter((r) => r.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setCurrent(visible.target.id);
      },
      { root, rootMargin: "0px 0px -70% 0px", threshold: 0 }
    );

    for (const section of SECTIONS) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  const ctx: Ctx = useMemo(
    () => ({
      goto,
      clear: () => {},
      toSynthwave: onSwitch,
      open: (url) => window.open(url, "_blank", "noopener,noreferrer"),
    }),
    [goto, onSwitch]
  );

  return (
    <div className="tty relative flex h-dvh flex-col overflow-hidden bg-ink text-fg">
      <a
        href="#about"
        onClick={(e) => {
          e.preventDefault();
          goto("about");
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:border focus:border-lime focus:bg-ink-800 focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>

      <RainBackdrop />

      {/* An absolutely positioned backdrop paints above static siblings, so
          everything over it has to be positioned too. */}
      <div className="relative z-10 flex min-h-0 flex-1">
        <Rail current={current} goto={goto} />

        <div ref={paneRef} className="min-w-0 flex-1 overflow-y-auto">
          {/* Top padding clears the switch pinned above. At wide viewports that
              control sits out in the right-hand gutter and would clear anyway,
              but the gutter closes up around 1024px and the two would collide. */}
          <div className="mx-auto max-w-3xl px-5 pb-8 pt-16 sm:px-8 sm:pb-12 sm:pt-20">
            <Masthead />
            <About />
            <Work />
            <Projects />
            <Skills />
            <Contact />
          </div>
        </div>
      </div>

      {/* Pinned to the shell rather than placed in the pane, so it holds its
          corner instead of scrolling away, matching where the synthwave layout
          keeps the same control. Square and hairline rather than a pill: the
          position is what carries the consistency, the styling still belongs to
          whichever layout it is in. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-end p-4 sm:p-7">
        <button
          type="button"
          onClick={onSwitch}
          className="pointer-events-auto inline-flex min-h-9 items-center border border-line-soft bg-ink-900/70 px-3.5 text-xs text-dim backdrop-blur transition-colors duration-150 hover:border-lime/50 hover:text-lime"
        >
          Synthwave layout
        </button>
      </div>

      <div className="relative z-10">
        <Console ctx={ctx} />
        <StatusLine current={current} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- Backdrop */

/**
 * Digital rain, turned most of the way down.
 *
 * The shader is mostly black with sparse bright strips, so what survives the
 * scrim is a slow drift of green in the empty parts of the page rather than
 * anything the eye has to fight. Two levers keep it cheap: a fifth of the
 * march depth, and a backing store at half linear resolution, which is a
 * quarter of the pixels. Softness from the upscale is no loss on something
 * this dim.
 */
function RainBackdrop() {
  return (
    <ShaderScene
      spec={MATRIX_RAIN}
      base="var(--ink-900)"
      scale={0.5}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      overlay={
        <>
          {/* Most of the dimming. Small monospace text has little stroke
              weight to spare, and the shader is not uniformly dim: the camera
              periodically passes close to a column and the glyphs jump several
              times their average brightness. This is set for that peak, not
              for the average. */}
          <div className="absolute inset-0 bg-ink/88" />
          {/* Corner falloff, so the brightest strips do not collect at the
              edges where the rail and the status line sit. */}
          <div className="absolute inset-0 bg-[radial-gradient(115%_85%_at_50%_45%,transparent_0%,rgba(5,7,10,0.45)_70%,rgba(5,7,10,0.8)_100%)]" />
        </>
      }
    />
  );
}

/* ------------------------------------------------------------------ Rail */

function Rail({
  current,
  goto,
}: {
  current: string;
  goto: (id: string) => void;
}) {
  return (
    <nav
      aria-label="Sections"
      // Backed rather than transparent: the rail is dense small text, and it
      // sits where the rain is brightest before the corner falloff takes hold.
      className="hidden w-64 shrink-0 flex-col justify-between overflow-y-auto border-r border-line-soft bg-ink-900/60 px-6 py-8 lg:flex"
    >
      <div>
        <p className="text-base text-fg">{profile.name}</p>
        <p className="mt-1 text-xs text-dim">{profile.role}</p>
        <p className="text-xs text-faint">{profile.location}</p>

        {status.open && (
          <p className="mt-5 flex items-baseline gap-2 text-xs">
            <span className="border border-lime/50 px-1.5 py-0.5 uppercase tracking-[0.18em] text-lime">
              {status.tag}
            </span>
            <span className="text-faint">{status.detail}</span>
          </p>
        )}

        <ul className="mt-9 space-y-1">
          {SECTIONS.map((section, i) => {
            const active = section.id === current;
            return (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => goto(section.id)}
                  aria-current={active ? "true" : undefined}
                  className={`flex w-full items-baseline gap-3 py-1 text-sm transition-colors duration-150 ${
                    active ? "text-lime" : "text-dim hover:text-fg"
                  }`}
                >
                  <span className="text-xs text-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {section.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-10">
        <ul className="space-y-1.5">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-baseline gap-1.5 text-xs text-dim transition-colors duration-150 hover:text-fg"
              >
                {link.label}
                <ArrowUpRight
                  size={11}
                  aria-hidden="true"
                  className="shrink-0 translate-y-0.5 text-faint transition-colors duration-150 group-hover:text-lime"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

/* -------------------------------------------------------------- Masthead */

function Masthead() {
  return (
    <header className="mb-14">
      {/* Doubles as the first worked example of the prompt below. */}
      <p className="text-xs text-faint">
        <span className="text-lime">visitor@spinkicks:~$</span> whoami
      </p>

      <h1 className="mt-4 text-2xl text-fg sm:text-3xl">{profile.name}</h1>
      <p className="mt-1.5 text-sm text-dim">
        {profile.role} · {profile.location}
      </p>
      <p className="mt-5 max-w-[62ch] text-sm leading-relaxed text-dim">
        {profile.tagline}
      </p>

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

      {/* Only below lg, where the rail that normally carries this is hidden. */}
      <div className="mt-6 lg:hidden">
        <a
          href={`mailto:${profile.email}`}
          className="inline-block border border-line-soft px-3 py-1.5 text-xs text-lime"
        >
          {profile.email}
        </a>
      </div>
    </header>
  );
}

/* --------------------------------------------------------------- Section */

function Section({
  id,
  index,
  title,
  children,
}: {
  id: string;
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-14 scroll-mt-6">
      <h2 className="mb-6 flex items-center gap-3 text-sm">
        <span className="text-faint">{String(index).padStart(2, "0")}</span>
        <span className="text-lime">{title}</span>
        <span className="tty-rule" aria-hidden="true" />
      </h2>
      {children}
    </section>
  );
}

/* ----------------------------------------------------------------- About */

function About() {
  return (
    <Section id="about" index={1} title="about">
      <p className="max-w-[68ch] text-sm leading-relaxed text-dim">{profile.bio}</p>

      <dl className="mt-7 space-y-2 text-sm">
        {facts.map((fact) => (
          <div key={fact.label} className="leader">
            <dt className="shrink-0 text-faint">{fact.label.toLowerCase()}</dt>
            <span className="leader-fill" aria-hidden="true" />
            <dd className="shrink-0 text-right text-fg">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

/* ------------------------------------------------------------------ Work */

function Work() {
  return (
    <Section id="work" index={2} title="work">
      <ol className="space-y-9">
        {experience.map((job) => (
          <li key={job.company} className="border-l border-line-soft pl-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="text-sm text-fg">{job.company}</h3>
              <span className="text-xs text-faint">{job.period}</span>
            </div>
            <p className="mt-1 text-xs text-lime">{job.role}</p>

            <p className="mt-3 max-w-[66ch] text-sm leading-relaxed text-dim">
              {job.summary}
            </p>

            <ul className="mt-3 space-y-1.5">
              {job.highlights.map((point) => (
                <li
                  key={point}
                  className="flex max-w-[66ch] gap-2.5 text-sm leading-relaxed text-dim"
                >
                  <span aria-hidden="true" className="shrink-0 text-faint">
                    -
                  </span>
                  {point}
                </li>
              ))}
            </ul>

            <ul className="mt-4 flex flex-wrap gap-1.5">
              {job.stack.map((tech) => (
                <li key={tech} className="tty-chip">
                  {tech}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* -------------------------------------------------------------- Projects */

function Projects() {
  return (
    <Section id="projects" index={3} title="projects">
      <ol className="space-y-7">
        {projects.map((project) => (
          <li key={project.name} className="flex gap-4 sm:gap-6">
            {/* Fixed gutter of tabular years: the column edge is what makes a
                list of unrelated things scan as one set. */}
            <span className="w-[4ch] shrink-0 pt-0.5 text-xs text-faint">
              {project.year}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-sm text-fg">{project.name}</h3>
                {project.href && (
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-baseline gap-1 text-xs text-lime underline-offset-4 hover:underline"
                  >
                    open
                    <ArrowUpRight size={11} aria-hidden="true" className="translate-y-0.5" />
                  </a>
                )}
                {project.secondary && (
                  <a
                    href={project.secondary.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-dim underline-offset-4 hover:text-fg hover:underline"
                  >
                    {project.secondary.label.toLowerCase()}
                  </a>
                )}
              </div>

              <p className="mt-2 max-w-[64ch] text-sm leading-relaxed text-dim">
                {project.blurb}
              </p>

              <ul className="mt-3 flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                  <li key={tech} className="tty-chip">
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* ---------------------------------------------------------------- Skills */

function Skills() {
  return (
    <Section id="skills" index={4} title="skills">
      <dl className="space-y-5">
        {skills.map((group) => (
          <div key={group.group}>
            <dt className="text-xs text-faint">{group.group.toLowerCase()}</dt>
            <dd className="mt-2">
              <ul className="flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <li key={item} className="tty-chip">
                    {item}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

/* --------------------------------------------------------------- Contact */

function Contact() {
  return (
    <Section id="contact" index={5} title="contact">
      <a
        href={`mailto:${profile.email}`}
        className="text-base text-lime underline-offset-4 hover:underline"
      >
        {profile.email}
      </a>

      <ul className="mt-6 space-y-2 text-sm">
        {links.map((link) => (
          <li key={link.label} className="leader">
            <span className="shrink-0 text-faint">{link.label.toLowerCase()}</span>
            <span className="leader-fill" aria-hidden="true" />
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-dim underline-offset-4 transition-colors duration-150 hover:text-fg hover:underline"
            >
              {link.note ? `${link.note}` : "open"}
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-12 text-xs text-faint">
        © {new Date().getFullYear()} David O. · Austin, TX
      </p>
    </Section>
  );
}

/* ------------------------------------------------------------ Statusline */

function StatusLine({ current }: { current: string }) {
  const index = SECTIONS.findIndex((s) => s.id === current);

  return (
    <div className="flex items-center justify-between gap-4 border-t border-line-soft bg-ink-800/80 px-4 py-1 text-[0.68rem] text-faint sm:px-6">
      <span className="truncate">
        <span className="text-dim">~/</span>
        {current}
      </span>
      <span className="hidden sm:inline">
        {String(index + 1).padStart(2, "0")} of {String(SECTIONS.length).padStart(2, "0")}
      </span>
      <span className="truncate text-right">tab completes · up recalls · ctrl+l clears</span>
    </div>
  );
}
