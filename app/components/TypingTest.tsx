"use client";
import { useEffect, useMemo, useState } from "react";

const baseWords = [
  "that",
  "person",
  "test",
  "one",
  "point",
  "who",
  "develop",
  "because",
  "then",
  "choose",
];

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function TypingTest() {
  const promptWords = useMemo(() => shuffle(baseWords), []);
  const prompt = useMemo(() => promptWords.join(" "), [promptWords]);
  const targetWords = promptWords.length;
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [finishTime, setFinishTime] = useState<number | null>(null);
  const [finishChars, setFinishChars] = useState<number | null>(null);
  const [bestWpm, setBestWpm] = useState<number | null>(null);

  const normalizedTarget = useMemo(
    () => prompt.trim().replace(/\s+/g, " "),
    [prompt]
  );

  const normalizedInput = useMemo(
    () => input.trim().replace(/\s+/g, " "),
    [input]
  );

  const wordsTyped =
    normalizedInput.length > 0 ? normalizedInput.split(" ").length : 0;
  const elapsedMs = useMemo(() => {
    if (!startTime) return 0;
    const endPoint = finishTime ?? Date.now();
    return Math.max(0, endPoint - startTime);
  }, [startTime, finishTime]);

  const elapsedSeconds = elapsedMs / 1000;
  const charactersTyped = input.length;
  const charactersForFinal = finishChars ?? charactersTyped;

  const liveWpm =
    startTime && elapsedSeconds > 0
      ? Math.round(
          ((charactersTyped / 5) * (60 / elapsedSeconds) + Number.EPSILON) * 10
        ) / 10
      : 0;

  const finalWpm =
    finishTime && startTime
      ? Math.round(
          (((charactersForFinal / 5) *
            (60 /
              Math.max(
                0.001,
                (finishTime - startTime) / 1000 // seconds
              ))) +
            Number.EPSILON) *
            10
        ) / 10
      : null;

  const isComplete =
    normalizedInput.length > 0 &&
    normalizedInput === normalizedTarget &&
    normalizedTarget.split(" ").length === targetWords;

  useEffect(() => {
    if (isComplete && startTime && !finishTime) {
      setFinishTime(Date.now());
      setFinishChars(charactersTyped);
    }
  }, [isComplete, startTime, finishTime, charactersTyped]);

  useEffect(() => {
    if (
      finishTime &&
      startTime &&
      charactersForFinal > 0 &&
      finalWpm !== null
    ) {
      setBestWpm((prev) =>
        prev !== null ? Math.max(prev, finalWpm) : finalWpm
      );
    }
  }, [finishTime, startTime, finalWpm, charactersForFinal]);

  const handleChange = (value: string) => {
    if (!startTime && value.trim().length > 0) {
      setStartTime(Date.now());
    }
    if (finishTime) {
      setFinishTime(null);
      setFinishChars(null);
    }
    setInput(value);
  };

  const handleReset = () => {
    setInput("");
    setStartTime(null);
    setFinishTime(null);
    setFinishChars(null);
  };

  return (
    <section className="p-8 bg-black/50 backdrop-blur-md border border-cyan-500/30 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.15)] space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300 font-semibold">
            Typing Duel
          </p>
          <h3 className="text-3xl font-bold text-cyan-100">
            Beat my <span className="text-purple-400">200 WPM</span>
          </h3>
          <p className="text-sm text-zinc-400">
            Perfect accuracy auto-submits—no need to hit "Done."
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-400">Target</p>
          <p className="text-2xl font-mono text-cyan-200">200 wpm</p>
          {bestWpm !== null && (
            <p className="text-sm text-emerald-300">
              Best: {bestWpm.toFixed(1)} wpm
            </p>
          )}
        </div>
      </div>

      <div className="p-4 bg-gradient-to-r from-cyan-900/40 via-black to-purple-900/30 border border-cyan-800/40 rounded-lg">
        <p className="text-zinc-200 font-mono text-lg">{prompt}</p>
      </div>

      <div className="space-y-3">
        <textarea
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Start typing the phrase above..."
          className="w-full min-h-[120px] p-4 text-lg rounded-lg bg-black/60 border border-cyan-700/50 focus:border-cyan-400 outline-none text-cyan-50 font-mono placeholder:text-cyan-300/60 resize-none"
        />
        <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-zinc-400">Live</span>
          <span className="text-3xl font-mono text-cyan-200">
            {liveWpm.toFixed(1)}
          </span>
          <span className="text-sm text-zinc-500">wpm</span>
        </div>
        {finalWpm !== null && (
          <div className="flex items-baseline gap-2 text-emerald-300">
            <span className="text-sm text-zinc-400">Final</span>
            <span className="text-2xl font-mono">{finalWpm.toFixed(1)}</span>
            <span className="text-sm text-zinc-500">wpm</span>
          </div>
        )}
          <div className="text-sm text-zinc-400">
            Words: {wordsTyped}/{targetWords}
          </div>
          {isComplete ? (
            <span className="text-emerald-300 text-sm">
              Perfect match! Ready to log that score.
            </span>
          ) : (
            <span className="text-amber-300 text-sm">
              Keep it clean—every extra space counts.
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg bg-cyan-700/50 text-cyan-50 border border-cyan-400/40 hover:border-cyan-200 transition"
        >
          Reset
        </button>
        {!isComplete && (
          <button
            onClick={() => {
              if (!startTime) return;
              setFinishTime(Date.now());
              setFinishChars(charactersTyped);
            }}
            disabled={!startTime}
            className="px-4 py-2 rounded-lg bg-purple-700/50 text-purple-50 border border-purple-400/40 hover:border-purple-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            I&apos;m Done
          </button>
        )}
      </div>
    </section>
  );
}
