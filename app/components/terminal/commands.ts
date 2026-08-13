import {
  experience,
  featuredProjects,
  links,
  moreProjects,
  profile,
  projects,
  skills,
  status,
} from "../../content";

/**
 * The command set behind the prompt.
 *
 * Kept as plain data away from the console component so the two can be reasoned
 * about separately: this file decides what a command prints, the console only
 * decides how a line looks and when it scrolled into view.
 */

export type Line =
  | { kind: "out"; text: string }
  | { kind: "dim"; text: string }
  | { kind: "error"; text: string }
  | { kind: "kv"; key: string; text: string };

export const out = (text: string): Line => ({ kind: "out", text });
export const dim = (text: string): Line => ({ kind: "dim", text });
export const bad = (text: string): Line => ({ kind: "error", text });
export const kv = (key: string, text: string): Line => ({ kind: "kv", key, text });

/** Callbacks the console host must supply; `clear` is owned by Console itself. */
export type ConsoleCtx = {
  /** Scrolls the reading pane to a section and marks it current. */
  goto: (id: string) => void;
  toSynthwave: () => void;
  open: (url: string) => void;
};

export type Ctx = ConsoleCtx & {
  clear: () => void;
  /** Cancels an in-flight `ask` when the console unmounts. */
  signal?: AbortSignal;
};

export type Command = {
  name: string;
  arg?: string;
  summary: string;
  /** Candidate second words, for Tab completion. */
  completions?: () => readonly string[];
  run: (arg: string, ctx: Ctx) => Line[] | Promise<Line[]>;
};

export const SECTIONS = [
  { id: "about", label: "about", note: "who I am" },
  { id: "work", label: "work", note: "where I have worked" },
  { id: "projects", label: "projects", note: "what I have shipped" },
  { id: "skills", label: "skills", note: "what I use" },
  { id: "contact", label: "contact", note: "how to reach me" },
];

const SECTION_LABELS: readonly string[] = SECTIONS.map((s) => s.label);
const SECTION_BY_LABEL = new Map(SECTIONS.map((s) => [s.label, s]));

/** Everything `open` will accept, resolved case-insensitively. Built once. */
const OPEN_TARGETS: readonly { name: string; url: string }[] = [
  ...links.map((l) => ({ name: l.label.toLowerCase(), url: l.href })),
  ...projects
    .filter((p) => p.href)
    .map((p) => ({ name: p.name.toLowerCase(), url: p.href as string })),
  ...projects
    .filter((p) => p.secondary)
    .map((p) => ({
      name: `${p.name.toLowerCase()} ${p.secondary!.label.toLowerCase()}`,
      url: p.secondary!.href,
    })),
  { name: "email", url: `mailto:${profile.email}` },
];

const OPEN_TARGET_NAMES: readonly string[] = OPEN_TARGETS.map((t) => t.name);
const OPEN_TARGET_LIST = OPEN_TARGET_NAMES.join(", ");

const pad = (s: string, n: number) => s.padEnd(n, " ");

function isAbortError(error: unknown) {
  return error instanceof DOMException
    ? error.name === "AbortError"
    : error instanceof Error && error.name === "AbortError";
}

export const COMMANDS: Command[] = [
  {
    name: "help",
    summary: "list these commands",
    run: () => [
      dim("Commands. Tab completes, up and down walk history."),
      ...COMMANDS.map((c) =>
        kv(pad(c.arg ? `${c.name} ${c.arg}` : c.name, 16), c.summary)
      ),
      dim(""),
      dim("Bare section names also work, so `about` is the same as `cd about`."),
    ],
  },
  {
    name: "ls",
    summary: "list the sections on this page",
    run: () => SECTIONS.map((s) => kv(pad(s.label, 16), s.note)),
  },
  {
    name: "cd",
    arg: "<section>",
    summary: "jump to a section",
    completions: () => SECTION_LABELS,
    run: (arg, ctx) => {
      const target = SECTION_BY_LABEL.get(arg.trim().toLowerCase());
      if (!target) {
        return [bad(`No section "${arg}". Try: ${SECTION_LABELS.join(", ")}`)];
      }
      ctx.goto(target.id);
      return [dim(`~/${target.label}`)];
    },
  },
  {
    name: "whoami",
    summary: "the short version",
    run: () => [
      out(`${profile.name}, ${profile.role}, ${profile.location}`),
      dim(profile.tagline),
      ...(status.open ? [dim(status.label)] : []),
    ],
  },
  {
    name: "work",
    summary: "roles, most recent first",
    run: (_arg, ctx) => {
      ctx.goto("work");
      return experience.map((job) => kv(pad(job.period, 22), `${job.role}, ${job.company}`));
    },
  },
  {
    name: "projects",
    summary: "featured systems and more work",
    run: (_arg, ctx) => {
      ctx.goto("projects");
      return [
        dim("Featured work"),
        ...featuredProjects.map((project) =>
          kv(
            pad(`${project.year}  ${project.name}`, 31),
            `${project.status} · ${project.stack.join(", ")}`
          )
        ),
        dim(""),
        dim("More projects"),
        ...moreProjects.map((project) =>
          kv(
            pad(`${project.year}  ${project.name}`, 31),
            `${project.status} · ${project.stack.join(", ")}`
          )
        ),
      ];
    },
  },
  {
    name: "skills",
    summary: "the stack, grouped",
    run: (_arg, ctx) => {
      ctx.goto("skills");
      return skills.map((g) => kv(pad(g.group.toLowerCase(), 24), g.items.join("  ")));
    },
  },
  {
    name: "contact",
    summary: "email and profiles",
    run: (_arg, ctx) => {
      ctx.goto("contact");
      return [
        kv(pad("email", 16), profile.email),
        ...links.map((l) => kv(pad(l.label.toLowerCase(), 16), l.href)),
      ];
    },
  },
  {
    name: "open",
    arg: "<target>",
    summary: "open a link in a new tab",
    completions: () => OPEN_TARGET_NAMES,
    run: (arg, ctx) => {
      const wanted = arg.trim().toLowerCase();
      if (!wanted) {
        return [bad(`Usage: open <target>. Try: ${OPEN_TARGET_LIST}`)];
      }
      const exact = OPEN_TARGETS.find((t) => t.name === wanted);
      if (exact) {
        ctx.open(exact.url);
        return [dim(`Opening ${exact.url}`)];
      }
      const prefixHits = OPEN_TARGETS.filter((t) => t.name.startsWith(wanted));
      if (prefixHits.length === 1) {
        ctx.open(prefixHits[0].url);
        return [dim(`Opening ${prefixHits[0].url}`)];
      }
      if (prefixHits.length > 1) {
        return [
          bad(
            `Ambiguous "${arg}". Try: ${prefixHits.map((t) => t.name).join(", ")}`
          ),
        ];
      }
      return [bad(`Nothing called "${arg}".`)];
    },
  },
  {
    name: "ask",
    arg: "<question>",
    summary: "ask about my background",
    run: async (arg, ctx) => {
      const question = arg.trim();
      if (!question) {
        return [bad("Usage: ask <question>. For example: ask what did you do at Mercor")];
      }
      try {
        const response = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question }),
          signal: ctx.signal,
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          return [bad(data?.error ?? `Request failed (${response.status}).`)];
        }
        return [out(data.answer)];
      } catch (error) {
        if (isAbortError(error) || ctx.signal?.aborted) return [];
        return [bad("Could not reach the server.")];
      }
    },
  },
  {
    name: "gui",
    summary: "switch to the synthwave layout",
    run: (_arg, ctx) => {
      ctx.toSynthwave();
      return [dim("Switching.")];
    },
  },
  {
    name: "clear",
    summary: "empty the scrollback",
    run: (_arg, ctx) => {
      ctx.clear();
      return [];
    },
  },
];

const BY_NAME = new Map(COMMANDS.map((c) => [c.name, c]));
const COMMAND_NAME_POOL: readonly string[] = [
  ...new Set([...COMMANDS.map((c) => c.name), ...SECTION_LABELS]),
];

/** Bare section names are accepted as shorthand for `cd <section>`. */
export function resolve(input: string): { command: Command; arg: string } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const [head, ...rest] = trimmed.split(/\s+/);
  const name = head.toLowerCase();

  const direct = BY_NAME.get(name);
  if (direct) return { command: direct, arg: rest.join(" ") };

  if (SECTION_BY_LABEL.has(name)) {
    return { command: BY_NAME.get("cd")!, arg: name };
  }
  return null;
}

/**
 * Longest common prefix of the candidates, which is what a shell fills in when
 * Tab is ambiguous. Returns the whole word when only one candidate matches.
 */
function commonPrefix(values: readonly string[]) {
  if (values.length === 0) return "";
  return values.reduce((prefix, value) => {
    let i = 0;
    while (i < prefix.length && i < value.length && prefix[i] === value[i]) i++;
    return prefix.slice(0, i);
  });
}

export type Completion = { value: string; candidates: string[] };

/** Completes the command name, or its argument once a name is typed. */
export function complete(input: string): Completion {
  const leading = input.match(/^\s*/)?.[0] ?? "";
  const trimmed = input.trimStart();
  const space = trimmed.search(/\s/);
  const typingArg = space !== -1;

  if (!typingArg) {
    const word = trimmed.toLowerCase();
    const candidates = COMMAND_NAME_POOL.filter((n) => n.startsWith(word));
    if (candidates.length === 0) return { value: input, candidates: [] };
    const filled = commonPrefix(candidates);
    return {
      value: leading + filled + (candidates.length === 1 ? " " : ""),
      candidates: [...candidates],
    };
  }

  const name = trimmed.slice(0, space).toLowerCase();
  const command = BY_NAME.get(name);
  if (!command?.completions) return { value: input, candidates: [] };

  const arg = trimmed.slice(space).trimStart().toLowerCase();
  const candidates = command.completions().filter((n) => n.startsWith(arg));
  if (candidates.length === 0) return { value: input, candidates: [] };
  const filled = commonPrefix(candidates);
  return {
    value: `${leading}${command.name} ${filled}${candidates.length === 1 ? " " : ""}`,
    candidates: [...candidates],
  };
}
