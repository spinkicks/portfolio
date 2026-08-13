import { expect, test } from "@playwright/test";

const baseUrl = process.env.PORTFOLIO_URL ?? "http://127.0.0.1:8422";

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
  await expect(page.getByRole("button", { name: "Synthwave layout" })).toBeVisible();

  await page.reload({ waitUntil: "commit" });
  await expect(page.getByRole("button", { name: "Terminal view" })).toBeVisible();
  await context.close();
});
