/** Minimum drive-time scale after the slowdown span (35%). */
export const DRIVE_TIME_MIN_SCALE = 0.35;

/** Scroll distance in viewport heights over which drive time eases to the floor. */
export const DRIVE_SLOWDOWN_VH = 4;

/** Viewport heights past which non-drive shaders may stop rendering. */
export const DEEP_SCROLL_PAUSE_VH = 1.6;

/** Viewport heights where drive render throttling begins (no cap at or below). */
export const DRIVE_RENDER_INTERVAL_START_VH = DEEP_SCROLL_PAUSE_VH;

/** Viewport heights where drive render throttling reaches its maximum interval. */
export const DRIVE_RENDER_INTERVAL_END_VH = 4;

/** Maximum milliseconds between drive shader draws (~72fps) once fully throttled. */
export const DRIVE_RENDER_MAX_INTERVAL_MS = 1000 / 72;

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

/**
 * Milliseconds to wait between drive shader draws once the visitor scrolls past
 * {@link DRIVE_RENDER_INTERVAL_START_VH}. Returns 0 below that span so 60Hz
 * displays still render every refresh; high-refresh displays cap near 72fps deep.
 */
export function driveRenderIntervalMs(
  scrollY: number,
  viewportHeight: number
): number {
  const vh = Math.max(1, viewportHeight);
  const scrollVh = scrollY / vh;

  if (scrollVh <= DRIVE_RENDER_INTERVAL_START_VH) {
    return 0;
  }

  const span = DRIVE_RENDER_INTERVAL_END_VH - DRIVE_RENDER_INTERVAL_START_VH;
  const t = Math.min(1, Math.max(0, (scrollVh - DRIVE_RENDER_INTERVAL_START_VH) / span));
  return easeOutQuadratic(t) * DRIVE_RENDER_MAX_INTERVAL_MS;
}
