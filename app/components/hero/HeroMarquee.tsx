"use client";

import { heroStats, profile } from "../../content";
import { HeroActions, SocialRail, StatusTag } from "./Chrome";

/**
 * Attract screen: symmetric, with the name lit as a single run of tubing and
 * the supporting copy stacked beneath it on the centre line.
 */
export default function HeroMarquee() {
  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center px-6 pb-24 pt-32 text-center sm:px-10">
      {/* Centred copy lands on the brightest part of the artwork, where the
          scene's left-weighted scrim does nothing for it. */}
      <div aria-hidden="true" className="copy-scrim absolute inset-0" />

      <div className="relative mx-auto w-full max-w-4xl">
        <StatusTag />

        <h1 className="font-marquee type-tube mt-9 text-[clamp(2.4rem,9vw,6.5rem)]">
          David O.
        </h1>

        <div
          aria-hidden="true"
          className="mx-auto mt-8 h-px w-40 bg-gradient-to-r from-transparent via-magenta to-transparent"
        />

        <p className="label mt-8 text-cyan">
          {profile.role} — {profile.location}
        </p>

        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-dim">
          {profile.tagline}
        </p>

        <dl className="mx-auto mt-11 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4">
          {heroStats.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-marquee text-2xl text-magenta">
                {stat.value}
              </dd>
              {/* Brighter than the usual .label tone: these sit further out
                  than the scrim's strong core. */}
              <p className="label mt-2.5 leading-snug text-dim">{stat.label}</p>
            </div>
          ))}
        </dl>

        <HeroActions className="mt-11 justify-center" />
        <SocialRail className="mt-10 justify-center lg:hidden" />
      </div>
    </section>
  );
}
