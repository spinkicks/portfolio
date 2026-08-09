import { expect, test, type Locator, type Page } from "@playwright/test";

const baseUrl = process.env.PORTFOLIO_URL ?? "http://127.0.0.1:8422";
const FRAME_CLEARANCE_PX = 8;
const MIN_CTA_HEIGHT_PX = 44;
const MIN_SOCIAL_TOUCH_PX = 44;
const TALL_MOBILE_HEIGHT_PX = 780;

type Box = { x: number; y: number; width: number; height: number };

function bottom(box: Box) {
  return box.y + box.height;
}

function right(box: Box) {
  return box.x + box.width;
}

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

async function boundingBox(locator: Locator): Promise<Box> {
  const box = await locator.boundingBox();
  expect(box, "Expected element to have a bounding box").not.toBeNull();
  return box!;
}

function boxesOverlap(a: Box, b: Box) {
  return a.x < right(b) && right(a) > b.x && a.y < bottom(b) && bottom(a) > b.y;
}

async function expectWithinFrame(locator: Locator, frame: Box, clearance = FRAME_CLEARANCE_PX) {
  const box = await boundingBox(locator);
  expect(box.x, "left edge inside frame").toBeGreaterThanOrEqual(frame.x + clearance);
  expect(box.y, "top edge inside frame").toBeGreaterThanOrEqual(frame.y + clearance);
  expect(right(box), "right edge inside frame").toBeLessThanOrEqual(right(frame) - clearance);
  expect(bottom(box), "bottom edge inside frame").toBeLessThanOrEqual(bottom(frame) - clearance);
}

async function expectHeroJustifyContent(page: Page, expected: "start" | "center") {
  const justifyContent = await page.locator("section.hero-marquee").evaluate((el) => {
    return getComputedStyle(el).justifyContent;
  });

  if (expected === "start") {
    expect(justifyContent).toMatch(/start|flex-start/);
    return;
  }

  expect(justifyContent).toMatch(/center/);
}

async function assertMobileHeroGeometry(
  page: Page,
  viewportSize: { width: number; height: number }
) {
  const frame = await boundingBox(page.locator(".frame-edge"));
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();

  const socialLinks = page.locator(
    'main a[aria-label="LinkedIn"], main a[aria-label="Email"], main a[aria-label="GitHub"]'
  );
  await expect(socialLinks).toHaveCount(3);

  for (const link of await socialLinks.all()) {
    await expectWithinFrame(link, frame);
    const box = await boundingBox(link);
    expect(box.height).toBeGreaterThanOrEqual(MIN_SOCIAL_TOUCH_PX);
    expect(box.width).toBeGreaterThanOrEqual(MIN_SOCIAL_TOUCH_PX);
  }

  const socialRow = socialLinks.first().locator("xpath=ancestor::ul[1]");
  const ctaRow = page.getByRole("link", { name: "View work", exact: true });
  const backdropSwitcher = page.getByRole("radiogroup", { name: "Backdrop" });

  const socialBox = await boundingBox(socialRow);
  const ctaBox = await boundingBox(ctaRow);
  const switcherBox = await boundingBox(backdropSwitcher);

  expect(boxesOverlap(socialBox, ctaBox)).toBe(false);
  expect(boxesOverlap(socialBox, switcherBox)).toBe(false);

  const viewWork = page.getByRole("link", { name: "View work", exact: true });
  const getInTouch = page.getByRole("link", { name: "Get in touch", exact: true });

  for (const cta of [viewWork, getInTouch]) {
    const box = await boundingBox(cta);
    expect(box.height).toBeGreaterThanOrEqual(MIN_CTA_HEIGHT_PX);
    expect(box.x).toBeGreaterThanOrEqual(frame.x);
    expect(right(box)).toBeLessThanOrEqual(right(frame));
  }

  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

  const isMobileWidth = viewportSize.width < 640;
  if (isMobileWidth) {
    const expected =
      viewportSize.height >= TALL_MOBILE_HEIGHT_PX ? "center" : ("start" as const);
    await expectHeroJustifyContent(page, expected);
  }
}

const mobileViewports = [
  { width: 390, height: 844, name: "390x844" },
  { width: 430, height: 932, name: "430x932" },
  { width: 390, height: 700, name: "390x700" },
] as const;

for (const viewport of mobileViewports) {
  test(`synthwave mobile hero geometry @ ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await openSynthwave(page);
    await assertMobileHeroGeometry(page, viewport);
  });
}
