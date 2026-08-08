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
  | { kind: "accent"; text: string }
  | { kind: "error"; text: string }
  | { kind: "kv"; key: string; text: string };

export const out = (text: string): Line => ({ kind: "out", text });
export const dim = (text: string): Line => ({ kind: "dim", text });
export const bad = (text: string): Line => ({ kind: "error", text });
export const kv = (key: string, text: string): Line => ({ kind: "kv", key, text });

export type Ctx = {
  /** Scrolls the reading pane to a section and marks it current. */
  goto: (id: string) => void;
  clear: () => void;
  toSynthwave: () => void;
  open: (url: string) => void;
};

export type Command = {
  name: string;
  arg?: string;
  summary: string;
  /** Candidate second words, for Tab completion. */
  completions?: () => string[];
  run: (arg: string, ctx: Ctx) => Line[] | Promise<Line[]>;
};

export const SECTIONS = [
  { id: "about", label: "about", note: "who I am" },
  { id: "work", label: "work", note: "where I have worked" },
  { id: "projects", label: "projects", note: "what I have shipped" },
  { id: "skills", label: "skills", note: "what I use" },
  { id: "contact", label: "contact", note: "how to reach me" },
];

/** Everything `open` will accept, resolved case-insensitively. */
function openTargets(): { name: string; url: string }[] {
  return [
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
}

const pad = (s: string, n: number) => s.padEnd(n, " ");

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
      dim("Section names also work on their own, so `projects` is the same as `cd projects`."),
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
    completions: () => SECTIONS.map((s) => s.label),
    run: (arg, ctx) => {
      const target = SECTIONS.find((s) => s.label === arg.trim().toLowerCase());
      if (!target) {
        return [bad(`No section "${arg}". Try: ${SECTIONS.map((s) => s.label).join(", ")}`)];
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
    completions: () => openTargets().map((t) => t.name),
    run: (arg, ctx) => {
      const wanted = arg.trim().toLowerCase();
      if (!wanted) {
        return [bad(`Usage: open <target>. Try: ${openTargets().map((t) => t.name).join(", ")}`)];
      }
      const hit =
        openTargets().find((t) => t.name === wanted) ??
        openTargets().find((t) => t.name.startsWith(wanted));
      if (!hit) return [bad(`Nothing called "${arg}".`)];
      ctx.open(hit.url);
      return [dim(`Opening ${hit.url}`)];
    },
  },
  {
    name: "ask",
    arg: "<question>",
    summary: "ask about my background",
    run: async (arg) => {
      const question = arg.trim();
      if (!question) {
        return [bad("Usage: ask <question>. For example: ask what did you do at Mercor")];
      }
      try {
        const response = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question }),
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          return [bad(data?.error ?? `Request failed (${response.status}).`)];
        }
        return [out(data.answer)];
      } catch {
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

/** Bare section names are accepted as shorthand for `cd <section>`. */
export function resolve(input: string): { command: Command; arg: string } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const [head, ...rest] = trimmed.split(/\s+/);
  const name = head.toLowerCase();

  const direct = BY_NAME.get(name);
  if (direct) return { command: direct, arg: rest.join(" ") };

  if (SECTIONS.some((s) => s.label === name)) {
    return { command: BY_NAME.get("cd")!, arg: name };
  }
  return null;
}

/**
 * Longest common prefix of the candidates, which is what a shell fills in when
 * Tab is ambiguous. Returns the whole word when only one candidate matches.
 */
function commonPrefix(values: string[]) {
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
  const parts = trimmed.split(/\s+/);
  const typingArg = /\s/.test(trimmed) || parts.length > 1;

  if (!typingArg) {
    const word = parts[0]?.toLowerCase() ?? "";
    const pool = [...COMMANDS.map((c) => c.name), ...SECTIONS.map((s) => s.label)];
    const candidates = pool.filter((n) => n.startsWith(word));
    if (candidates.length === 0) return { value: input, candidates: [] };
    const filled = commonPrefix(candidates);
    return {
      value: leading + filled + (candidates.length === 1 ? " " : ""),
      candidates,
    };
  }

  const command = BY_NAME.get(parts[0].toLowerCase());
  if (!command?.completions) return { value: input, candidates: [] };

  const word = (parts[1] ?? "").toLowerCase();
  const candidates = command.completions().filter((n) => n.startsWith(word));
  if (candidates.length === 0) return { value: input, candidates: [] };
  const filled = commonPrefix(candidates);
  return {
    value: `${leading}${command.name} ${filled}${candidates.length === 1 ? " " : ""}`,
    candidates,
  };
}
