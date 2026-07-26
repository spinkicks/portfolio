"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { bad, complete, dim, resolve, type Ctx, type Line } from "./commands";

/**
 * The prompt and its scrollback.
 *
 * Output clears itself so it does not pile up over the page. Two details make
 * that safe to do. The countdown starts when a command finishes rather than
 * when it was sent, so a slow `ask` does not spend its display time waiting on
 * the network; and hovering the log holds it open, so anything still being read
 * cannot be pulled away mid-sentence. Recall is unaffected either way, since
 * the arrow keys read from the command history rather than from what is on
 * screen.
 */

type Entry = { id: number; input: string; lines: Line[]; pending: boolean };

const PROMPT = "visitor@spinkicks:~$";

/** How long finished output stays before it starts to go. */
const HOLD_MS = 6000;
/** Long enough to register as a fade rather than a disappearance. */
const FADE_MS = 700;

export default function Console({ ctx }: { ctx: Ctx }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  // History is walked with the arrow keys. `cursor` is an index from the end,
  // where -1 means "not walking, showing whatever is typed".
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const draft = useRef("");

  const [fading, setFading] = useState(false);
  const [held, setHeld] = useState(false);

  const nextId = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const clear = useCallback(() => {
    setEntries([]);
    setFading(false);
  }, []);

  /** Appends output and restarts the countdown, including mid-fade. */
  const push = useCallback((entry: Entry) => {
    setFading(false);
    setEntries((e) => [...e, entry]);
  }, []);

  // Newest output sits at the bottom, so the log follows it down.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [entries]);

  // Start the countdown once nothing is still running. Every state change here
  // happens inside a timer callback rather than in the effect body, so the
  // effect stays a pure subscription.
  useEffect(() => {
    if (entries.length === 0 || held) return;
    if (entries.some((entry) => entry.pending)) return;
    const timer = setTimeout(() => setFading(true), HOLD_MS);
    return () => clearTimeout(timer);
  }, [entries, held]);

  // Unmount once faded. Leaving it at zero opacity would keep its height and
  // strand a blank gap above the prompt, which is the thing being avoided.
  useEffect(() => {
    if (!fading) return;
    const timer = setTimeout(() => {
      setEntries([]);
      setFading(false);
    }, FADE_MS);
    return () => clearTimeout(timer);
  }, [fading]);

  const submit = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || busy) return;

      setHistory((h) => (h[h.length - 1] === text ? h : [...h, text]));
      setCursor(-1);
      draft.current = "";
      setInput("");

      const id = nextId.current++;
      const match = resolve(text);

      if (!match) {
        push({
          id,
          input: text,
          pending: false,
          lines: [bad(`${text.split(/\s+/)[0]}: not a command. Type help.`)],
        });
        return;
      }

      const scoped: Ctx = { ...ctx, clear };
      const result = match.command.run(match.arg, scoped);

      // Synchronous commands must not flash a pending row, so only the async
      // branch commits an entry early.
      if (!(result instanceof Promise)) {
        if (match.command.name === "clear") return;
        push({ id, input: text, lines: result, pending: false });
        return;
      }

      push({ id, input: text, lines: [], pending: true });
      setBusy(true);
      const lines = await result;
      setBusy(false);
      setEntries((e) =>
        e.map((entry) => (entry.id === id ? { ...entry, lines, pending: false } : entry))
      );
    },
    [busy, clear, ctx, push]
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "l" && event.ctrlKey) {
      event.preventDefault();
      clear();
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      const { value, candidates } = complete(input);
      setInput(value);
      // Ambiguous: show what it could be, the way a shell does on a second Tab.
      if (candidates.length > 1) {
        push({
          id: nextId.current++,
          input,
          pending: false,
          lines: [dim(candidates.join("  "))],
        });
      }
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (history.length === 0) return;
      if (cursor === -1) draft.current = input;
      const next = Math.min(cursor + 1, history.length - 1);
      setCursor(next);
      setInput(history[history.length - 1 - next]);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (cursor === -1) return;
      const next = cursor - 1;
      setCursor(next);
      setInput(next === -1 ? draft.current : history[history.length - 1 - next]);
    }
  };

  return (
    <div className="border-t border-line-soft bg-ink-900/95">
      {entries.length > 0 && (
        <div
          ref={logRef}
          aria-live="polite"
          // Pointer over the log holds it, and takes it back if the fade has
          // already begun. Focus counts too, so a keyboard user scrolling the
          // output with the caret in it is not treated as having walked away.
          onMouseEnter={() => {
            setHeld(true);
            setFading(false);
          }}
          onMouseLeave={() => setHeld(false)}
          onFocusCapture={() => setHeld(true)}
          onBlurCapture={() => setHeld(false)}
          style={{ transitionDuration: `${FADE_MS}ms` }}
          className={`max-h-[34vh] overflow-y-auto border-b border-line-soft px-4 py-3 text-[0.8rem] leading-relaxed transition-opacity ease-out sm:px-6 ${
            fading ? "opacity-0" : "opacity-100"
          }`}
        >
          {entries.map((entry) => (
            <div key={entry.id} className="mb-2 last:mb-0">
              <p className="text-faint">
                <span className="text-lime">{PROMPT}</span> {entry.input}
              </p>
              {entry.pending ? (
                <p className="pl-2 text-dim">
                  working<span className="caret ml-1" />
                </p>
              ) : (
                <div className="pl-2">
                  {entry.lines.map((line, i) => (
                    <Row key={i} line={line} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Wrapping the row in a label means the whole strip is a hit target for
          the input, which is how a terminal window behaves. */}
      <label className="flex cursor-text items-center gap-2 px-4 py-2.5 text-sm sm:px-6">
        <span className="shrink-0 text-lime">{PROMPT}</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setCursor(-1);
          }}
          onKeyDown={onKeyDown}
          onKeyUp={(e) => {
            if (e.key === "Enter") submit(input);
          }}
          disabled={busy}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          aria-label="Terminal command"
          placeholder={busy ? "working" : "help"}
          className="min-w-0 flex-1 bg-transparent text-fg outline-none placeholder:text-faint disabled:opacity-50"
        />
      </label>
    </div>
  );
}

function Row({ line }: { line: Line }) {
  if (line.kind === "kv") {
    return (
      <div className="flex">
        {/* Pre-wrapped and padded upstream, so in a monospace face every key
            occupies the same width and the values form a true column. */}
        <span className="whitespace-pre text-faint">{line.key}</span>
        <span className="min-w-0 flex-1 break-words text-fg">{line.text}</span>
      </div>
    );
  }

  const tone =
    line.kind === "error"
      ? "text-magenta"
      : line.kind === "accent"
        ? "text-lime"
        : line.kind === "dim"
          ? "text-dim"
          : "text-fg";

  // An empty dim line is deliberate spacing in help output.
  if (!line.text) return <div className="h-3" />;
  return <p className={`break-words ${tone}`}>{line.text}</p>;
}
