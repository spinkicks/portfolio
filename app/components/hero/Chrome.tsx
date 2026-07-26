"use client";

import { Github, Linkedin, Mail } from "lucide-react";
import { heroStats, navLinks, profile, status } from "../../content";

/**
 * Page furniture shared by the hero prototypes: grain, the poster frame, the
 * social rail and the section nav. Kept apart from the hero bodies so the
 * three variants differ only in typography and composition.
 */

export function Grain() {
  return <div aria-hidden="true" className="grain" />;
}

/**
 * Line structure over the whole page, not just the artwork.
 *
 * The backdrop gets its tube treatment in the shader, but that stops at the
 * canvas. Without this the copy on top would read as sitting in front of a
 * screen rather than on one. Kept far lighter than the shader's own lines,
 * since text is much less forgiving of them than a photograph is.
 */
export function Scanlines() {
  return <div aria-hidden="true" className="scanlines" />;
}

/** The bright band crawling down the tube. Pairs with Scanlines. */
export function CrtRoll() {
  return <div aria-hidden="true" className="crt-roll" />;
}

export function FrameEdge() {
  return <div aria-hidden="true" className="frame-edge" />;
}

const socials = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/calmguy/", Icon: Linkedin },
  { label: "Email", href: `mailto:${profile.email}`, Icon: Mail },
  { label: "GitHub", href: "https://github.com/spinkicks", Icon: Github },
];

/**
 * Vertical on desktop where there's dead margin to use, horizontal and inline
 * on phones where a floating rail would sit on top of the copy.
 */
export function SocialRail({ className = "" }: { className?: string }) {
  return (
    <ul
      className={`flex items-center gap-3 lg:fixed lg:left-7 lg:top-1/2 lg:z-40 lg:-translate-y-1/2 lg:flex-col ${className}`}
    >
      {socials.map(({ label, href, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noreferrer" : undefined}
            aria-label={label}
            className="grid size-11 place-items-center rounded-full border border-line-soft bg-ink-800/70 text-dim backdrop-blur transition-colors duration-200 hover:border-magenta hover:text-fg"
          >
            <Icon size={17} aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function SectionNav() {
  return (
    <nav aria-label="Sections" className="hidden items-center gap-1 md:flex">
      {navLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="px-3 py-2 font-mono text-xs tracking-wide text-dim transition-colors duration-200 hover:text-fg"
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}

/**
 * Availability, set as a lit window sign rather than a status LED. Reads as
 * part of the neon rather than as instrumentation bolted onto it, and the
 * two weights let the state and the detail carry different emphasis.
 */
export function StatusTag({ className = "" }: { className?: string }) {
  if (!status.open) return null;

  return (
    <p className={`inline-flex items-center gap-3 font-mono text-xs ${className}`}>
      <span className="sr-only">{status.label}</span>
      <span
        aria-hidden="true"
        className="border border-cyan/55 px-2.5 py-1 uppercase tracking-[0.24em] text-cyan [text-shadow:0_0_0.8em_currentColor]"
      >
        {status.tag}
      </span>
      <span aria-hidden="true" className="tracking-wide text-dim">
        {status.detail}
      </span>
    </p>
  );
}

/**
 * The same four facts as one rule-separated run, for layouts where a four
 * column grid would compete with the sign for attention.
 */
export function StatLine({ className = "" }: { className?: string }) {
  return (
    <ul
      className={`flex flex-wrap items-center gap-x-4 gap-y-3 font-mono text-sm ${className}`}
    >
      {heroStats.map((stat, i) => (
        <li key={stat.label} className="flex items-center gap-4">
          {i > 0 && (
            <span aria-hidden="true" className="h-3.5 w-px bg-line-soft" />
          )}
          <span>
            <span className="text-magenta">{stat.value}</span>{" "}
            <span className="text-dim">{stat.label}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function HeroActions({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      <a
        href="#work"
        className="inline-flex min-h-12 items-center rounded-full border border-magenta bg-magenta/15 px-8 font-mono text-sm text-fg transition-colors duration-200 hover:bg-magenta/30"
      >
        View work
      </a>
      <a
        href={`mailto:${profile.email}`}
        className="inline-flex min-h-12 items-center gap-2 rounded-full border border-line-soft px-6 font-mono text-sm text-dim transition-colors duration-200 hover:border-cyan hover:text-fg"
      >
        <Mail size={15} aria-hidden="true" />
        Get in touch
      </a>
    </div>
  );
}
