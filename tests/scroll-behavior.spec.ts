import { expect, test, type Page } from "@playwright/test";

const baseUrl = process.env.PORTFOLIO_URL ?? "http://127.0.0.1:8422";

/** Counter updates every 30 rendered frames in development/test builds. */
const MIN_FRAME_ADVANCE = 30;

async function openSynthwave(page: Page) {
  await page.goto(baseUrl, { waitUntil: "commit" });
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

async function readShaderFrames(page: Page) {
  return page.evaluate(() => {
    const node = document.querySelector("canvas");
    return node ? Number(node.getAttribute("data-shader-frames") ?? "0") : 0;
  });
}

test("content scrim settles at 81% ink opacity", async ({ page }) => {
  await openSynthwave(page);

  const scrim = page.locator(
    'main .bg-\\[linear-gradient\\(to_bottom\\,transparent_0\\,color-mix\\(in_srgb\\,var\\(--color-ink\\)_81\\%\\,transparent\\)_55vh\\)\\]'
  );

  await expect(scrim).toHaveCount(1);
});

test("sunset drive canvas keeps rendering after deep scroll", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openSynthwave(page);

  const driveButton = page.getByRole("radio", { name: "Sunset Drive", exact: true });
  await driveButton.click();
  await expect(driveButton).toHaveAttribute("aria-checked", "true");

  const canvas = page.locator("canvas").first();
  await expect(canvas).toBeVisible();

  await expect
    .poll(async () => readShaderFrames(page), {
      message: "wait for shader frame counter",
      timeout: 20_000,
    })
    .toBeGreaterThanOrEqual(MIN_FRAME_ADVANCE);

  const framesBefore = await readShaderFrames(page);

  await page.evaluate(() => {
    window.scrollTo(0, window.innerHeight * 3);
  });

  await expect
    .poll(async () => page.evaluate(() => window.scrollY / window.innerHeight), {
      message: "scroll past the old 1.6 viewport cutoff",
      timeout: 5_000,
    })
    .toBeGreaterThanOrEqual(2.5);

  await expect
    .poll(
      async () => {
        const framesAfter = await readShaderFrames(page);
        return framesAfter - framesBefore;
      },
      {
        message: "shader should keep advancing while scrolled deep",
        timeout: 15_000,
      }
    )
    .toBeGreaterThanOrEqual(MIN_FRAME_ADVANCE);
});
