"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import Image from "next/image";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { SceneRenderer, type Layer } from "./SceneRenderer";
import { useSceneScroll } from "./useSceneScroll";

/**
 * Parallax backdrop, cut from a single piece of 4K artwork.
 *
 * tools/split-layers.py splits the source into three plates using a Depth
 * Anything V2 depth map. The plates are nested rather than disjoint — every one
 * runs to the bottom of the frame — so a faster foreground uncovers more of the
 * range behind it instead of tearing a hole in the scene. At rest they compose
 * back into the original image pixel for pixel; the depth only appears once
 * they start travelling at different rates.
 *
 * The plates render twice over. next/image puts them in the DOM, which picks
 * the right resolution, gets them on screen early and is what you see if WebGL
 * is unavailable or the context is lost. Once all three have decoded they are
 * handed to the renderer as textures, the DOM copies fade out and the canvas
 * takes over — same framing, but now the air moves and the whole thing is
 * coming to you through a tube.
 */

/** Sampled from the source: sky is its top edge, floor its bottom. */
const SKY = "#4a0643";
const FLOOR = "#9a66d8";

const SCENE = {
  plateAspect: 3840 / 2160,
  /** Ridge line in plate coordinates, where the heat haze is centred. */
  horizonV: 0.54,
  floor: [0x9a / 255, 0x66 / 255, 0xd8 / 255] as [number, number, number],
  base: [0x4a / 255, 0x06 / 255, 0x43 / 255] as [number, number, number],
};

/** Lift at full scroll, as a fraction of canvas height. Near travels furthest;
 *  the sky barely moves. That ratio is the whole illusion. */
const LIFT: Record<Layer, number> = { sky: 0.03, far: 0.13, near: 0.3 };

/** Scroll distance, in viewports, over which the plates finish lifting. */
const TRAVEL = 1.4;

/** Matches the top of next/image's device ladder in next.config.ts. */
const MAX_BUFFER_WIDTH = 2560;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/**
 * Holds through the hero while the ranges lift, then clears out for body copy.
 * Mirrors the keyframes the DOM copy animates on so the handover is invisible.
 */
function fadeAt(scroll: number, vh: number) {
  if (scroll <= 0) return 1;
  if (scroll < vh * 0.4) return 1 - 0.5 * (scroll / (vh * 0.4));
  if (scroll < vh * 0.9) {
    return 0.5 - 0.44 * ((scroll - vh * 0.4) / (vh * 0.5));
  }
  return 0.06;
}

export default function ArtScene() {
  const { reduceMotion, scrollY, vh } = useSceneScroll();

  const skyY = useTransform(scrollY, [0, vh * TRAVEL], ["0%", "-3%"]);
  const farY = useTransform(scrollY, [0, vh * TRAVEL], ["0%", "-13%"]);
  const nearY = useTransform(scrollY, [0, vh * TRAVEL], ["0%", "-30%"]);
  const fade = useTransform(scrollY, [0, vh * 0.4, vh * 0.9], [1, 0.5, 0.06]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const skyRef = useRef<HTMLImageElement>(null);
  const farRef = useRef<HTMLImageElement>(null);
  const nearRef = useRef<HTMLImageElement>(null);

  const [onCanvas, setOnCanvas] = useState(false);

  // Read inside the frame loop rather than closed over, so a viewport or
  // preference change doesn't mean tearing down the GL context.
  const live = useRef({ vh, animate: !reduceMotion });
  const invalidate = useRef<() => void>(() => {});

  // Declared above the renderer effect so the first frame already sees the
  // real viewport height rather than the initial guess.
  useEffect(() => {
    live.current = { vh, animate: !reduceMotion };
    invalidate.current();
  }, [vh, reduceMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = SceneRenderer.create(canvas);
    if (!renderer) return;

    const sources: [Layer, RefObject<HTMLImageElement | null>][] = [
      ["sky", skyRef],
      ["far", farRef],
      ["near", nearRef],
    ];

    const uploaded = new Map<Layer, string>();
    const started = performance.now();

    let frame = 0;
    let running = true;
    let handedOver = false;
    let needsResize = true;
    let dirty = true;
    let lastLift = -1;
    let lastFade = -1;

    const redraw = () => {
      dirty = true;
    };
    const remeasure = () => {
      needsResize = true;
      dirty = true;
    };
    invalidate.current = redraw;

    /**
     * next/image swaps `currentSrc` when the viewport crosses a breakpoint, so
     * the texture a plate was uploaded from is tracked by URL rather than by a
     * one-shot loaded flag.
     */
    const syncTextures = () => {
      for (const [layer, ref] of sources) {
        const img = ref.current;
        if (!img?.complete || img.naturalWidth === 0) continue;

        const src = img.currentSrc || img.src;
        if (uploaded.get(layer) === src) continue;

        renderer.upload(layer, img);
        uploaded.set(layer, src);
        dirty = true;
      }
      return renderer.isReady;
    };

    const applySize = () => {
      const cssWidth = canvas.clientWidth;
      const cssHeight = canvas.clientHeight;
      if (cssWidth === 0 || cssHeight === 0) return;

      // next/image's ladder tops out at 2560, so a buffer wider than that is
      // resolving detail the textures don't carry — it costs fill rate and
      // returns nothing. DPR 2 is the ceiling for the same reason.
      const dpr = Math.min(
        window.devicePixelRatio || 1,
        2,
        MAX_BUFFER_WIDTH / cssWidth
      );
      const width = Math.round(cssWidth * dpr);
      const height = Math.round(cssHeight * dpr);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      // Two CSS pixels per line pair: fine enough to read as structure rather
      // than as stripes, coarse enough to survive a non-integer DPR.
      renderer.resize(width, height, 2 * dpr);
      dirty = true;
    };

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      if (!running || renderer.isLost || document.hidden) return;

      if (!syncTextures()) return;

      if (needsResize) {
        needsResize = false;
        applySize();
      }

      const { vh: viewport, animate } = live.current;
      const height = viewport || window.innerHeight;
      const scroll = scrollY.get();

      // Reduced motion pins the backdrop exactly as the DOM plates pin
      // themselves: no lift, no fade. The tube treatment stays, since none of
      // what survives uMotion = 0 actually moves.
      const progress = animate ? clamp01(scroll / (height * TRAVEL)) : 0;
      const weight = animate ? fadeAt(scroll, height) : 1;

      // Nothing to redraw when the effects are frozen and the scroll hasn't
      // moved, or when the backdrop has already faded out from under the body
      // copy. The loop keeps ticking either way — it is the draw that costs.
      const settled = progress === lastLift && weight === lastFade && !dirty;
      if (settled && (!animate || weight <= 0.07)) return;

      lastLift = progress;
      lastFade = weight;
      dirty = false;

      renderer.draw(
        {
          time: animate ? (now - started) / 1000 : 0,
          shift: [
            LIFT.sky * progress,
            LIFT.far * progress,
            LIFT.near * progress,
          ],
          fade: weight,
          motion: animate ? 1 : 0,
        },
        SCENE
      );

      if (!handedOver) {
        handedOver = true;
        setOnCanvas(true);
      }
    };

    // Not prevented: without a full rebuild a restored context draws nothing,
    // and the DOM plates underneath are a better answer than a blank canvas.
    const onContextLost = () => {
      renderer.markLost();
      setOnCanvas(false);
    };

    const observer = new ResizeObserver(remeasure);
    observer.observe(canvas);
    // ResizeObserver stays quiet when only the pixel ratio changes, which is
    // what happens dragging the window between displays.
    window.addEventListener("resize", remeasure);
    canvas.addEventListener("webglcontextlost", onContextLost);

    frame = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", remeasure);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      invalidate.current = () => {};
      renderer.dispose();
    };
  }, [scrollY]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ background: SKY }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full transition-opacity duration-500"
        style={{ opacity: onCanvas ? 1 : 0 }}
      />

      {/* Also the texture source, so these stay mounted and decoded. */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ opacity: onCanvas ? 0 : 1 }}
      >
        <motion.div
          className="absolute inset-0"
          style={reduceMotion ? undefined : { opacity: fade }}
        >
          <Plate part="sky" imgRef={skyRef} y={skyY} still={!!reduceMotion} priority />
          <Plate part="far" imgRef={farRef} y={farY} still={!!reduceMotion} priority />
          <Plate part="near" imgRef={nearRef} y={nearY} still={!!reduceMotion} />
        </motion.div>
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
  imgRef,
  y,
  still,
  priority = false,
}: {
  part: Layer;
  imgRef: RefObject<HTMLImageElement | null>;
  y: MotionValue<string>;
  still: boolean;
  priority?: boolean;
}) {
  return (
    <motion.div className="absolute inset-0" style={still ? undefined : { y }}>
      <Image
        ref={imgRef}
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
