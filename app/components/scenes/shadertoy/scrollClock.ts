/** Minimum drive-time scale after the slowdown span (35%). */
export const DRIVE_TIME_MIN_SCALE = 0.35;

/** Scroll distance in viewport heights over which drive time eases to the floor. */
export const DRIVE_SLOWDOWN_VH = 4;

/** Viewport heights past which non-drive shaders may stop rendering. */
export const DEEP_SCROLL_PAUSE_VH = 1.6;

/** High-refresh cap; rAF quantization keeps common displays around 72-90fps. */
export const SYNTHWAVE_RENDER_INTERVAL_MS = 1000 / 90;

/** Frames to draw before a non-drive scene may freeze. */
export const SHADER_SETTLE_FRAMES = 45;

/** Intentional first-frame / resume delta, in seconds. */
export const SHADER_FIRST_FRAME_DELTA = 1 / 60;

/** Elapsed hidden time must not leak into the next tick; a zero last-frame means resume. */
export function shaderFrameDelta(lastFrameMs: number, nowMs: number): number {
  if (lastFrameMs === 0) return SHADER_FIRST_FRAME_DELTA;
  return Math.min(0.1, (nowMs - lastFrameMs) / 1000);
}

export function shouldParkShaderLoop(opts: {
  dead: boolean;
  hidden: boolean;
  isDrive: boolean;
  animate: boolean;
  settled: number;
  deepPaused: boolean;
  settleFrames?: number;
}): boolean {
  if (opts.dead || opts.hidden) return true;
  if (opts.isDrive) return false;
  const settle = opts.settleFrames ?? SHADER_SETTLE_FRAMES;
  if (opts.settled <= settle) return false;
  return !opts.animate || opts.deepPaused;
}

function easeOutQuadratic(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return 1 - (1 - clamped) * (1 - clamped);
}

/**
 * Slows car/road progression early, then eases into {@link DRIVE_TIME_MIN_SCALE}
 * by {@link DRIVE_SLOWDOWN_VH} viewport heights. Never reaches zero.
 */
export function driveTimeScale(scrollY: number, viewportHeight: number): number {
  const vh = Math.max(1, viewportHeight);
  const scrollVh = scrollY / vh;
  const eased = easeOutQuadratic(scrollVh / DRIVE_SLOWDOWN_VH);
  return DRIVE_TIME_MIN_SCALE + (1 - DRIVE_TIME_MIN_SCALE) * (1 - eased);
}

/** Whether a shader may stop rendering once it is well below the hero. */
export function shouldPauseShaderAtDeepScroll(
  shaderName: string,
  scrollY: number,
  viewportHeight: number
): boolean {
  if (shaderName === "sunset-drive") return false;
  const vh = Math.max(1, viewportHeight);
  return scrollY > vh * DEEP_SCROLL_PAUSE_VH;
}

/** Caps only the two synthwave-side shaders; terminal rain keeps native pacing. */
export function synthwaveRenderIntervalMs(shaderName: string): number {
  return shaderName === "sunset-drive" || shaderName === "synthwave-theme"
    ? SYNTHWAVE_RENDER_INTERVAL_MS
    : 0;
}
