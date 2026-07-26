"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, Shuffle } from "lucide-react";

const WORD_BANK = [
  "program", "follow", "general", "child", "present", "then", "year", "right",
  "through", "just", "also", "take", "set", "more", "course", "say", "who",
  "these", "house", "since", "during", "order", "head", "some", "want", "time",
  "hand", "between", "well", "show", "own", "into", "with", "little", "late",
  "most", "first", "stand", "public", "possible", "point", "down", "from",
  "system", "number", "world", "under", "value", "change", "answer", "matter",
];

const WORD_COUNT = 12;
const BEST_WPM_KEY = "portfolio:best-wpm";

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickWords() {
  return shuffle(WORD_BANK).slice(0, WORD_COUNT);
}

export default function TypingTest() {
  // Seeded deterministically, then randomized on mount so SSR and the first
  // client render agree.
  const [words, setWords] = useState<string[]>(() =>
    WORD_BANK.slice(0, WORD_COUNT)
  );
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [bestWpm, setBestWpm] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [focused, setFocused] = useState(false);
  const [pasteBlocked, setPasteBlocked] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const prompt = useMemo(() => words.join(" "), [words]);

  useEffect(() => {
    setWords(pickWords());
    const stored = window.localStorage.getItem(BEST_WPM_KEY);
    if (stored) setBestWpm(Number(stored));
  }, []);

  // Keep the live readout moving while the clock is running.
  useEffect(() => {
    if (!startTime || endTime) return;
    const id = setInterval(() => setNow(Date.now()), 150);
    return () => clearInterval(id);
  }, [startTime, endTime]);

  const correctChars = useMemo(() => {
    let count = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] === prompt[i]) count++;
    }
    return count;
  }, [input, prompt]);

  // `now` is seeded the moment the clock starts, so it is always populated
  // whenever startTime is set.
  const elapsedMs = startTime ? (endTime ?? now) - startTime : 0;
  const elapsedMinutes = Math.max(elapsedMs, 1) / 60000;
  // Net WPM: only correctly typed characters count toward the score.
  const wpm = startTime ? correctChars / 5 / elapsedMinutes : 0;
  const accuracy = input.length ? (correctChars / input.length) * 100 : 100;
  const isDone = endTime !== null;

  const handleChange = (value: string) => {
    if (isDone) return;
    const next = value.slice(0, prompt.length);
    if (!startTime && next.length > 0) {
      setStartTime(Date.now());
      setNow(Date.now());
    }
    setInput(next);

    if (next.length === prompt.length) {
      const finished = Date.now();
      setEndTime(finished);

      const start = startTime ?? finished;
      let correct = 0;
      for (let i = 0; i < next.length; i++) {
        if (next[i] === prompt[i]) correct++;
      }
      const finalWpm =
        correct / 5 / (Math.max(finished - start, 1) / 60000);

      setBestWpm((prev) => {
        const best = prev === null ? finalWpm : Math.max(prev, finalWpm);
        window.localStorage.setItem(BEST_WPM_KEY, String(best));
        return best;
      });
    }
  };

  const reset = useCallback((newWords: boolean) => {
    if (newWords) setWords(pickWords());
    setInput("");
    setStartTime(null);
    setEndTime(null);
    setNow(0);
    setPasteBlocked(false);
    inputRef.current?.focus();
  }, []);

  // Group characters by word so lines never break mid-word.
  const wordGroups = useMemo(() => {
    const groups: { ch: string; index: number }[][] = [];
    let index = 0;
    words.forEach((word, w) => {
      const chars: { ch: string; index: number }[] = [];
      for (const ch of word) chars.push({ ch, index: index++ });
      if (w < words.length - 1) chars.push({ ch: " ", index: index++ });
      groups.push(chars);
    });
    return groups;
  }, [words]);

  return (
    <div className="panel p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          <p className="label">Benchmark</p>
          <h3 className="display mt-2 text-3xl text-fg sm:text-4xl">
            Beat <span className="text-magenta glow-magenta">200 WPM</span>
          </h3>
          <p className="mt-2 max-w-md text-sm text-dim">
            Type the passage below. Accuracy counts — only correct characters
            score.
          </p>
        </div>

        <div className="flex gap-3">
          <Stat label="WPM" value={wpm.toFixed(0)} tone="cyan" />
          <Stat label="Accuracy" value={`${accuracy.toFixed(0)}%`} tone="violet" />
          <Stat
            label="Best"
            value={bestWpm === null ? "—" : bestWpm.toFixed(0)}
            tone="magenta"
          />
        </div>
      </div>

      {/* Clicking anywhere in the passage focuses the hidden input */}
      <div
        className="relative mt-6 border border-line-soft bg-ink-800/70 p-5 sm:p-6"
        onClick={() => inputRef.current?.focus()}
      >
        <p
          aria-hidden="true"
          className="font-mono text-lg leading-relaxed tracking-tight sm:text-xl"
        >
          {wordGroups.map((chars, w) => (
            <span key={w} className="inline-block whitespace-pre">
              {chars.map(({ ch, index }) => {
                const typed = input[index];
                const isCaret = index === input.length && focused && !isDone;

                let tone = "text-faint";
                if (typed !== undefined) {
                  tone =
                    typed === ch
                      ? "text-fg"
                      : "text-red underline decoration-red decoration-2 underline-offset-4";
                }

                return (
                  <span
                    key={index}
                    className={`${tone} ${
                      isCaret
                        ? "-ml-px border-l-2 border-magenta animate-pulse"
                        : ""
                    }`}
                  >
                    {ch}
                  </span>
                );
              })}
            </span>
          ))}
        </p>

        <label className="sr-only" htmlFor="typing-input">
          Typing test input
        </label>
        <p id="typing-prompt" className="sr-only">
          Type the following text: {prompt}
        </p>
        <input
          id="typing-input"
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onPaste={(e) => {
            e.preventDefault();
            setPasteBlocked(true);
          }}
          disabled={isDone}
          aria-describedby="typing-prompt"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="absolute inset-0 h-full w-full cursor-text opacity-0"
        />

        {!focused && !isDone && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink-800/80 backdrop-blur-[2px]">
            <span className="label text-dim">
              {input.length ? "Paused — click to resume" : "Click to start"}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
        <button
          type="button"
          onClick={() => reset(false)}
          className="inline-flex min-h-11 items-center gap-2 border border-line-soft px-4 text-sm text-dim transition-colors duration-200 hover:border-line hover:text-fg"
        >
          <RotateCcw size={14} aria-hidden="true" />
          Retry
        </button>
        <button
          type="button"
          onClick={() => reset(true)}
          className="inline-flex min-h-11 items-center gap-2 border border-line-soft px-4 text-sm text-dim transition-colors duration-200 hover:border-line hover:text-fg"
        >
          <Shuffle size={14} aria-hidden="true" />
          New words
        </button>

        <p aria-live="polite" className="text-sm">
          {isDone ? (
            <span className="text-lime">
              Done — {wpm.toFixed(1)} WPM at {accuracy.toFixed(0)}% accuracy
              {wpm >= 200 ? ". You beat me." : "."}
            </span>
          ) : (
            <span className="text-faint">
              {input.length}/{prompt.length} characters
            </span>
          )}
        </p>

        {pasteBlocked && (
          <p className="text-sm text-red">Nice try. No pasting.</p>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "violet" | "magenta";
}) {
  const toneClass = {
    cyan: "text-cyan",
    violet: "text-violet",
    magenta: "text-magenta",
  }[tone];

  return (
    <div className="min-w-[4.5rem] border border-line-soft bg-ink-800/60 px-3 py-2 text-right">
      <p className="label text-[0.625rem]">{label}</p>
      <p className={`display mt-1 text-2xl tabular-nums ${toneClass}`}>{value}</p>
    </div>
  );
}
