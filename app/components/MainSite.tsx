"use client";

import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Mail, Terminal } from "lucide-react";
import ArtScene from "./scenes/ArtScene";
import { FrameEdge, Grain, Scanlines, SectionNav, SocialRail } from "./hero/Chrome";
import HeroMarquee from "./hero/HeroMarquee";
import TypingTest from "./TypingTest";
import { experience, facts, links, profile, projects, skills } from "../content";

export default function MainSite({ onSwitch }: { onSwitch: () => void }) {
  return (
    <div className="relative min-h-screen bg-ink text-fg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:border focus:border-cyan focus:bg-ink-800 focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>

      <ArtScene />

      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-end gap-2 p-4 sm:p-7">
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

      <SocialRail className="hidden lg:flex" />

      <main id="main" className="relative z-20">
        <HeroMarquee />

        <div className="mx-auto w-full max-w-5xl space-y-24 px-6 pb-24 pt-24 sm:space-y-32 sm:pb-32">
          <About />
          <Work />
          <Projects />
          <Skills />

          <Reveal>
            <TypingTest />
          </Reveal>

          <Contact />
        </div>
      </main>

      <FrameEdge />
      <Scanlines />
      <Grain />
    </div>
  );
}

/* --------------------------------------------------------------- About */

function About() {
  return (
    <Section id="about" index="01" title="About">
      <div className="grid gap-12 md:grid-cols-[1.35fr_1fr]">
        <p className="max-w-[60ch] text-base leading-relaxed text-dim sm:text-lg">
          {profile.bio}
        </p>

        <dl className="divide-y divide-line-soft border-t border-line-soft">
          {facts.map((fact) => (
            <div key={fact.label} className="grid grid-cols-[7rem_1fr] gap-4 py-3">
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
  return (
    <Section id="work" index="02" title="Experience">
      <ol className="space-y-px">
        {experience.map((job, i) => (
          <li
            key={job.company}
            className="group relative border-l border-line-soft py-8 pl-6 transition-colors duration-300 hover:border-magenta sm:pl-10"
          >
            <span
              aria-hidden="true"
              className="absolute -left-px top-8 h-2 w-2 -translate-x-1/2 rounded-full bg-violet transition-colors duration-300 group-hover:bg-magenta"
            />

            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <h3 className="display text-2xl text-fg sm:text-3xl">
                {job.company}
              </h3>
              <span className="label">{job.period}</span>
            </div>

            <p className="mt-2 font-mono text-sm text-cyan">{job.role}</p>
            <p className="mt-4 max-w-[62ch] text-base text-dim">{job.summary}</p>

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

            <span className="label absolute -left-16 top-8 hidden lg:block">
              {String(i + 1).padStart(2, "0")}
            </span>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* ------------------------------------------------------------ Projects */

function Projects() {
  const [feature, ...rest] = projects;

  return (
    <Section id="projects" index="03" title="Selected Work">
      <div className="grid gap-px bg-line-soft md:grid-cols-2">
        <ProjectCard project={feature} featured />
        {rest.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </div>
    </Section>
  );
}

function ProjectCard({
  project,
  featured = false,
}: {
  project: (typeof projects)[number];
  featured?: boolean;
}) {
  return (
    <article
      className={`group relative flex flex-col bg-ink-800/60 p-6 backdrop-blur transition-colors duration-300 hover:bg-ink-700/70 sm:p-8 ${
        featured ? "md:col-span-2" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <h3
          className={`display text-fg transition-colors duration-200 group-hover:text-magenta ${
            featured ? "text-3xl sm:text-4xl" : "text-2xl"
          }`}
        >
          {project.href ? (
            <a
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              // Stretched link: the whole card is the hit target, but only
              // this anchor lands in the tab order.
              className="after:absolute after:inset-0 after:content-['']"
            >
              {project.name}
            </a>
          ) : (
            project.name
          )}
        </h3>

        {project.href ? (
          <ArrowUpRight
            size={20}
            aria-hidden="true"
            className="shrink-0 text-faint transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-magenta"
          />
        ) : (
          <span className="label shrink-0">{project.year}</span>
        )}
      </div>

      <p
        className={`mt-3 text-dim ${
          featured ? "max-w-[58ch] text-base sm:text-lg" : "text-sm"
        }`}
      >
        {project.blurb}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2 pt-2">
        {project.stack.map((tech) => (
          <span key={tech} className="chip">
            {tech}
          </span>
        ))}
      </div>

      {project.secondary && (
        <a
          href={project.secondary.href}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 mt-4 inline-flex w-fit items-center gap-1 font-mono text-xs text-cyan underline-offset-4 hover:underline"
        >
          {project.secondary.label}
          <ArrowUpRight size={12} aria-hidden="true" />
        </a>
      )}
    </article>
  );
}

/* -------------------------------------------------------------- Skills */

function Skills() {
  return (
    <Section id="skills" index="04" title="Toolkit">
      <div className="grid gap-10 sm:grid-cols-3">
        {skills.map((category) => (
          <div key={category.group}>
            <h3 className="label text-cyan">{category.group}</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {category.items.map((item) => (
                <li
                  key={item}
                  className="border border-line-soft px-2.5 py-1 font-mono text-xs text-dim"
                >
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

function Contact() {
  return (
    <Reveal>
      <footer id="contact" className="border-t border-line-soft pt-12">
        <p className="label text-magenta">Contact</p>

        <h2 className="display mt-4 max-w-[16ch] text-4xl text-fg sm:text-6xl">
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
                {link.note && (
                  <span className="text-xs text-faint">({link.note})</span>
                )}
                <ArrowUpRight
                  size={13}
                  aria-hidden="true"
                  className="text-faint transition-colors duration-200 group-hover:text-magenta"
                />
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-12 font-mono text-xs text-faint">
          © {new Date().getFullYear()} David O. — Austin, TX
        </p>
      </footer>
    </Reveal>
  );
}

/* ------------------------------------------------------------ Primitives */

function Section({
  id,
  index,
  title,
  children,
}: {
  id: string;
  index: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <Reveal>
      <section id={id} className="scroll-mt-24">
        <div className="flex items-baseline gap-5">
          <span className="label text-magenta">{index}</span>
          <h2 className="display text-3xl text-fg sm:text-5xl">{title}</h2>
        </div>
        <div className="rule mt-5 mb-10" />
        {children}
      </section>
    </Reveal>
  );
}

function Reveal({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
