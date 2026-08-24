import { expect, test, type Page } from "@playwright/test";

const baseUrl = process.env.PORTFOLIO_URL ?? "http://127.0.0.1:8422";

type Box = { top: number; bottom: number };

async function boundingBox(selector: string, page: Page): Promise<Box> {
  const box = await page.locator(selector).boundingBox();
  expect(box, `Expected ${selector} to have a bounding box`).not.toBeNull();
  return { top: box!.y, bottom: box!.y + box!.height };
}

test("desktop hero reserves space between CTAs, theme switcher, and frame", async ({ page }) => {
  // A 2880px-wide laptop with 150% display scaling exposes roughly this CSS viewport.
  await page.setViewportSize({ width: 1920, height: 976 });
  await page.goto(baseUrl, { waitUntil: "commit" });

  const cta = await boundingBox(".hero-marquee .mt-6.justify-center", page);
  const switcher = await boundingBox('[role="radiogroup"]', page);
  const frame = await boundingBox(".frame-edge", page);

  expect(switcher.top - cta.bottom, "CTA-to-switcher clearance").toBeGreaterThanOrEqual(48);
  expect(frame.bottom - switcher.bottom, "switcher-to-frame clearance").toBeGreaterThanOrEqual(20);
});
