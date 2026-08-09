/**
 * Manual performance probe for deep-scroll animation lag.
 * Not a CI gate: reports rAF p95 and shader fps without brittle thresholds.
 */
import { expect, test } from "@playwright/test";

const VIEWPORT = { width: 1440, height: 900 };
const SCROLL_VH = 3;
const SAMPLE_MS = 2500;
const WARMUP_MS = 1200;

async function openSynthwave(page: import("@playwright/test").Page) {
  await page.goto("/", { waitUntil: "commit" });
  const terminalButton = page.getByRole("button", { name: "Terminal view", exact: true });
  const synthwaveButton = page.getByRole("button", {
    name: "Synthwave layout",
    exact: true,
  });
  await expect(terminalButton.or(synthwaveButton)).toBeVisible();
  if (await synthwaveButton.isVisible()) {
    await synthwaveButton.click();
  }
  await expect(terminalButton).toBeVisible();
}

async function measureRafP95(page: import("@playwright/test").Page) {
  return page.evaluate(
    async ({ sampleMs }) => {
      const deltas: number[] = [];
      let last = performance.now();

      await new Promise<void>((resolve) => {
        const endAt = last + sampleMs;
        const tick = (now: number) => {
          deltas.push(now - last);
          last = now;
          if (now < endAt) {
            requestAnimationFrame(tick);
          } else {
            resolve();
          }
        };
        requestAnimationFrame(tick);
      });

      deltas.sort((a, b) => a - b);
      const idx = Math.max(0, Math.min(deltas.length - 1, Math.floor(deltas.length * 0.95)));
      return {
        samples: deltas.length,
        p95Ms: deltas[idx] ?? 0,
        meanMs: deltas.reduce((sum, value) => sum + value, 0) / Math.max(1, deltas.length),
      };
    },
    { sampleMs: SAMPLE_MS }
  );
}

async function measureShaderFps(page: import("@playwright/test").Page) {
  return page.evaluate(
    async ({ sampleMs }) => {
      const canvas = document.querySelector("canvas");
      if (!canvas) return { fps: 0, frames: 0 };

      const startFrames = Number(canvas.getAttribute("data-shader-frames") ?? "0");
      const start = performance.now();
      await new Promise((resolve) => setTimeout(resolve, sampleMs));
      const endFrames = Number(canvas.getAttribute("data-shader-frames") ?? "0");
      const elapsedSec = (performance.now() - start) / 1000;
      const frames = Math.max(0, endFrames - startFrames);
      return {
        frames,
        fps: elapsedSec > 0 ? frames / elapsedSec : 0,
      };
    },
    { sampleMs: SAMPLE_MS }
  );
}

test("reports deep-scroll rAF and shader metrics", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize(VIEWPORT);
  await openSynthwave(page);

  const driveButton = page.getByRole("radio", { name: "Sunset Drive", exact: true });
  await driveButton.click();
  await expect(driveButton).toHaveAttribute("aria-checked", "true");

  await page.evaluate((scrollVh) => {
    window.scrollTo(0, window.innerHeight * scrollVh);
  }, SCROLL_VH);

  await page.waitForTimeout(WARMUP_MS);
  const allEffectsRaf = await measureRafP95(page);
  const allEffectsShader = await measureShaderFps(page);

  await page.addStyleTag({
    content: ".grain::before, .grain::after { animation: none !important; }",
  });
  await page.waitForTimeout(WARMUP_MS);
  const grainStaticRaf = await measureRafP95(page);
  const grainStaticShader = await measureShaderFps(page);

  const report = {
    viewport: VIEWPORT,
    scrollVh: SCROLL_VH,
    sampleMs: SAMPLE_MS,
    baseline: {
      allEffectsRafP95Ms: 13.8,
      grainDisabledRafP95Ms: 7.2,
      shaderFps: 142.5,
    },
    after: {
      allEffects: {
        rafP95Ms: Number(allEffectsRaf.p95Ms.toFixed(2)),
        rafMeanMs: Number(allEffectsRaf.meanMs.toFixed(2)),
        shaderFps: Number(allEffectsShader.fps.toFixed(1)),
      },
      grainStatic: {
        rafP95Ms: Number(grainStaticRaf.p95Ms.toFixed(2)),
        rafMeanMs: Number(grainStaticRaf.meanMs.toFixed(2)),
        shaderFps: Number(grainStaticShader.fps.toFixed(1)),
      },
    },
  };

  console.log("ANIMATION_LAG_BENCHMARK", JSON.stringify(report));
  expect(report.after.allEffects.rafP95Ms).toBeGreaterThan(0);
});
