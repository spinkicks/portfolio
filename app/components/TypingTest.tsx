"use client";
import { useEffect, useMemo, useState } from "react";

// list of common english words used for the typing challenge
const WORD_BANK = [
  "program",
  "follow",
  "general",
  "child",
  "present",
  "then",
  "year",
  "right",
  "through",
  "just",
  "also",
  "it",
  "take",
  "set",
  "more",
  "course",
  "say",
  "who",
  "these",
  "house",
  "since",
  "during",
  "order",
  "head",
  "some",
  "want",
  "time",
  "one",
  "hand",
  "between",
  "be",
  "well",
  "show",
  "own",
  "into",
  "we",
  "with",
  "little",
  "late",
  "way",
  "help",
  "right",
  "most",
  "first",
  "stand",
  "public",
  "possible",
  "point",
  "down",
  "of",
  "around",
  "time",
  "man",
  "possible",
  "from",
  "point",
];

// fisher-yates shuffle algorithm to randomize array order
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// grab a random selection of words from the bank and shuffle them
function pickWords(count: number) {
  return shuffle(WORD_BANK).slice(0, count);
}

// main typing test component with wpm calculation and real-time feedback
export default function TypingTest() {
  // state for managing the words to type and user input
  const [promptWords, setPromptWords] = useState<string[]>(() => pickWords(10));
  const prompt = useMemo(() => promptWords.join(" "), [promptWords]);
  const targetWords = promptWords.length;
  const [input, setInput] = useState("");
  // track when user starts typing and when they finish
  const [startTime, setStartTime] = useState<number | null>(null);
  const [finishTime, setFinishTime] = useState<number | null>(null);
  const [finishChars, setFinishChars] = useState<number | null>(null);
  // store the user's best wpm score across all attempts
  const [bestWpm, setBestWpm] = useState<number | null>(null);
  // anti-cheat detection flag for copy/paste attempts
  const [hasCheated, setHasCheated] = useState(false);

  // normalize target and user input by trimming whitespace and collapsing multiple spaces
  // this makes comparison case-insensitive and forgiving of spacing differences
  const normalizedTarget = useMemo(
    () => prompt.trim().replace(/\s+/g, " "),
    [prompt]
  );

  const normalizedInput = useMemo(
    () => input.trim().replace(/\s+/g, " "),
    [input]
  );

  // count how many words and characters have been typed so far
  const wordsTyped =
    normalizedInput.length > 0 ? normalizedInput.split(" ").length : 0;
  // calculate elapsed time since test started, accounting for finish time or current time
  const elapsedMs = useMemo(() => {
    if (!startTime) return 0;
    const endPoint = finishTime ?? Date.now();
    return Math.max(0, endPoint - startTime);
  }, [startTime, finishTime]);

  // convert milliseconds to seconds for wpm calculations
  const elapsedSeconds = elapsedMs / 1000;
  // total characters typed, or use the final character count if test is finished
  const charactersTyped = input.length;
  const charactersForFinal = finishChars ?? charactersTyped;

  // calculate live wpm (words per minute) as user types
  // formula: (characters / 5) * (60 / elapsed_seconds) rounded to 1 decimal
  const liveWpm =
    startTime && elapsedSeconds > 0
      ? Math.round(
          ((charactersTyped / 5) * (60 / elapsedSeconds) + Number.EPSILON) * 10
        ) / 10
      : 0;

  // calculate final wpm based on the submitted result
  // uses the character count from when test was completed
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

  // check if user has typed everything correctly and completed the challenge
  const isComplete =
    normalizedInput.length > 0 &&
    normalizedInput === normalizedTarget &&
    normalizedTarget.split(" ").length === targetWords;

  // when test is complete, capture the final timestamp and character count
  useEffect(() => {
    if (isComplete && startTime && !finishTime) {
      setFinishTime(Date.now());
      setFinishChars(charactersTyped);
    }
  }, [isComplete, startTime, finishTime, charactersTyped]);

  // update the best wpm score whenever a new test is completed
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

  // handle textarea input changes and manage timer start/reset logic
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

  // detect and block attempts to paste the exact prompt text to prevent cheating
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData("text");
    if (pastedText.trim() === normalizedTarget) {
      setHasCheated(true);
      e.preventDefault();
    }
  };

  // reset everything for a fresh attempt at the typing challenge
  const handleReset = () => {
    setInput("");
    setStartTime(null);
    setFinishTime(null);
    setFinishChars(null);
    setPromptWords(pickWords(10));
    setHasCheated(false);
  };

  return (
    <section className="p-8 glass-card rounded-none space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-3xl font-mono text-cyan-200 glow-cyan">
            Beat my <span className="text-cyan-700 font-mono">200 WPM</span>
          </h3>
          <p className="text-sm text-zinc-400 font-mono">
            Type this with 100% accuracy, and it will auto-submit.
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-mono text-cyan-700">Target: 200 wpm</p>
          {bestWpm !== null && (
            <p className="text-sm text-emerald-300 font-mono">
              Best: {bestWpm.toFixed(1)} wpm
            </p>
          )}
        </div>
      </div>

      <div className="p-4 bg-gradient-to-r from-cyan-900/40 via-black to-purple-900/30 border border-cyan-800/40 rounded-lg">
        <p className="text-zinc-400 font-mono text-lg">{prompt}</p>
      </div>

      <div className="space-y-3">
        <textarea
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          onPaste={handlePaste}
          placeholder="Type the words above..."
          className="w-full min-h-[120px] p-4 text-lg rounded-lg bg-black/80 border border-cyan-700/50 focus:border-cyan-400 outline-none text-cyan-50 font-mono placeholder:text-cyan-300/60 resize-none"
        />
        {hasCheated && (
          <div className="text-red-400 text-sm font-mono">
            Nice try cheater... no copy pasting allowed.
          </div>
        )}
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
          <div className="text-sm text-zinc-400 font-mono">
            Words: {wordsTyped}/{targetWords}
          </div>
          {isComplete ? (
            <span className="text-emerald-300 text-sm font-mono">
              Perfect! Logged the score.
            </span>
          ) : (
            <span className="text-cyan-700 text-sm font-mono">
              Type accurately... cus everything counts
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg bg-cyan-700/50 text-cyan-50 border border-cyan-400/40 hover:border-cyan-200 transition btn-glow"
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
            className="px-4 py-2 rounded-lg bg-purple-700/50 text-purple-50 border border-purple-400/40 hover:border-purple-200 transition disabled:opacity-40 disabled:cursor-not-allowed btn-glow"
          >
            I&apos;m Done
          </button>
        )}
      </div>
    </section>
  );
}
