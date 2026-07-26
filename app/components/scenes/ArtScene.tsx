"use client";

import Image from "next/image";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { useSceneScroll } from "./useSceneScroll";

/**
 * Parallax backdrop, cut from a single piece of 4K artwork.
 *
 * tools/split-layers.py splits the source into three plates using a Depth
 * Anything V2 depth map. The plates are nested rather than disjoint: every one
 * runs to the bottom of the frame, so a faster foreground uncovers more of the
 * range behind it instead of tearing a hole in the scene. At rest they compose
 * back into the original image pixel for pixel; the depth only appears once
 * they start travelling at different rates.
 */

/** Sampled from the source: sky is its top edge, floor its bottom. */
const SKY = "#4a0643";
const FLOOR = "#9a66d8";

export default function ArtScene() {
  const { reduceMotion, scrollY, vh } = useSceneScroll();

  // Reduced motion flattens the output ranges rather than dropping the style
  // props. Removing them would make the rendered markup depend on a preference
  // the server can't see, which tears on hydration; collapsing the ranges
  // leaves identical markup at scroll zero and simply never moves.
  const lift = reduceMotion ? 0 : 1;

  // Near terrain travels furthest, the sky barely moves. That ratio is the
  // whole illusion.
  //
  // The travel is deliberately short. Lifting the ranges far enough to clear
  // the sun turns the parallax into a lighting change: the frame gets
  // brighter as the sun is uncovered, then darker again once it passes, and
  // that swing reads as a flash rather than as depth. These amounts move the
  // ranges against each other without materially changing how much sun is in
  // frame.
  const skyY = useTransform(scrollY, [0, vh * 1.4], ["0%", `${-1.2 * lift}%`]);
  const farY = useTransform(scrollY, [0, vh * 1.4], ["0%", `${-6 * lift}%`]);
  const nearY = useTransform(scrollY, [0, vh * 1.4], ["0%", `${-13.2 * lift}%`]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ background: SKY }}
    >
      {/* No scroll-linked opacity. Dimming the backdrop on the way down is the
          other half of the flash: it fights the parallax early, then overtakes
          it. The scrims below are fixed, so the lighting is the same wherever
          the page is. */}
      <div className="absolute inset-0">
        <Plate part="sky" y={skyY} priority />
        <Plate part="far" y={farY} priority />
        <Plate part="near" y={nearY} />
      </div>

      {/* Darken the base of the frame so a lifted plate never shows its edge */}
      <div className="absolute inset-x-0 bottom-0 h-[22vh] bg-gradient-to-t from-ink via-ink/70 to-transparent" />

      {/* Directional scrim: the copy column gets contrast, the right-hand side
          keeps the artwork at full strength. */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/72 to-transparent sm:to-40% lg:via-ink/55 lg:to-65%" />

      {/* Gentle overall settle so nothing in the art out-shouts the headline */}
      <div className="absolute inset-0 bg-ink/25" />
      <div className="absolute inset-0 bg-[radial-gradient(115%_85%_at_50%_40%,transparent_0%,rgba(4,2,12,0.22)_66%,rgba(4,2,12,0.66)_100%)]" />
    </div>
  );
}

function Plate({
  part,
  y,
  priority = false,
}: {
  part: "sky" | "far" | "near";
  y: MotionValue<string>;
  priority?: boolean;
}) {
  return (
    <motion.div className="absolute inset-0" style={{ y }}>
      <Image
        src={`/scenes/wireframe-${part}.webp`}
        alt=""
        fill
        priority={priority}
        sizes="100vw"
        // The plates are already WebP tuned for this use. Next's default of 75
        // re-encodes them a second time and the loss shows badly here, where
        // the whole image is fine gradient linework.
        quality={90}
        className="object-cover object-bottom"
      />
      {/* Runs on below the plate so travelling upward reveals scene, not void */}
      <div
        className="absolute inset-x-0 top-full h-[40vh]"
        style={{ background: FLOOR }}
      />
    </motion.div>
  );
}
