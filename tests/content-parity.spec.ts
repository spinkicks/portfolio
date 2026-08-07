import { expect, test, type Page } from "@playwright/test";
import { portfolioKnowledge } from "../app/api/ask/knowledge";
import {
  experience,
  facts,
  heroStats,
  links,
  profile,
  projects,
  skills,
  status,
} from "../app/content";

const baseUrl = process.env.PORTFOLIO_URL ?? "http://127.0.0.1:8422";

const linkedProjects = projects.filter((project) => project.href);

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function exactText(value: string) {
  return new RegExp(`^${escapeRegex(value)}$`, "i");
}

function matchingText(value: string) {
  return new RegExp(escapeRegex(value), "i");
}

async function openLayout(page: Page, terminal: boolean) {
  await page.addInitScript((showTerminal) => {
    Math.random = () => (showTerminal ? 0.1 : 0.9);
  }, terminal);
  // Turbopack can replace the first document while compiling a cold route.
  // Waiting only for the response commit avoids treating that replacement as
  // a failed navigation; the visible switch below is the real readiness gate.
  await page.goto(baseUrl, { waitUntil: "commit" });
  await expect(
    page.getByRole("button", {
      name: terminal ? "Synthwave layout" : "Terminal view",
    })
  ).toBeVisible();
}

async function expectCanonicalContent(page: Page) {
  const body = (await page.locator("body").innerText()).toLowerCase();
  for (const value of Object.values(profile)) {
    expect(body, `missing profile value: ${value}`).toContain(value.toLowerCase());
  }

  for (const stat of heroStats) {
    const record = page
      .getByText(exactText(stat.label))
      .filter({ visible: true })
      .first()
      .locator("xpath=ancestor::div[1]");
    await expect(record, `missing hero stat: ${stat.label}`).toContainText(stat.value);
  }

  const about = page.locator("#about");
  for (const fact of facts) {
    const record = about
      .getByText(exactText(fact.label))
      .first()
      .locator("xpath=ancestor::div[1]");
    await expect(
      record.getByText(exactText(fact.value)),
      `missing fact: ${fact.label}`
    ).toBeVisible();
  }

  const work = page.locator("#work");
  for (const job of experience) {
    const record = work
      .getByRole("heading", { name: job.company, exact: true })
      .locator("xpath=ancestor::li[1]");
    for (const value of [job.role, job.period]) {
      await expect(
        record.getByText(exactText(value)).first(),
        `${job.company} is missing: ${value}`
      ).toBeVisible();
    }
    for (const value of [job.summary, ...job.highlights]) {
      await expect(record, `${job.company} is missing: ${value}`).toContainText(
        matchingText(value)
      );
    }
    for (const tech of job.stack) {
      await expect(
        record.getByText(exactText(tech)).first(),
        `${job.company} is missing stack item: ${tech}`
      ).toBeVisible();
    }
  }

  const projectSection = page.locator("#projects");
  for (const project of projects) {
    const record = projectSection
      .getByRole("heading", { name: project.name, exact: true })
      .locator("xpath=ancestor::*[self::article or self::li][1]");
    await expect(record, `${project.name} is missing its description`).toContainText(
      matchingText(project.blurb)
    );
    await expect(
      record.getByText(exactText(project.year)).first(),
      `${project.name} is missing year ${project.year}`
    ).toBeVisible();
    for (const tech of project.stack) {
      await expect(
        record.getByText(exactText(tech)).first(),
        `${project.name} is missing stack item: ${tech}`
      ).toBeVisible();
    }
    if (project.href) {
      await expect(record.locator(`a[href="${project.href}"]`)).toHaveAttribute(
        "href",
        project.href
      );
    }
    if (project.secondary) {
      const anchor = record.locator(`a[href="${project.secondary.href}"]`);
      await expect(anchor).toHaveAttribute("href", project.secondary.href);
      await expect(anchor).toContainText(matchingText(project.secondary.label));
    }
  }

  const skillSection = page.locator("#skills");
  for (const group of skills) {
    const record = skillSection
      .getByText(exactText(group.group))
      .first()
      .locator("xpath=ancestor::div[1]");
    for (const item of group.items) {
      await expect(
        record.getByText(exactText(item)).first(),
        `${group.group} is missing: ${item}`
      ).toBeVisible();
    }
  }

  const contact = page.locator("#contact");
  await expect(contact.locator(`a[href="mailto:${profile.email}"]`)).toHaveAttribute(
    "href",
    `mailto:${profile.email}`
  );
  for (const link of links) {
    const anchor = contact.locator(`a[href="${link.href}"]`);
    const record = anchor.locator("xpath=ancestor::li[1]");
    await expect(record, `missing contact link: ${link.label}`).toContainText(
      matchingText(link.label)
    );
    if (link.note) await expect(record).toContainText(link.note);
  }
}

test("terminal renders every hero stat", async ({ page }) => {
  await openLayout(page, true);
  const text = (await page.locator("body").innerText()).toLowerCase();

  for (const stat of heroStats) {
    const label = stat.label.toLowerCase();
    expect(text, `terminal is missing stat label: ${stat.label}`).toContain(label);
    const record = page
      .getByText(exactText(stat.label))
      .filter({ visible: true })
      .first()
      .locator("xpath=ancestor::div[1]");
    await expect(record).toContainText(stat.value);
  }
});

test("availability follows canonical status in both layouts and breakpoints", async ({
  browser,
}) => {
  for (const terminal of [true, false]) {
    for (const width of [390, 1440]) {
      const context = await browser.newContext({
        viewport: { width, height: width === 390 ? 844 : 1000 },
      });
      const page = await context.newPage();
      await openLayout(page, terminal);

      const visibleAvailability = page
        .getByText(exactText(status.detail))
        .filter({ visible: true });
      if (status.open) {
        await expect(visibleAvailability.first()).toBeVisible();
      } else {
        await expect(visibleAvailability).toHaveCount(0);
      }

      await context.close();
    }
  }
});

test("synthwave renders complete navigation and project years", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openLayout(page, false);

  await expect(page.getByRole("link", { name: "Skills", exact: true })).toBeVisible();

  for (const project of linkedProjects) {
    const card = page
      .getByRole("heading", { name: project.name, exact: true })
      .locator("xpath=ancestor::article[1]");
    await expect(card).toContainText(project.year);
  }
});

test("both layouts render every canonical portfolio field", async ({ page }) => {
  await openLayout(page, true);
  await expectCanonicalContent(page);

  const synthwave = await page.context().newPage();
  await openLayout(synthwave, false);
  await expectCanonicalContent(synthwave);
  await synthwave.close();
});

test("Gemini knowledge includes hero stats", () => {
  const serialized = JSON.stringify(portfolioKnowledge());

  expect(JSON.parse(serialized)).toEqual({
    profile,
    status,
    heroStats,
    facts,
    experience,
    projects,
    skills,
    links,
  });
});
