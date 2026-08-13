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
  const result = complete("open small learning model d");
  expect(result.candidates).toEqual(["small learning model dataset"]);
  expect(result.value).toBe("open small learning model dataset ");
});

test("ambiguous open prefixes do not open the first target", () => {
  const opened: string[] = [];
  const match = resolve("open small");
  expect(match).not.toBeNull();

  const lines = match!.command.run(match!.arg, unusedCtx({ open: (url) => opened.push(url) }));
  expect(opened).toEqual([]);
  expect(Array.isArray(lines)).toBe(true);

  const output = (lines as Line[]).map(lineText).join(" ").toLowerCase();
  expect((lines as Line[]).some((line) => line.kind === "error")).toBe(true);
  expect(output).toContain("small learning model");
  expect(output).toContain("dataset");
});
