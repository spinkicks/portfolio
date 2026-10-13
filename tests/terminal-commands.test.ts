import { expect, test } from "@playwright/test";
import { complete, resolve, type Ctx, type Line } from "../app/components/terminal/commands";

function unusedCtx(overrides: Partial<Ctx> = {}): Ctx {
  return {
    goto() {},
    clear() {},
    toSynthwave() {},
    open() {},
    ...overrides,
  };
}

function lineText(line: Line) {
  return "text" in line ? line.text : `${line.key} ${line.text}`;
}

test("unique command prefixes complete to a single name with a trailing space", () => {
  expect(complete("p")).toEqual({
    value: "projects ",
    candidates: ["projects"],
  });
  expect(complete("s")).toEqual({
    value: "skills ",
    candidates: ["skills"],
  });
});

test("open completion uses the full multi-word argument", () => {
  const result = complete("open audio slm d");
  expect(result.candidates).toEqual(["audio slm dataset"]);
  expect(result.value).toBe("open audio slm dataset ");
});

test("ambiguous open prefixes do not open the first target", () => {
  const opened: string[] = [];
  const match = resolve("open audio");
  expect(match).not.toBeNull();

  const lines = match!.command.run(match!.arg, unusedCtx({ open: (url) => opened.push(url) }));
  expect(opened).toEqual([]);
  expect(Array.isArray(lines)).toBe(true);

  const output = (lines as Line[]).map(lineText).join(" ").toLowerCase();
  expect((lines as Line[]).some((line) => line.kind === "error")).toBe(true);
  expect(output).toContain("audio slm");
  expect(output).toContain("dataset");
});

test("open resolves experience company links and deduplicates shared project names", () => {
  const opened: string[] = [];
  const iexMatch = resolve("open iexdevs");
  expect(iexMatch).not.toBeNull();
  iexMatch!.command.run(iexMatch!.arg, unusedCtx({ open: (url) => opened.push(url) }));

  const virgilioMatch = resolve("open virgilio");
  expect(virgilioMatch).not.toBeNull();
  virgilioMatch!.command.run(virgilioMatch!.arg, unusedCtx({ open: (url) => opened.push(url) }));

  expect(opened).toEqual([
    "https://iexdevs.com/",
    "https://www.virgilio.systems/",
  ]);
});
