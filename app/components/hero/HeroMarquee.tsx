"use client";

import type { ReactNode } from "react";
import { heroStats, profile } from "../../content";
import { HeroActions, SocialRail, StatusTag } from "./Chrome";

/**
 * Attract screen: symmetric, with the name lit as a single run of tubing and
 * the supporting copy stacked beneath it on the centre line.
 */
export default function HeroMarquee({ switcher }: { switcher?: ReactNode }) {
  return (
    <section className="hero-marquee relative flex min-h-svh flex-col items-center px-6 pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] pt-24 text-center sm:px-10 sm:pb-24 sm:pt-32">
      {/* Centred copy lands on the brightest part of the artwork, where the
          scene's left-weighted scrim does nothing for it.

          Fixed rather than absolute. The hero is exactly one viewport tall, so
          at rest the two are the same box and the page looks identical either
          way. The difference is on the way down: an absolute scrim scrolls off
          with the hero and uncovers the sun behind it, brightening the frame by
          about a tenth before the content's own scrim has ramped in far enough
          to take over. Pinning it to the viewport keeps that dimming where the
          sun is, so the exposure holds steady. Below the fold it costs nothing,
          since the content paints over it. */}
      <div
        aria-hidden="true"
        className="copy-scrim pointer-events-none fixed inset-0"
      />

      <div className="relative mx-auto w-full max-w-4xl">
        <StatusTag />

        <h1 className="font-marquee type-tube mt-5 text-[clamp(2.4rem,9vw,6.5rem)] sm:mt-9">
          David O.
        </h1>

        <div
          aria-hidden="true"
          className="mx-auto mt-4 h-px w-40 bg-gradient-to-r from-transparent via-magenta to-transparent sm:mt-8"
        />

        <p className="label mt-4 text-cyan sm:mt-8">{profile.location}</p>

        <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-dim sm:mt-5 sm:text-lg">
          {profile.tagline}
        </p>

        <dl className="mx-auto mt-6 max-w-sm sm:mt-11">
          {heroStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-marquee text-2xl text-magenta sm:text-4xl">
                {stat.value}
              </dd>
              <p className="label mt-2 leading-snug text-dim sm:mt-3">{stat.label}</p>
            </div>
          ))}
        </dl>

        <HeroActions className="mt-6 justify-center sm:mt-11" />
        <SocialRail className="mt-5 justify-center sm:mt-10 lg:hidden" />
      </div>

      {/* Pinned to the foot of the hero rather than placed after the copy: in
          flow it would sit halfway up a tall screen, since the copy above it is
          vertically centred. */}
      {switcher && (
        <div className="pointer-events-none absolute inset-x-0 bottom-[calc(0.875rem+env(safe-area-inset-bottom,0px))] flex justify-center px-6 sm:bottom-7">
          {switcher}
        </div>
      )}
    </section>
  );
}
