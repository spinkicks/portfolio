import { expect, test, type Page } from "@playwright/test";

const baseUrl = process.env.PORTFOLIO_URL ?? "http://127.0.0.1:8422";

type Box = { top: number; bottom: number };

async function boundingBox(selector: string, page: Page): Promise<Box> {
  const box = await page.locator(selector).boundingBox();
  expect(box, `Expected ${selector} to have a bounding box`).not.toBeNull();
  return { top: box!.y, bottom: box!.y + box!.height };
}

const desktopViewports = [
  { width: 1920, height: 976, name: "high-res display scaled" },
  { width: 1440, height: 800, name: "1440x800 laptop" },
  { width: 1366, height: 768, name: "1366x768 laptop" },
  { width: 1280, height: 720, name: "1280x720 compact laptop" },
];

for (const { width, height, name } of desktopViewports) {
  test(`desktop hero reserves space between hero content, theme switcher, and frame @ ${name}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto(baseUrl, { waitUntil: "commit" });

    await expect(page.getByRole("link", { name: "View work", exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Get in touch", exact: true })).toHaveCount(0);

    const stats = await boundingBox(".hero-marquee dl", page);
    const switcher = await boundingBox('[role="radiogroup"]', page);
    const frame = await boundingBox(".frame-edge", page);

    expect(switcher.top - stats.bottom, "stats-to-switcher clearance").toBeGreaterThanOrEqual(48);
    expect(frame.bottom - switcher.bottom, "switcher-to-frame clearance").toBeGreaterThanOrEqual(20);
    expect(switcher.bottom, "switcher stays inside viewport").toBeLessThanOrEqual(height);
  });
}
