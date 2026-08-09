"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ShaderToyRuntime, type ShaderSpec } from "./shadertoy/runtime";
import {
  driveRenderIntervalMs,
  driveTimeScale,
  shouldPauseShaderAtDeepScroll,
} from "./shadertoy/scrollClock";
import { useSceneScroll } from "./useSceneScroll";

/**
 * Hero backdrop driven by a Shadertoy pass graph.
 *
 * Unlike the artwork scene this draws everything itself, so there is no DOM
 * image to fall back to. If WebGL2 is missing or the shader fails to build,
 * the flat base colour is what remains, and the copy on top is designed to
 * read against it either way.
 */

const BASE = "#12021f";

/** Raymarching at native resolution on a high-DPI display is not worth it. */
const MAX_DPR = 1.5;
const MAX_WIDTH = 1920;

/** Frames to settle before freezing, when the visitor asked for no motion. */
const SETTLE_FRAMES = 45;

/** Dev/test hook for Playwright liveness checks; stripped from production bundles. */
const TRACK_SHADER_FRAMES = process.env.NODE_ENV !== "production";

export default function ShaderScene({
  spec,
  base = BASE,
  /** Backing-store multiplier. Below 1 the canvas is drawn small and scaled up,
   *  which is the cheapest lever on a heavy march. */
  scale = 1,
  className = "pointer-events-none fixed inset-0 z-0 overflow-hidden",
  /** Replaces the default scrim stack, which is tuned for the synthwave hero. */
  overlay,
}: {
  spec: ShaderSpec;
  base?: string;
  scale?: number;
  className?: string;
  overlay?: ReactNode;
}) {
  const { reduceMotion, scrollY } = useSceneScroll();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(false);

  // Nothing scroll-linked: the backdrop holds one brightness the whole way
  // down and the content carries its own scrim. Scroll is only used to stop
  // drawing once the scene is well out of sight.
  const live = useRef({ animate: !reduceMotion });
  live.current = { animate: !reduceMotion };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const abort = new AbortController();
    let runtime: ShaderToyRuntime | null = null;
    let frame = 0;
    let disposed = false;
    let needsResize = true;
    let settled = 0;
    let realTime = 0;
    let driveTime = 0;
    let lastFrame = 0;
    let lastRender = 0;
    const isDrive = spec.name === "sunset-drive";

    const remeasure = () => {
      needsResize = true;
    };

    const applySize = () => {
      const cssWidth = canvas.clientWidth;
      const cssHeight = canvas.clientHeight;
      if (!runtime || cssWidth === 0 || cssHeight === 0) return;

      const dpr =
        Math.min(window.devicePixelRatio || 1, MAX_DPR, MAX_WIDTH / cssWidth) *
        scale;
      const width = Math.max(1, Math.round(cssWidth * dpr));
      const height = Math.max(1, Math.round(cssHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      runtime.resize(width, height);
      settled = 0;
    };

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      if (disposed || !runtime || runtime.isDead || document.hidden) return;

      if (needsResize) {
        needsResize = false;
        applySize();
      }

      const delta =
        lastFrame === 0 ? 1 / 60 : Math.min(0.1, (now - lastFrame) / 1000);
      lastFrame = now;

      const currentScrollY = scrollY.get();
      const vh = window.innerHeight;
      const { animate } = live.current;

      if (!animate && settled > SETTLE_FRAMES) return;

      if (
        shouldPauseShaderAtDeepScroll(spec.name, currentScrollY, vh) &&
        settled > SETTLE_FRAMES
      ) {
        return;
      }

      realTime += delta;
      if (isDrive) {
        driveTime += delta * driveTimeScale(currentScrollY, vh);
      } else {
        driveTime = realTime;
      }

      const renderIntervalMs = isDrive
        ? driveRenderIntervalMs(currentScrollY, vh)
        : 0;
      const elapsedSinceRender = lastRender === 0 ? renderIntervalMs : now - lastRender;
      if (renderIntervalMs > 0 && elapsedSinceRender < renderIntervalMs) {
        return;
      }

      runtime.frame(realTime, driveTime);
      lastRender = now;
      settled++;
      if (settled === 1) setRunning(true);
      if (TRACK_SHADER_FRAMES && settled % 30 === 0) {
        canvas.setAttribute("data-shader-frames", String(settled));
      }
    };

    const onContextLost = () => {
      runtime?.markDead();
      setRunning(false);
    };

    const observer = new ResizeObserver(remeasure);
    observer.observe(canvas);
    window.addEventListener("resize", remeasure);
    canvas.addEventListener("webglcontextlost", onContextLost);

    ShaderToyRuntime.create(canvas, spec, abort.signal).then((created) => {
      if (disposed) {
        created?.dispose();
        return;
      }
      if (!created) return;
      runtime = created;
      needsResize = true;
      frame = requestAnimationFrame(loop);
    });

    return () => {
      disposed = true;
      abort.abort();
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", remeasure);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      runtime?.dispose();
    };
  }, [scale, spec, scrollY]);

  return (
    <div aria-hidden="true" className={className} style={{ background: base }}>
      {/* Keyed off `running`, which is false on the server and on the client's
          first render alike, so the two agree. */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: running ? 1 : 0,
          visibility: running ? "visible" : "hidden",
        }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
      </div>

      {overlay ?? (
        <>
          {/* Lighter than the artwork scene's stack. That one leans hard to the
              left because it was built for a left-aligned column; the copy here
              is centred and carries its own scrim, so all this has to do is
              keep the scene from competing at the edges. */}
          <div className="absolute inset-x-0 bottom-0 h-[20vh] bg-gradient-to-t from-ink via-ink/55 to-transparent" />
          <div className="absolute inset-0 bg-ink/20" />
          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_0%,rgba(4,2,12,0.18)_62%,rgba(4,2,12,0.6)_100%)]" />
        </>
      )}
    </div>
  );
}
