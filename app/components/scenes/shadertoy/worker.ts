import { RafScheduler, ShaderLoadAttempt } from "./loopControl";
import { ShaderToyRuntime, type ShaderSpec } from "./runtime";
import {
  DRIVE_SLOWDOWN_VH,
  SHADER_SETTLE_FRAMES,
  driveTimeScale,
  shaderFrameDelta,
  shouldParkShaderLoop,
  shouldPauseShaderAtDeepScroll,
  synthwaveRenderIntervalMs,
} from "./scrollClock";

export type WorkerInMessage =
  | {
      type: "init";
      canvas: OffscreenCanvas;
      trackFrames: boolean;
      origin: string;
    }
  | {
      type: "load";
      spec: ShaderSpec;
      width: number;
      height: number;
      animate: boolean;
      scrollY: number;
      vh: number;
      hidden: boolean;
    }
  | {
      type: "resize";
      width: number;
      height: number;
      vh: number;
    }
  | {
      type: "scroll";
      scrollY: number;
      vh: number;
    }
  | {
      type: "visibility";
      hidden: boolean;
    }
  | {
      type: "animate";
      animate: boolean;
    }
  | {
      type: "stop";
    }
  | {
      type: "loseContext";
    }
  | {
      type: "restoreContext";
    }
  | {
      type: "dispose";
    };

export type WorkerOutMessage =
  | {
      type: "running";
      running: boolean;
    }
  | {
      type: "frames";
      frames: number | null;
    };

const SCROLL_ACTIVE_WINDOW_MS = 140;

let canvas: OffscreenCanvas | null = null;
let runtime: ShaderToyRuntime | null = null;
let currentSpec: ShaderSpec | null = null;
let loadingSpecName: string | null = null;
let workerOrigin = "";
let trackFrames = false;
let disposed = false;

let width = 0;
let height = 0;
let vh = 900;
let scrollY = 0;
let animate = true;
let hidden = false;
let needsResize = true;

let settled = 0;
let realTime = 0;
let driveTime = 0;
let lastFrame = 0;
let lastRender = 0;
let lastScrollAt = 0;
let lostContextExt: WEBGL_lose_context | null = null;

const load = new ShaderLoadAttempt();
const frames = new RafScheduler(
  (cb) => requestAnimationFrame(cb),
  (id) => cancelAnimationFrame(id)
);

function post(msg: WorkerOutMessage) {
  self.postMessage(msg);
}

function resetClock() {
  lastFrame = 0;
  lastRender = 0;
}

function park() {
  frames.park();
  resetClock();
}

function shouldContinue(): boolean {
  if (disposed || !runtime || runtime.isDead || hidden) {
    resetClock();
    return false;
  }
  return true;
}

function applySize() {
  if (!canvas || !runtime || width <= 0 || height <= 0) return;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  runtime.resize(width, height);
  settled = 0;
}

function wake() {
  if (disposed || !runtime || runtime.isDead || hidden) return;
  frames.wake(loop);
}

function loop(now: number): boolean {
  if (disposed || !runtime || !currentSpec) return false;

  if (needsResize) {
    needsResize = false;
    applySize();
  }

  const isDrive = currentSpec.name === "sunset-drive";
  if (
    shouldParkShaderLoop({
      dead: runtime.isDead,
      hidden,
      isDrive,
      animate,
      settled,
      deepPaused: shouldPauseShaderAtDeepScroll(currentSpec.name, scrollY, vh),
      settleFrames: SHADER_SETTLE_FRAMES,
    })
  ) {
    resetClock();
    return false;
  }

  const delta = shaderFrameDelta(lastFrame, now);
  lastFrame = now;

  const isScrolling = now - lastScrollAt < SCROLL_ACTIVE_WINDOW_MS;

  realTime += delta;
  if (isDrive) {
    driveTime += delta * driveTimeScale(scrollY, vh || DRIVE_SLOWDOWN_VH);
  } else {
    driveTime = realTime;
  }

  const renderIntervalMs = synthwaveRenderIntervalMs(
    currentSpec.name,
    scrollY,
    vh,
    isScrolling
  );
  const elapsedSinceRender = lastRender === 0 ? renderIntervalMs : now - lastRender;
  if (renderIntervalMs > 0 && elapsedSinceRender < renderIntervalMs) {
    return shouldContinue();
  }

  runtime.frame(realTime, driveTime);
  lastRender = now;
  settled++;
  if (settled === 1) {
    post({ type: "running", running: true });
  }
  if (trackFrames && settled % 30 === 0) {
    post({ type: "frames", frames: settled });
  }
  return shouldContinue();
}

function attachRuntime(created: ShaderToyRuntime | null, generation: number) {
  if (!load.isCurrent(generation) || disposed) {
    created?.dispose();
    return;
  }
  loadingSpecName = null;
  if (!created) return;
  runtime = created;
  needsResize = true;
  settled = 0;
  resetClock();
  if (trackFrames) post({ type: "frames", frames: null });
  wake();
}

function startRuntime() {
  if (!canvas || !currentSpec) return;
  const attempt = load.next();
  if (!attempt) return;
  const specToLoad = currentSpec;
  loadingSpecName = specToLoad.name;
  ShaderToyRuntime.create(canvas, specToLoad, attempt.signal, workerOrigin).then(
    (created) => {
      attachRuntime(created, attempt.generation);
    }
  );
}

function onContextLost(event: Event) {
  event.preventDefault();
  loadingSpecName = null;
  load.abort();
  park();
  runtime?.markDead();
  if (trackFrames) post({ type: "frames", frames: null });
  post({ type: "running", running: false });
}

function onContextRestored() {
  if (disposed) return;
  const previous = runtime;
  runtime = null;
  previous?.dispose();
  startRuntime();
}

self.onmessage = (event: MessageEvent<WorkerInMessage>) => {
  const msg = event.data;

  switch (msg.type) {
    case "init": {
      canvas = msg.canvas;
      trackFrames = msg.trackFrames;
      workerOrigin = msg.origin;
      canvas.addEventListener("webglcontextlost", onContextLost);
      canvas.addEventListener("webglcontextrestored", onContextRestored);
      break;
    }

    case "load": {
      const sameSpec = currentSpec?.name === msg.spec.name;
      currentSpec = msg.spec;
      width = msg.width;
      height = msg.height;
      animate = msg.animate;
      scrollY = msg.scrollY;
      vh = msg.vh;
      hidden = msg.hidden;
      needsResize = true;

      if (sameSpec && runtime && !runtime.isDead) {
        if (settled >= 1) {
          post({ type: "running", running: true });
        }
        wake();
        break;
      }

      if (sameSpec && loadingSpecName === msg.spec.name) {
        break;
      }

      park();
      const previous = runtime;
      runtime = null;
      previous?.dispose();
      realTime = 0;
      driveTime = 0;
      settled = 0;
      startRuntime();
      break;
    }

    case "resize": {
      width = msg.width;
      height = msg.height;
      vh = msg.vh;
      needsResize = true;
      wake();
      break;
    }

    case "scroll": {
      scrollY = msg.scrollY;
      vh = msg.vh;
      lastScrollAt = performance.now();
      wake();
      break;
    }

    case "visibility": {
      hidden = msg.hidden;
      if (hidden) park();
      else wake();
      break;
    }

    case "animate": {
      animate = msg.animate;
      wake();
      break;
    }

    case "stop": {
      load.abort();
      park();
      break;
    }

    case "loseContext": {
      if (runtime) {
        lostContextExt = runtime.context.getExtension("WEBGL_lose_context");
        lostContextExt?.loseContext();
      }
      break;
    }

    case "restoreContext": {
      lostContextExt?.restoreContext();
      lostContextExt = null;
      break;
    }

    case "dispose": {
      disposed = true;
      load.close();
      park();
      if (canvas) {
        canvas.removeEventListener("webglcontextlost", onContextLost);
        canvas.removeEventListener("webglcontextrestored", onContextRestored);
      }
      runtime?.dispose();
      runtime = null;
      break;
    }
  }
};
