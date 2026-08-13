import { expect, test } from "@playwright/test";
import { SUNSET_DRIVE } from "../app/components/scenes/shadertoy/specs";
import { resolveBufferSize } from "../app/components/scenes/shadertoy/runtime";
import {
  SHADER_FIRST_FRAME_DELTA,
  shaderFrameDelta,
  shouldParkShaderLoop,
} from "../app/components/scenes/shadertoy/scrollClock";
import { RafScheduler, ShaderLoadAttempt } from "../app/components/scenes/shadertoy/loopControl";

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

function scaledCanvasSize() {
  const scale = SUNSET_DRIVE.bufferScale ?? 1;
  return {
    width: Math.max(1, Math.round(CANVAS_WIDTH * scale)),
    height: Math.max(1, Math.round(CANVAS_HEIGHT * scale)),
  };
}

test("Sunset Drive Buffer A is 8x8 while visual buffers keep scaled canvas size", () => {
  expect(resolveBufferSize(SUNSET_DRIVE, "A", CANVAS_WIDTH, CANVAS_HEIGHT)).toEqual({
    width: 8,
    height: 8,
  });

  const scaled = scaledCanvasSize();
  for (const id of ["B", "C", "D"] as const) {
    expect(resolveBufferSize(SUNSET_DRIVE, id, CANVAS_WIDTH, CANVAS_HEIGHT)).toEqual(
      scaled
    );
  }
});

test("Sunset Drive Buffer C does not fetch organic-rgba.png for the disabled HUD", () => {
  const passC = SUNSET_DRIVE.passes.find((pass) => pass.id === "C");
  expect(passC?.channels?.[3]).toBeUndefined();
  expect(JSON.stringify(SUNSET_DRIVE)).not.toContain("organic-rgba.png");
});

test("shader loop parks when hidden, dead, or a settled non-drive scene is deep-paused", () => {
  expect(
    shouldParkShaderLoop({
      dead: true,
      hidden: false,
      isDrive: false,
      animate: true,
      settled: 10,
      deepPaused: false,
    })
  ).toBe(true);

  expect(
    shouldParkShaderLoop({
      dead: false,
      hidden: true,
      isDrive: true,
      animate: true,
      settled: 100,
      deepPaused: false,
    })
  ).toBe(true);

  expect(
    shouldParkShaderLoop({
      dead: false,
      hidden: false,
      isDrive: false,
      animate: true,
      settled: 100,
      deepPaused: true,
    })
  ).toBe(true);

  expect(
    shouldParkShaderLoop({
      dead: false,
      hidden: false,
      isDrive: false,
      animate: false,
      settled: 100,
      deepPaused: false,
    })
  ).toBe(true);

  expect(
    shouldParkShaderLoop({
      dead: false,
      hidden: false,
      isDrive: true,
      animate: true,
      settled: 100,
      deepPaused: true,
    })
  ).toBe(false);

  expect(
    shouldParkShaderLoop({
      dead: false,
      hidden: false,
      isDrive: false,
      animate: true,
      settled: 10,
      deepPaused: true,
    })
  ).toBe(false);
});

test("a new shader load aborts the previous attempt and invalidates its generation", () => {
  const gate = new ShaderLoadAttempt();
  const first = gate.next();
  expect(first).not.toBeNull();
  expect(first!.signal.aborted).toBe(false);

  const second = gate.next();
  expect(second).not.toBeNull();
  expect(first!.signal.aborted).toBe(true);
  expect(second!.signal.aborted).toBe(false);
  expect(gate.isCurrent(first!.generation)).toBe(false);
  expect(gate.isCurrent(second!.generation)).toBe(true);
});

test("aborting a shader load invalidates the in-flight generation", () => {
  const gate = new ShaderLoadAttempt();
  const first = gate.next()!;
  gate.abort();
  expect(first.signal.aborted).toBe(true);
  expect(gate.isCurrent(first.generation)).toBe(false);
});

test("closing a shader load aborts the active attempt and rejects further next()", () => {
  const gate = new ShaderLoadAttempt();
  const first = gate.next()!;
  gate.close();
  expect(first.signal.aborted).toBe(true);
  expect(gate.next()).toBeNull();
  expect(gate.isCurrent(first.generation)).toBe(false);
});

test("RafScheduler ignores duplicate wake while a frame is scheduled or running", () => {
  const queued: FrameRequestCallback[] = [];
  const scheduler = new RafScheduler(
    (cb) => {
      queued.push(cb);
      return queued.length;
    },
    () => undefined
  );

  let ticks = 0;
  const tick = () => {
    ticks += 1;
    scheduler.wake(tick);
    return true;
  };

  scheduler.wake(tick);
  scheduler.wake(tick);
  expect(queued.length).toBe(1);

  queued[0]!(16);
  expect(ticks).toBe(1);
  expect(queued.length).toBe(2);
});

test("resuming after a parked gap uses the first-frame delta, not elapsed hidden time", () => {
  expect(shaderFrameDelta(0, 8_000)).toBeCloseTo(SHADER_FIRST_FRAME_DELTA, 8);
  expect(shaderFrameDelta(1_000, 8_000)).toBeCloseTo(0.1, 8);
});

