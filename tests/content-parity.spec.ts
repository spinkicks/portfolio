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

const expectedProjectContract = [
  ["Subwoofer Central", "featured", "live"],
  ["Small Learning Model", "featured", "development-only"],
  ["GT100K", "featured", "pre-production"],
  ["Agentic Software Factory v1", "featured", "development-only"],
  ["Blazing Audio", "featured", "live"],
  ["Univyrse", "featured", "live"],
  ["NeuroBaseline", "featured", "prototype"],
  ["Speedrun", "featured", "early release"],
  ["Virgilio Acoustics", "more", "live"],
  ["UTMAX", "more", "live"],
  ["UTMap", "more", "live"],
  ["Illuminate", "more", "live"],
  ["Short-video MVP", "more", "prototype"],
] as const;

type RichProject = {
  name: string;
  tier: "featured" | "more";
  status:
    | "live"
    | "early release"
    | "development-only"
    | "pre-production"
    | "prototype";
  summary: string;
  details: string[];
  stack: string[];
  href?: string;
  secondary?: { label: string; href: string };
  year: string;
};

const expectedHeroStats = [
  { value: "'28", label: "UT Austin BS CS" },
] as const;

const slmDatasetUrl =
  "https://huggingface.co/datasets/audiuphile/blazing-audio-slm-v7-4-dataset-dev";

const richProjects = projects as unknown as RichProject[];
const linkedProjects = richProjects.filter((project) => project.href);

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
  const inLayoutSwitch = terminal ? "Synthwave layout" : "Terminal view";
  const toLayoutSwitch = terminal ? "Terminal view" : "Synthwave layout";

  // Turbopack can replace the first document while compiling a cold route.
  // Waiting only for the response commit avoids treating that replacement as
  // a failed navigation; the visible switch below is the real readiness gate.
  await page.goto(baseUrl, { waitUntil: "commit" });

  const inLayoutButton = page.getByRole("button", {
    name: inLayoutSwitch,
    exact: true,
  });
  const toLayoutButton = page.getByRole("button", {
    name: toLayoutSwitch,
    exact: true,
  });

  await expect(inLayoutButton.or(toLayoutButton)).toBeVisible();

  if (await toLayoutButton.isVisible()) {
    await toLayoutButton.click();
  }

  await expect(inLayoutButton).toBeVisible();
}

async function fillTerminalCommand(page: Page, command: string) {
  const input = page.getByRole("textbox", { name: "Terminal command" });
  await input.click();
  await input.fill(command);
  await expect(input).toHaveValue(command);
  return input;
}

async function submitTerminalCommand(page: Page, command: string) {
  const input = await fillTerminalCommand(page, command);
  await input.press("Enter");
  await expect(input).toHaveValue("");
  return page.locator('[aria-live="polite"]');
}

async function expectTerminalExperienceContent(page: Page) {
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
}

async function scrollSynthwaveWorkSection(page: Page) {
  const tab0 = page.locator("#experience-tab-0");
  await tab0.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -100));
}

async function activateExperienceTab(page: Page, index: number) {
  const tab = page.locator(`#experience-tab-${index}`);
  await tab.scrollIntoViewIfNeeded();
  await tab.click();
}

async function pressExperienceTabKey(page: Page, index: number, key: string) {
  const tab = page.locator(`#experience-tab-${index}`);
  await tab.scrollIntoViewIfNeeded();
  await tab.focus();
  await tab.press(key);
}

async function expectSynthwaveExperienceTabs(page: Page) {
  const work = page.locator("#work");
  await scrollSynthwaveWorkSection(page);

  const tablist = work.getByRole("tablist", { name: /experience roles/i });
  const tabs = tablist.getByRole("tab");
  const panel = work.locator("#experience-focus-panel");

  await expect(tabs).toHaveCount(experience.length);

  await tabs.first().focus();

  for (let index = 0; index < experience.length; index += 1) {
    const tab = tabs.nth(index);
    const job = experience[index];

    await expect(tab).toContainText(job.company);
    await expect(tab).toContainText(job.role);
    await expect(tab).toContainText(job.period);
    await expect(tab).toHaveAttribute("aria-controls", "experience-focus-panel");
    await expect(tab).toHaveAttribute("id", `experience-tab-${index}`);

    if (index > 0) {
      await activateExperienceTab(page, index);
    }

    await expect(tab).toHaveAttribute("aria-selected", "true");
    await expect(panel).toHaveAttribute(
      "aria-labelledby",
      `experience-tab-${index}`
    );

    await expect(
      panel.getByRole("heading", { name: job.company, exact: true })
    ).toBeVisible();
    for (const value of [job.role, job.period, job.summary]) {
      await expect(panel, `${job.company} is missing: ${value}`).toContainText(
        matchingText(value)
      );
    }
    for (const highlight of job.highlights) {
      await expect(
        panel,
        `${job.company} is missing highlight: ${highlight}`
      ).toContainText(matchingText(highlight));
    }
    for (const tech of job.stack) {
      await expect(
        panel.getByText(exactText(tech)).first(),
        `${job.company} is missing stack item: ${tech}`
      ).toBeVisible();
    }
  }

  await activateExperienceTab(page, 0);
  const orientation = await tablist.getAttribute("aria-orientation");
  await pressExperienceTabKey(
    page,
    0,
    orientation === "vertical" ? "ArrowDown" : "ArrowRight"
  );
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(tabs.nth(1)).toHaveAttribute("tabindex", "0");
  await expect(tabs.first()).toHaveAttribute("aria-selected", "false");
  await expect(tabs.first()).toHaveAttribute("tabindex", "-1");

  await activateExperienceTab(page, 1);
  for (const highlight of experience[1].highlights) {
    await expect(panel).toContainText(highlight);
  }

  await activateExperienceTab(page, 2);
  await expect(tabs.nth(2)).toHaveAttribute("aria-selected", "true");
  await expect(panel).toContainText(experience[2].company);
}

async function expectCanonicalContent(page: Page, terminal: boolean) {
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

  if (terminal) {
    await expectTerminalExperienceContent(page);
  } else {
    await expectSynthwaveExperienceTabs(page);
  }

  const projectSection = page.locator("#projects");
  for (const project of richProjects) {
    const record = projectSection
      .getByRole("heading", { name: project.name, exact: true })
      .locator("xpath=ancestor::*[self::article or self::li][1]");

    await expect(record, `${project.name} is missing its summary`).toContainText(
      matchingText(project.summary)
    );
    await expect(record, `${project.name} is missing its status`).toContainText(
      project.status
    );
    await expect(
      record.getByText(exactText(project.year)).first(),
      `${project.name} is missing year ${project.year}`
    ).toBeVisible();

    for (const detail of project.details) {
      await expect(
        record,
        `${project.name} is missing technical detail: ${detail}`
      ).toContainText(matchingText(detail));
    }
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
      const secondaryLink = record.locator(`a[href="${project.secondary.href}"]`);
      await expect(
        secondaryLink,
        `${project.name} is missing secondary link: ${project.secondary.label}`
      ).toHaveAttribute("href", project.secondary.href);
      await expect(
        secondaryLink,
        `${project.name} secondary link is missing label: ${project.secondary.label}`
      ).toContainText(matchingText(project.secondary.label));
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
  }
}

async function featuredGridColumnCount(page: Page) {
  const section = page.locator("#projects");
  const featuredList = section.locator("ol").first();

  await expect(featuredList).toBeVisible();

  return featuredList.evaluate((list) => {
    const columns = window
      .getComputedStyle(list)
      .gridTemplateColumns.split(" ")
      .filter((value) => value && value !== "none");
    return columns.length;
  });
}

async function expectProjectPresentation(page: Page) {
  const section = page.locator("#projects");

  await expect(
    section.getByRole("heading", { name: "Featured Work", exact: true })
  ).toBeVisible();
  await expect(
    section.getByRole("heading", { name: "More Projects", exact: true })
  ).toBeVisible();

  for (const [name, , status] of expectedProjectContract) {
    const record = section
      .getByRole("heading", { name, exact: true })
      .locator("xpath=ancestor::*[self::article or self::li][1]");

    await expect(record, `${name} is missing status ${status}`).toContainText(
      status
    );
    await expect(
      record.getByText("Technical details", { exact: true }),
      `${name} is missing its technical disclosure`
    ).toBeVisible();
  }
}

test("heroStats exposes exactly one UT Austin credential", () => {
  expect(heroStats).toEqual([...expectedHeroStats]);
});

test("factory project uses generic identity without public URL", () => {
  const factory = richProjects.find(
    (project) => project.name === "Agentic Software Factory v1"
  );

  expect(factory, "missing Agentic Software Factory v1 project").toBeDefined();
  expect(factory?.href, "factory must not expose a public URL").toBeUndefined();
});

test("Agentic Software Factory v1 summary and details describe loop harnesses and self-QA agents", () => {
  const factory = richProjects.find(
    (project) => project.name === "Agentic Software Factory v1"
  );

  expect(factory, "missing Agentic Software Factory v1 project").toBeDefined();
  expect(factory?.summary).toMatch(/loop harnesses/i);
  expect(factory?.summary).toMatch(/self-QA agents/i);
  expect(factory?.summary).toBe(
    "Cross-project agentic software factory built around bounded Claude and Codex loop harnesses, self-QA agents, deterministic gates, recovery, browser QA, and pull-request delivery."
  );
  expect(factory?.details).toEqual([
    "Runs repeated builder-review loops in isolated worktrees with file-backed cross-turn state, time and no-progress caps, and stranded-run recovery.",
    "Self-QA agents combine semantic browser walks, screenshot and pixel checks, model and deterministic graders, and specialized review panels.",
    "Used across GT100K and Subwoofer Central with host-side Git controls and pull-request delivery; the repository remains private.",
  ]);
  expect(factory?.status).toBe("development-only");
  expect(factory?.year).toBe("2026");
  expect(factory?.stack).toEqual(["Python", "Bash", "Claude", "Codex"]);
});

test("Small Learning Model exposes dataset secondary link and download metrics", () => {
  const slm = richProjects.find((project) => project.name === "Small Learning Model");

  expect(slm, "missing Small Learning Model project").toBeDefined();
  expect(slm?.secondary).toEqual({
    label: "Dataset",
    href: slmDatasetUrl,
  });

  const detailText = (slm?.details ?? []).join(" ");
  expect(detailText).toMatch(/377 model downloads/);
  expect(detailText).toMatch(/50 dataset downloads/);
});

test("Virgilio Acoustics summary states founder ownership and revenue", () => {
  const virgilio = richProjects.find(
    (project) => project.name === "Virgilio Acoustics"
  );

  expect(virgilio, "missing Virgilio Acoustics project").toBeDefined();
  expect(virgilio?.summary).toMatch(/founded/i);
  expect(virgilio?.summary).toMatch(/virgilio acoustics/i);
  expect(virgilio?.summary).toMatch(/\$3,000\+ in revenue/);
});

test("Short-video MVP links to the short-form-video-app repository", () => {
  const shortVideo = richProjects.find(
    (project) => project.name === "Short-video MVP"
  );

  expect(shortVideo, "missing Short-video MVP project").toBeDefined();
  expect(shortVideo?.href).toBe(
    "https://github.com/spinkicks/short-form-video-app"
  );
});

test("canonical projects carry the approved order, tier, status, and detail model", () => {
  const records = projects as unknown as Array<Record<string, unknown>>;

  expect(
    records.map((project) => [
      project.name,
      project.tier,
      project.status,
    ])
  ).toEqual(expectedProjectContract);

  for (const project of records) {
    expect(project.summary, `${project.name} needs a concise summary`).toEqual(
      expect.any(String)
    );
    expect(
      (project.summary as string).length,
      `${project.name} summary is too long`
    ).toBeLessThanOrEqual(260);
    expect(project.details, `${project.name} needs technical details`).toEqual(
      expect.any(Array)
    );
    expect(
      (project.details as unknown[]).length,
      `${project.name} needs at least one technical detail`
    ).toBeGreaterThan(0);
  }
});

for (const layout of [
  { name: "terminal", terminal: true },
  { name: "synthwave", terminal: false },
] as const) {
  test(`${layout.name} exposes project tiers, statuses, and technical disclosures`, async ({
    page,
  }) => {
    await openLayout(page, layout.terminal);
    await expectProjectPresentation(page);
  });

  test(`${layout.name} opens technical disclosures on mobile`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openLayout(page, layout.terminal);
    await expectProjectPresentation(page);

    const section = page.locator("#projects");

    const featuredRecord = section
      .getByRole("heading", { name: "Small Learning Model", exact: true })
      .locator("xpath=ancestor::*[self::article or self::li][1]");
    const featuredDetails = featuredRecord.locator("details");
    await expect(
      featuredDetails.getByText("Technical details", { exact: true })
    ).toBeVisible();
    await featuredDetails.locator("summary").click();
    await expect(featuredDetails).toHaveAttribute("open", "");

    const moreRecord = section
      .getByRole("heading", { name: "UTMAX", exact: true })
      .locator("xpath=ancestor::*[self::article or self::li][1]");
    const moreDetails = moreRecord.locator("details");
    await expect(
      moreDetails.getByText("Technical details", { exact: true })
    ).toBeVisible();
    await moreDetails.locator("summary").click();
    await expect(moreDetails).toHaveAttribute("open", "");
  });
}

test("terminal projects command lists featured and more work", async ({ page }) => {
  await openLayout(page, true);

  const log = await submitTerminalCommand(page, "projects");
  await expect(log).toContainText("Featured work");
  const output = await log.innerText();

  expect(output).toContain("Featured work");
  expect(output).toContain("More projects");
  expect(output).toMatch(/development-only/);
  expect(output).toContain("Agentic Software Factory v1");
  expect(output).not.toContain("GT100K Factory");
  expect(output).not.toMatch(
    /agentic[\s-]*software[\s-]*factory.*https?:\/\//i
  );
});

test("terminal open command resolves small learning model dataset", async ({
  page,
}) => {
  await openLayout(page, true);

  const popupPromise = page.waitForEvent("popup");
  const log = await submitTerminalCommand(page, "open small learning model dataset");
  const output = await log.innerText();

  expect(output).toContain(slmDatasetUrl);
  expect(output.toLowerCase()).not.toMatch(/\berror\b/);

  const popup = await popupPromise;
  await popup.close();
});

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

test("synthwave Featured Work list uses two columns at 1440px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openLayout(page, false);

  expect(await featuredGridColumnCount(page)).toBe(2);
});

test("synthwave Featured Work list uses one column at 390px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openLayout(page, false);

  expect(await featuredGridColumnCount(page)).toBe(1);
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

test("Mercor highlights frame 0.5% as problem-set coverage, not accuracy gain", () => {
  const mercor = experience.find((job) => job.company === "Mercor Intelligence");

  expect(mercor, "missing Mercor Intelligence experience").toBeDefined();
  const text = mercor!.highlights.join(" ");
  expect(text).toMatch(/3,000/);
  expect(text).toMatch(/15/);
  expect(text).toMatch(/0\.5%/);
  expect(text.toLowerCase()).toMatch(/share of problems corrected/);
  expect(text.toLowerCase()).not.toMatch(/accuracy/);
  expect(mercor!.stack).toContain("Python");
});

test("Empower highlights retain scale metrics and Illuminate delivery context", () => {
  const empower = experience.find((job) => job.company === "Project: Empower");

  expect(empower, "missing Project: Empower experience").toBeDefined();
  const text = [...empower!.highlights, empower!.summary].join(" ");
  expect(text).toMatch(/60\+ chapters/);
  expect(text).toMatch(/10 countries/);
  expect(text).toMatch(/621/);
  expect(text).toMatch(/\$112,750/);
  expect(text).toMatch(/1M/);
  expect(text).toMatch(/GA4/);
  expect(text).toMatch(/Tailwind/);
  expect(text).toMatch(/team of five/i);
  expect(empower!.stack).toContain("Node.js");
  expect(empower!.stack).toContain("Tailwind CSS");
});

test("University of Houston highlights cover simulation and TraCI automation context", () => {
  const uh = experience.find((job) => job.company === "University of Houston");

  expect(uh, "missing University of Houston experience").toBeDefined();
  const text = [...uh!.highlights, uh!.summary].join(" ");
  expect(text).toMatch(/SUMO/i);
  expect(text).toMatch(/TraCI/i);
  expect(text).toMatch(/traffic-flow phenomena/i);
  expect(text.toLowerCase()).not.toMatch(/publication/);
  expect(text.toLowerCase()).not.toMatch(/trained model/);
});

test("experience uses the Alpha AI organization name", () => {
  expect(experience.some((job) => job.company === "Alpha AI")).toBe(true);
});

test("terminal layout renders list-based experience content", async ({ page }) => {
  await openLayout(page, true);
  await expectTerminalExperienceContent(page);
});

test("synthwave Experience uses tab interface with keyboard navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openLayout(page, false);
  await expectSynthwaveExperienceTabs(page);
});

test("synthwave Experience tablist is vertical on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openLayout(page, false);

  await scrollSynthwaveWorkSection(page);

  const work = page.locator("#work");

  const tablist = work.getByRole("tablist", { name: /experience roles/i });
  await expect(tablist).toHaveAttribute("aria-orientation", "vertical");

  const tabs = tablist.getByRole("tab");
  await activateExperienceTab(page, 0);
  await pressExperienceTabKey(page, 0, "ArrowDown");
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
});

test("both layouts render every canonical portfolio field", async ({ page }) => {
  await openLayout(page, true);
  await expectCanonicalContent(page, true);

  const synthwave = await page.context().newPage();
  await openLayout(synthwave, false);
  await expectCanonicalContent(synthwave, false);
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
