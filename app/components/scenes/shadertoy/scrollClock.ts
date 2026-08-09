/** Minimum drive-time scale after the slowdown span (35%). */
export const DRIVE_TIME_MIN_SCALE = 0.35;

/** Scroll distance in viewport heights over which drive time eases to the floor. */
export const DRIVE_SLOWDOWN_VH = 4;

/** Viewport heights past which non-drive shaders may stop rendering. */
export const DEEP_SCROLL_PAUSE_VH = 1.6;

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
