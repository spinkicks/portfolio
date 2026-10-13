import { expect, test, type Page } from "@playwright/test";
import { portfolioKnowledge } from "../app/api/ask/knowledge";
import {
  awards,
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
  ["Audio SLM", "featured", "development-only"],
  ["Blazing Audio", "featured", "live"],
  ["Speedrun", "featured", "early release"],
  ["GT100K", "featured", "pre-production"],
  ["Agentic Factory v1", "featured", "development-only"],
  ["Turing Machine Runtime Ranking Engine", "featured", "development-only"],
  ["UTMAX", "featured", "live"],
  ["UTMap", "featured", "live"],
  ["keyAC", "featured", "development-only"],
  [
    "Graphics API Telemetry & Energy Efficiency Benchmark",
    "more",
    "development-only",
  ],
  ["Univyrse", "more", "live"],
  ["NeuroBaseline", "more", "prototype"],
  ["Short-Video MVP", "more", "prototype"],
  ["Virgilio Acoustics", "more", "live"],
  ["Illuminate", "more", "live"],
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
  { value: "'28", label: "UT Austin Computer Science" },
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
    if (job.href) {
      await expect(
        record.locator(`a[href="${job.href}"]`),
        `${job.company} is missing company href: ${job.href}`
      ).toHaveAttribute("href", job.href);
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
    if (job.href) {
      await expect(
        panel.locator(`a[href="${job.href}"]`),
        `${job.company} is missing company href: ${job.href}`
      ).toHaveAttribute("href", job.href);
    }
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
  for (const [key, value] of Object.entries(profile)) {
    // The synthwave hero intentionally uses the descriptive tagline instead
    // of repeating the shorter role directly above it.
    if (!terminal && key === "role") continue;
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

  for (const award of awards) {
    await expect(about, `missing award: ${award}`).toContainText(
      matchingText(award)
    );
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

test("Agentic Factory v1 uses Master Resume identity without public URL", () => {
  const factory = richProjects.find(
    (project) => project.name === "Agentic Factory v1"
  );

  expect(factory, "missing Agentic Factory v1 project").toBeDefined();
  expect(factory?.href, "factory must not expose a public URL").toBeUndefined();
  expect(factory?.status).toBe("development-only");
  expect(factory?.year).toBe("2026");
  expect(factory?.stack).toEqual([
    "Python",
    "Bash",
    "Claude Code",
    "Codex",
    "Playwright",
    "systemd",
  ]);
  const detailText = (factory?.details ?? []).join(" ");
  expect(detailText).toMatch(/isolated Git worktrees/);
  expect(detailText).toMatch(/adversarial Playwright QA suite/);
  expect(detailText).toMatch(/systemd Socket-Mode Slack daemon/);
});

test("Audio SLM exposes dataset secondary link and Master Resume evaluation metrics", () => {
  const slm = richProjects.find((project) => project.name === "Audio SLM");

  expect(slm, "missing Audio SLM project").toBeDefined();
  expect(slm?.secondary).toEqual({
    label: "Dataset",
    href: slmDatasetUrl,
  });

  const detailText = (slm?.details ?? []).join(" ");
  expect(detailText).toMatch(/94\.4% headline accuracy/);
  expect(detailText).toMatch(/98\.12% argument validity/);
  expect(detailText).toMatch(/400\+ model downloads/);
  expect(detailText).toMatch(/60\+ dataset downloads/);
});

test("Virgilio Acoustics appears in Experience with company link and in More Projects", () => {
  const virgilioExp = experience.find(
    (job) => job.company === "Virgilio Acoustics"
  );
  expect(virgilioExp, "missing Virgilio Acoustics in experience").toBeDefined();
  expect(virgilioExp?.href).toBe("https://www.virgilio.systems/");
  expect(virgilioExp?.highlights.join(" ")).toMatch(/\$14K revenue/);

  const virgilioProj = richProjects.find(
    (project) => project.name === "Virgilio Acoustics"
  );
  expect(virgilioProj, "missing Virgilio Acoustics project").toBeDefined();
  expect(virgilioProj?.href).toBe("https://www.virgilio.systems/");
});

test("Short-Video MVP links to the short-form-video-app repository", () => {
  const shortVideo = richProjects.find(
    (project) => project.name === "Short-Video MVP"
  );

  expect(shortVideo, "missing Short-Video MVP project").toBeDefined();
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
      .getByRole("heading", { name: "Audio SLM", exact: true })
      .locator("xpath=ancestor::*[self::article or self::li][1]");
    const featuredDetails = featuredRecord.locator("details");
    await expect(
      featuredDetails.getByText("Technical details", { exact: true })
    ).toBeVisible();
    await featuredDetails.locator("summary").click();
    await expect(featuredDetails).toHaveAttribute("open", "");

    const moreRecord = section
      .getByRole("heading", { name: "Univyrse", exact: true })
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
  expect(output).toContain("Agentic Factory v1");
  expect(output).toContain("Turing Machine Runtime Ranking Engine");
  expect(output).toContain("keyAC");
  expect(output).toContain(
    "Graphics API Telemetry & Energy Efficiency Benchmark"
  );
});

test("terminal open command resolves audio slm dataset and iexdevs", async ({
  page,
}) => {
  await openLayout(page, true);

  const popupPromise1 = page.waitForEvent("popup");
  const log1 = await submitTerminalCommand(page, "open audio slm dataset");
  const output1 = await log1.innerText();

  expect(output1).toContain(slmDatasetUrl);
  expect(output1.toLowerCase()).not.toMatch(/\berror\b/);

  const popup1 = await popupPromise1;
  await popup1.close();

  const popupPromise2 = page.waitForEvent("popup");
  const log2 = await submitTerminalCommand(page, "open iexdevs");
  const output2 = await log2.innerText();

  expect(output2).toContain("https://iexdevs.com/");
  const popup2 = await popupPromise2;
  await popup2.close();
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

test("Experience roster matches Master Resume with 7 entries", () => {
  expect(experience.map((job) => job.company)).toEqual([
    "IEXDevs",
    "Alpha AI",
    "Mercor",
    "Chakra Labs",
    "Virgilio Acoustics",
    "Project: Empower",
    "University of Houston",
  ]);

  const iex = experience.find((job) => job.company === "IEXDevs");
  expect(iex?.href).toBe("https://iexdevs.com/");
  expect(iex?.highlights).toHaveLength(6);

  const mercor = experience.find((job) => job.company === "Mercor");
  expect(mercor?.highlights).toHaveLength(2);
  expect(mercor?.highlights.join(" ")).toMatch(/95\.5% reviewer acceptance rate/);
  expect(mercor?.highlights.join(" ")).toMatch(/multi-candidate frontier model outputs/);

  const chakra = experience.find((job) => job.company === "Chakra Labs");
  expect(chakra?.highlights).toHaveLength(2);
  expect(chakra?.highlights.join(" ")).toMatch(/70 completed multi-application trajectories/);
  expect(chakra?.highlights.join(" ")).toMatch(/98% acceptance rate/);

  const empower = experience.find((job) => job.company === "Project: Empower");
  expect(empower?.highlights.join(" ")).toMatch(/1M\+ cumulative pageviews/);
  expect(empower?.highlights.join(" ")).toMatch(/\$112,750/);

  const uh = experience.find((job) => job.company === "University of Houston");
  expect(uh?.highlights.join(" ")).toMatch(/12 simulated traffic networks/);
  expect(uh?.highlights.join(" ")).toMatch(/TraCI/);
});

test("new systems projects contain vetted Master Resume bullets", () => {
  const tmc = richProjects.find(
    (project) => project.name === "Turing Machine Runtime Ranking Engine"
  );
  expect(tmc?.details).toHaveLength(5);
  expect(tmc?.details.join(" ")).toMatch(/90\.1% pairwise accuracy/);
  expect(tmc?.details.join(" ")).toMatch(/99\.67%/);

  const keyAc = richProjects.find((project) => project.name === "keyAC");
  expect(keyAc?.details).toHaveLength(4);
  expect(keyAc?.details.join(" ")).toMatch(/PreciseWaiter/);
  expect(keyAc?.details.join(" ")).toMatch(/Ornstein-Uhlenbeck/);

  const gfx = richProjects.find(
    (project) =>
      project.name === "Graphics API Telemetry & Energy Efficiency Benchmark"
  );
  expect(gfx?.details).toHaveLength(3);
  expect(gfx?.details.join(" ")).toMatch(/0\.727 FPS\/W/);
});

test("Devpost is available in shared links and the synthwave social rail", async ({ page }) => {
  const devpostUrl = "https://devpost.com/davidos";
  expect(links).toContainEqual({ label: "Devpost", href: devpostUrl });

  await openLayout(page, false);
  const socialLinks = page.getByRole("list", { name: "Social links" });
  await expect(
    socialLinks.getByRole("link", { name: "Devpost", exact: true })
  ).toHaveAttribute("href", devpostUrl);
});

test("X is available in shared links and the synthwave social rail", async ({ page }) => {
  const xUrl = "https://x.com/audiuphile";
  expect(links).toContainEqual({ label: "X", href: xUrl });

  await openLayout(page, false);
  const socialLinks = page.getByRole("list", { name: "Social links" });
  await expect(
    socialLinks.getByRole("link", { name: "X", exact: true })
  ).toHaveAttribute("href", xUrl);
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

test("Gemini knowledge includes compact canonical fields", () => {
  const serialized = JSON.stringify(portfolioKnowledge());
  const factValue = (label: string) => facts.find((fact) => fact.label === label)?.value;

  expect(JSON.parse(serialized)).toEqual({
    profile,
    status,
    education: {
      classYear: heroStats[0].value,
      degree: factValue("Education"),
      minor: factValue("Minor"),
    },
    languages: factValue("Languages"),
    focus: factValue("Focus"),
    awards,
    experience,
    projects,
    skills,
    links,
  });
});
