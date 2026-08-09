import { expect, test, type Page } from "@playwright/test";

const baseUrl = process.env.PORTFOLIO_URL ?? "http://127.0.0.1:8422";

/** Final composite CRT material contract. */
const CRT = {
  grain: {
    animationName: "grain-signal",
    forbiddenAnimation: "grain-drift",
    durationSec: 0.52,
    containerOpacity: 0.68,
    coarseOpacity: 0.42,
    baseFrequencyFine: "0.78",
    baseFrequencyCoarse: "0.42",
    forbiddenKeyframeProps: ["background-position", "opacity"] as const,
  },
  scanlines: {
    bandAlpha: 0.055,
    legacyBandAlpha: 0.16,
    gradeMinAlpha: 0.03,
    gradeMaxAlpha: 0.04,
    vignetteMaxAlpha: 0.35,
    apertureOpacity: 0.1,
    apertureBackgroundSize: "3px",
  },
  roll: {
    heightVh: 10,
    durationSec: 8,
    animationName: "crt-roll",
    maxPeakAlpha: 0.03,
    scrollFadeStartVh: 0.84,
    scrollFadeEndVh: 1.39,
    minOpacity: 0.19,
    maxOpacity: 1,
  },
} as const;

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

async function selectSunsetDrive(page: Page) {
  const driveButton = page.getByRole("radio", { name: "Sunset Drive", exact: true });
  await driveButton.click();
  await expect(driveButton).toHaveAttribute("aria-checked", "true");
}

type LayerStyles = {
  zIndex: string;
  pointerEvents: string;
  position: string;
};

async function readLayerStyles(page: Page, selector: string): Promise<LayerStyles> {
  return page.locator(selector).evaluate((el) => {
    const style = getComputedStyle(el);
    return {
      zIndex: style.zIndex,
      pointerEvents: style.pointerEvents,
      position: style.position,
    };
  });
}

async function readPseudoStyles(page: Page, selector: string, pseudo: string) {
  return page.locator(selector).evaluate(
    (el, pseudoSelector) => {
      const style = getComputedStyle(el, pseudoSelector);
      return {
        content: style.content,
        display: style.display,
        backgroundImage: style.backgroundImage,
        backgroundSize: style.backgroundSize,
        height: style.height,
        animationName: style.animationName,
        animationDuration: style.animationDuration,
        animationTimingFunction: style.animationTimingFunction,
        mixBlendMode: style.mixBlendMode,
        opacity: style.opacity,
      };
    },
    pseudo
  );
}

function parseAlphaFromGradient(gradient: string): number {
  const matches = gradient.match(/rgba?\([^)]+\)/g) ?? [];
  let max = 0;
  for (const token of matches) {
    const parts = token.replace(/rgba?\(|\)/g, "").split(/,\s*/);
    const alpha =
      parts.length === 4 ? Number.parseFloat(parts[3]) : parts.length === 3 ? 1 : 0;
    if (!Number.isNaN(alpha)) {
      max = Math.max(max, alpha);
    }
  }
  return max;
}

function parseDurationSeconds(duration: string): number {
  if (duration.endsWith("ms")) {
    return Number.parseFloat(duration) / 1000;
  }
  return Number.parseFloat(duration);
}

async function readKeyframeTransforms(page: Page, animationName: string) {
  return page.evaluate((name) => {
    const frames: Record<string, string> = {};

    const walkRules = (rules: CSSRuleList | CSSRule[]) => {
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSKeyframesRule && rule.name === name) {
          for (const keyframe of Array.from(rule.cssRules)) {
            if (keyframe instanceof CSSKeyframeRule) {
              frames[keyframe.keyText] = keyframe.style.transform;
            }
          }
        }
        if ("cssRules" in rule && rule.cssRules) {
          walkRules(rule.cssRules);
        }
      }
    };

    for (const sheet of Array.from(document.styleSheets)) {
      try {
        walkRules(sheet.cssRules);
      } catch {
        // Cross-origin stylesheets are not readable.
      }
    }

    return frames;
  }, animationName);
}

async function readKeyframePropertyNames(page: Page, animationName: string) {
  return page.evaluate((name) => {
    const props = new Set<string>();

    const walkRules = (rules: CSSRuleList | CSSRule[]) => {
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSKeyframesRule && rule.name === name) {
          for (const keyframe of Array.from(rule.cssRules)) {
            if (keyframe instanceof CSSKeyframeRule) {
              for (let i = 0; i < keyframe.style.length; i += 1) {
                props.add(keyframe.style[i]);
              }
            }
          }
        }
        if ("cssRules" in rule && rule.cssRules) {
          walkRules(rule.cssRules);
        }
      }
    };

    for (const sheet of Array.from(document.styleSheets)) {
      try {
        walkRules(sheet.cssRules);
      } catch {
        // Cross-origin stylesheets are not readable.
      }
    }

    return Array.from(props);
  }, animationName);
}

function keyframeTransform(
  frames: Record<string, string>,
  key: "from" | "to" | "0%" | "100%"
) {
  if (key === "from") return frames.from ?? frames["0%"] ?? "";
  if (key === "to") return frames.to ?? frames["100%"] ?? "";
  return frames[key] ?? "";
}

test.describe("CRT final material contract", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openSynthwave(page);
    await selectSunsetDrive(page);
  });

  test("does not expose A/B comparison controls or variant root classes", async ({ page }) => {
    await expect(page.getByRole("radiogroup", { name: "CRT comparison" })).toHaveCount(0);
    await expect(page.getByRole("radio", { name: "Original CRT" })).toHaveCount(0);
    await expect(page.getByRole("radio", { name: "Reference CRT" })).toHaveCount(0);
    await expect(page.locator(".crt-original")).toHaveCount(0);
    await expect(page.locator(".crt-reference")).toHaveCount(0);
  });

  test("overlay layers preserve z-index, pointer-events, and fixed positioning", async ({
    page,
  }) => {
    const scanlines = await readLayerStyles(page, ".scanlines");
    const roll = await readLayerStyles(page, ".crt-roll");
    const grain = await readLayerStyles(page, ".grain");
    const frame = await readLayerStyles(page, ".frame-edge");

    expect(scanlines).toEqual({
      zIndex: "43",
      pointerEvents: "none",
      position: "fixed",
    });
    expect(roll).toEqual({
      zIndex: "44",
      pointerEvents: "none",
      position: "fixed",
    });
    expect(grain).toEqual({
      zIndex: "45",
      pointerEvents: "none",
      position: "fixed",
    });
    expect(frame.zIndex).toBe("40");
    expect(frame.pointerEvents).toBe("none");
  });

  test("grain container is fixed opacity with compositor-only pseudo turbulence", async ({
    page,
  }) => {
    const grain = await page.locator(".grain").evaluate((el) => {
      const style = getComputedStyle(el);
      const before = getComputedStyle(el, "::before");
      const after = getComputedStyle(el, "::after");
      return {
        opacity: style.opacity,
        animationName: style.animationName,
        animationDuration: style.animationDuration,
        backgroundImage: style.backgroundImage,
        overflow: style.overflow,
        fineBackgroundImage: before.backgroundImage,
        fineAnimationName: before.animationName,
        fineAnimationTimingFunction: before.animationTimingFunction,
        fineAnimationDuration: before.animationDuration,
        fineWillChange: before.willChange,
        coarseOpacity: after.opacity,
        coarseBackgroundImage: after.backgroundImage,
        coarseAnimationName: after.animationName,
        coarseAnimationTimingFunction: after.animationTimingFunction,
        coarseAnimationDuration: after.animationDuration,
        coarseMixBlendMode: after.mixBlendMode,
        coarseWillChange: after.willChange,
      };
    });

    expect(Number.parseFloat(grain.opacity)).toBeCloseTo(CRT.grain.containerOpacity, 2);
    expect(grain.animationName === "none" || grain.animationDuration === "0s").toBe(true);
    expect(grain.backgroundImage === "none" || grain.backgroundImage === "").toBe(true);
    expect(grain.overflow).toBe("hidden");

    expect(grain.fineBackgroundImage).toContain(CRT.grain.baseFrequencyFine);
    expect(grain.fineAnimationName).toContain(CRT.grain.animationName);
    expect(grain.fineAnimationName).not.toContain(CRT.grain.forbiddenAnimation);
    expect(grain.fineAnimationTimingFunction).toMatch(/steps/i);
    expect(parseDurationSeconds(grain.fineAnimationDuration)).toBeCloseTo(
      CRT.grain.durationSec,
      2
    );
    expect(grain.fineWillChange).toContain("transform");

    expect(Number.parseFloat(grain.coarseOpacity)).toBeCloseTo(CRT.grain.coarseOpacity, 2);
    expect(grain.coarseBackgroundImage).toContain(CRT.grain.baseFrequencyCoarse);
    expect(grain.coarseAnimationName === "none" || grain.coarseAnimationDuration === "0s").toBe(
      true
    );
    expect(grain.coarseMixBlendMode).toBe("overlay");
    expect(grain.coarseWillChange === "auto" || grain.coarseWillChange === "").toBe(true);
  });

  test("grain keyframes animate transform only", async ({ page }) => {
    const props = await readKeyframePropertyNames(page, CRT.grain.animationName);
    expect(props.length).toBeGreaterThan(0);
    for (const prop of props) {
      expect(prop).toBe("transform");
    }
    for (const forbidden of CRT.grain.forbiddenKeyframeProps) {
      expect(props).not.toContain(forbidden);
    }

    const keyframes = await readKeyframeTransforms(page, CRT.grain.animationName);
    expect(keyframeTransform(keyframes, "0%")).toMatch(/translate3d/i);
    expect(keyframeTransform(keyframes, "100%")).toMatch(/translate3d/i);
  });

  test("scanlines use fine pitch with uniform ink grade and no coarse bands", async ({
    page,
  }) => {
    const styles = await page.locator(".scanlines").evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        backgroundImage: style.backgroundImage,
        backgroundColor: style.backgroundColor,
      };
    });

    expect(styles.backgroundImage).toContain("repeating-linear-gradient");
    expect(styles.backgroundImage).toMatch(
      new RegExp(`rgba\\(0,\\s*0,\\s*0,\\s*${CRT.scanlines.bandAlpha}\\)`)
    );
    expect(styles.backgroundImage).not.toMatch(
      new RegExp(`rgba\\(0,\\s*0,\\s*0,\\s*${CRT.scanlines.legacyBandAlpha}\\)`)
    );
    expect(styles.backgroundImage).toMatch(/1px/);
    expect(styles.backgroundImage).toMatch(/2px/);
    expect(styles.backgroundImage).not.toMatch(/3px/);
    expect(styles.backgroundColor).toMatch(/rgba?\(4,\s*2,\s*12/);
    const gradeAlpha = parseAlphaFromGradient(styles.backgroundColor);
    expect(gradeAlpha).toBeGreaterThanOrEqual(CRT.scanlines.gradeMinAlpha);
    expect(gradeAlpha).toBeLessThanOrEqual(CRT.scanlines.gradeMaxAlpha + 0.005);
  });

  test("scanlines expose reduced RGB aperture and stronger vignette", async ({ page }) => {
    const aperture = await readPseudoStyles(page, ".scanlines", "::before");
    const vignette = await readPseudoStyles(page, ".scanlines", "::after");

    expect(aperture.content).not.toBe("none");
    expect(aperture.display).not.toBe("none");
    expect(aperture.backgroundImage).toContain("repeating-linear-gradient");
    expect(aperture.backgroundSize).toContain(CRT.scanlines.apertureBackgroundSize);
    expect(Number.parseFloat(aperture.opacity)).toBeCloseTo(CRT.scanlines.apertureOpacity, 2);

    expect(vignette.backgroundImage).toContain("radial-gradient");
    const maxAlpha = parseAlphaFromGradient(vignette.backgroundImage);
    expect(maxAlpha).toBeCloseTo(CRT.scanlines.vignetteMaxAlpha, 2);
  });

  test("roll uses 10vh bottom-to-top band at 8s with soft peak", async ({ page }) => {
    const roll = await readPseudoStyles(page, ".crt-roll", "::before");
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    const bandHeightPx = Number.parseFloat(roll.height);
    const expectedHeight = (CRT.roll.heightVh / 100) * viewportHeight;

    expect(bandHeightPx).toBeGreaterThanOrEqual(expectedHeight * 0.92);
    expect(bandHeightPx).toBeLessThanOrEqual(expectedHeight * 1.08);
    expect(parseDurationSeconds(roll.animationDuration)).toBeCloseTo(CRT.roll.durationSec, 2);
    expect(roll.animationName).toContain(CRT.roll.animationName);
    expect(roll.mixBlendMode).toBe("screen");

    const peakAlpha = parseAlphaFromGradient(roll.backgroundImage);
    expect(peakAlpha).toBeLessThanOrEqual(CRT.roll.maxPeakAlpha);
    expect(peakAlpha).toBeGreaterThan(0.015);
  });

  test("roll keyframes travel from +100vh to -10vh", async ({ page }) => {
    const keyframes = await readKeyframeTransforms(page, CRT.roll.animationName);
    expect(keyframeTransform(keyframes, "from")).toContain("100vh");
    expect(keyframeTransform(keyframes, "to")).toContain("-10vh");
  });

  test("roll layer stays full opacity through hero", async ({ page }) => {
    const opacity = await page.locator(".crt-roll").evaluate((el) =>
      Number.parseFloat(getComputedStyle(el).opacity)
    );
    expect(opacity).toBeCloseTo(CRT.roll.maxOpacity, 1);
  });

  test("roll layer fades to backdrop visibility and clamps deeper", async ({ page }) => {
    await page.evaluate(() => {
      window.scrollTo(0, window.innerHeight * 3);
    });

    await expect
      .poll(async () =>
        page.locator(".crt-roll").evaluate((el) =>
          Number.parseFloat(getComputedStyle(el).opacity)
        )
      )
      .toBeCloseTo(CRT.roll.minOpacity, 2);

    await page.evaluate(() => {
      window.scrollTo(0, window.innerHeight * 5);
    });

    await expect
      .poll(async () =>
        page.locator(".crt-roll").evaluate((el) =>
          Number.parseFloat(getComputedStyle(el).opacity)
        )
      )
      .toBeCloseTo(CRT.roll.minOpacity, 2);
  });

  test("roll animation duration stays 8s at hero and deep scroll", async ({ page }) => {
    const readDuration = async () => {
      const roll = await readPseudoStyles(page, ".crt-roll", "::before");
      return parseDurationSeconds(roll.animationDuration);
    };

    expect(await readDuration()).toBeCloseTo(CRT.roll.durationSec, 2);

    await page.evaluate(() => {
      window.scrollTo(0, window.innerHeight * 3);
    });

    expect(await readDuration()).toBeCloseTo(CRT.roll.durationSec, 2);
  });
});

test.describe("CRT reduced motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openSynthwave(page);
    await selectSunsetDrive(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("hides roll band without parking a bright seam", async ({ page }) => {
    const roll = await readPseudoStyles(page, ".crt-roll", "::before");
    expect(roll.display).toBe("none");
  });

  test("stops grain pseudo-layer animation without a parked offset", async ({ page }) => {
    const grain = await page.locator(".grain").evaluate((el) => {
      const before = getComputedStyle(el, "::before");
      const after = getComputedStyle(el, "::after");
      return {
        beforeAnimationDuration: before.animationDuration,
        beforeAnimationIterationCount: before.animationIterationCount,
        beforeTransform: before.transform,
        afterAnimationDuration: after.animationDuration,
        afterAnimationIterationCount: after.animationIterationCount,
        afterTransform: after.transform,
      };
    });

    expect(parseDurationSeconds(grain.beforeAnimationDuration)).toBeLessThanOrEqual(0.02);
    expect(grain.beforeAnimationIterationCount).toBe("1");
    expect(parseDurationSeconds(grain.afterAnimationDuration)).toBeLessThanOrEqual(0.02);
    expect(grain.afterAnimationIterationCount).toBe("1");
    expect(grain.beforeTransform === "none" || grain.beforeTransform.includes("matrix(1, 0, 0, 1, 0, 0)")).toBe(
      true
    );
    expect(grain.afterTransform === "none" || grain.afterTransform.includes("matrix(1, 0, 0, 1, 0, 0)")).toBe(
      true
    );
  });
});

test("CRT comparison control is absent in terminal layout", async ({ page }) => {
  await page.goto(baseUrl, { waitUntil: "commit" });
  const synthwaveButton = page.getByRole("button", { name: "Synthwave layout", exact: true });
  const terminalButton = page.getByRole("button", { name: "Terminal view", exact: true });

  await expect(terminalButton.or(synthwaveButton)).toBeVisible();
  if (await terminalButton.isVisible()) {
    await terminalButton.click();
  }

  await expect(synthwaveButton).toBeVisible();
  await expect(page.getByRole("radiogroup", { name: "CRT comparison" })).toHaveCount(0);
});
