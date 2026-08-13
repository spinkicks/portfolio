import { expect, test } from "@playwright/test";
import {
  DRIVE_SLOWDOWN_VH,
  DRIVE_TIME_MIN_SCALE,
  SYNTHWAVE_RENDER_INTERVAL_MS,
  driveTimeScale,
  synthwaveRenderIntervalMs,
  shouldPauseShaderAtDeepScroll,
} from "../app/components/scenes/shadertoy/scrollClock";

const VH = 900;

test("driveTimeScale is 1 at the top", () => {
  expect(driveTimeScale(0, VH)).toBeCloseTo(1, 5);
});

test("driveTimeScale slows noticeably within the first viewport", () => {
  expect(driveTimeScale(VH * 0.5, VH)).toBeLessThanOrEqual(0.86);
  expect(driveTimeScale(VH, VH)).toBeLessThanOrEqual(0.73);
});

test("driveTimeScale reaches the 35% floor at 4 viewport heights", () => {
  expect(driveTimeScale(VH * DRIVE_SLOWDOWN_VH, VH)).toBeCloseTo(
    DRIVE_TIME_MIN_SCALE,
    5
  );
});

test("driveTimeScale stays at the floor beyond 4 viewport heights", () => {
  expect(driveTimeScale(VH * 8, VH)).toBeCloseTo(DRIVE_TIME_MIN_SCALE, 5);
});

test("driveTimeScale is monotonic and never reaches zero", () => {
  const samples = [0, VH * 0.5, VH, VH * 2, VH * 4, VH * 10];
  const scales = samples.map((scrollY) => driveTimeScale(scrollY, VH));

  for (let i = 1; i < scales.length; i += 1) {
    expect(scales[i]).toBeLessThanOrEqual(scales[i - 1] + 1e-9);
  }
  for (const scale of scales) {
    expect(scale).toBeGreaterThan(0);
    expect(scale).toBeGreaterThanOrEqual(DRIVE_TIME_MIN_SCALE - 1e-9);
    expect(scale).toBeLessThanOrEqual(1 + 1e-9);
  }
});

test("driveTimeScale handles invalid or tiny viewport heights safely", () => {
  expect(() => driveTimeScale(1200, 0)).not.toThrow();
  expect(() => driveTimeScale(1200, -50)).not.toThrow();
  expect(driveTimeScale(1200, 0)).toBeGreaterThan(0);
  expect(driveTimeScale(1200, -50)).toBeGreaterThan(0);
});

test("sunset-drive never deep-pauses while synthwave-theme does", () => {
  const deepScroll = VH * 3;

  expect(shouldPauseShaderAtDeepScroll("sunset-drive", deepScroll, VH)).toBe(
    false
  );
  expect(shouldPauseShaderAtDeepScroll("synthwave-theme", deepScroll, VH)).toBe(
    true
  );
});

test("deep pause only applies after the cutoff viewport span", () => {
  const shallow = VH * 1.2;
  const deep = VH * 2;

  expect(shouldPauseShaderAtDeepScroll("synthwave-theme", shallow, VH)).toBe(
    false
  );
  expect(shouldPauseShaderAtDeepScroll("synthwave-theme", deep, VH)).toBe(true);
});

test("synthwave backdrops cap high-refresh rendering near 72-90fps", () => {
  expect(SYNTHWAVE_RENDER_INTERVAL_MS).toBeCloseTo(1000 / 90, 5);
  expect(synthwaveRenderIntervalMs("sunset-drive")).toBeCloseTo(
    SYNTHWAVE_RENDER_INTERVAL_MS,
    5
  );
  expect(synthwaveRenderIntervalMs("synthwave-theme")).toBeCloseTo(
    SYNTHWAVE_RENDER_INTERVAL_MS,
    5
  );
});

test("terminal matrix rain keeps native display pacing", () => {
  expect(synthwaveRenderIntervalMs("matrix-rain")).toBe(0);
});
