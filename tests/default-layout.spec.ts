import { expect, test } from "@playwright/test";

const baseUrl = process.env.PORTFOLIO_URL ?? "http://127.0.0.1:8422";

/** Unique Terminal masthead copy; not present in the synthwave layout. */
const TERMINAL_MASTHEAD = "visitor@spinkicks:~$";

test("fresh visits default to synthwave and terminal requires an explicit switch", async ({
  browser,
}) => {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(baseUrl, { waitUntil: "commit" });
    await expect(page.getByRole("button", { name: "Terminal view" })).toBeVisible();
    await context.close();
  }

  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: "commit" });

  await page.getByRole("button", { name: "Terminal view" }).click();
  // Preload keeps synthwave mounted; the switch control stays a button.
  await expect(page.getByRole("link", { name: "Synthwave layout" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Synthwave layout" })).toBeVisible();

  await page.reload({ waitUntil: "commit" });
  await expect(page.getByRole("button", { name: "Terminal view" })).toBeVisible();
  await context.close();
});

test("terminal layout and rain shader stay idle until the visitor switches", async ({
  page,
}) => {
  const matrixRainRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/shaders/matrix-rain/")) {
      matrixRainRequests.push(request.url());
    }
  });

  await page.goto(baseUrl, { waitUntil: "load" });
  await expect(page.getByRole("button", { name: "Terminal view" })).toBeVisible();
  expect(matrixRainRequests).toEqual([]);

  await page.getByRole("button", { name: "Terminal view" }).click();
  await expect(
    page.getByRole("button", { name: "Terminal view" }).or(page.getByRole("button", { name: "Synthwave layout" }))
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Synthwave layout" })).toHaveCount(0);
  await expect(page.getByRole("banner").getByText(TERMINAL_MASTHEAD)).toBeVisible();
  await expect(page.getByRole("button", { name: "Synthwave layout" })).toBeVisible();
  await expect(page.getByRole("status")).toHaveCount(0);

  await page.getByRole("button", { name: "Synthwave layout" }).click();
  await expect(page.getByRole("button", { name: "Terminal view" })).toBeVisible();
});

test("synthwave hero uses location without repeating the role", async ({ page }) => {
  await page.goto(baseUrl, { waitUntil: "commit" });
  const hero = page.locator(".hero-marquee");

  await expect(hero.getByText("Austin, TX", { exact: true })).toBeVisible();
  await expect(
    hero.getByText("Software Engineer · Applied AI · Austin, TX", { exact: true })
  ).toHaveCount(0);
});
