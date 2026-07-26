"use client";

import ArtScene from "./ArtScene";
import ShaderScene from "./ShaderScene";
import { SHADERS } from "./shadertoy/specs";

/**
 * The backdrops a visitor can switch between, and the credit each one owes.
 *
 * Both shaders are other people's work under CC BY-NC-SA, so the attribution
 * travels with the entry rather than being remembered separately somewhere in
 * the footer.
 */

export type BackdropId = "art" | "synth" | "drive";

type Entry = {
  id: BackdropId;
  label: string;
  credit: { author: string; title: string; url: string; license: string } | null;
};

/** Switcher order, left to right. The first entry is what loads. */
export const BACKDROPS: Entry[] = [
  { id: "drive", label: "Sunset Drive", credit: SHADERS["sunset-drive"].credit },
  { id: "art", label: "Artwork", credit: null },
  { id: "synth", label: "Synthwave", credit: SHADERS["synthwave-theme"].credit },
];

export const DEFAULT_BACKDROP: BackdropId = BACKDROPS[0].id;

export function creditFor(id: BackdropId) {
  return BACKDROPS.find((b) => b.id === id)?.credit ?? null;
}

export function Backdrop({ id }: { id: BackdropId }) {
  if (id === "synth") return <ShaderScene spec={SHADERS["synthwave-theme"]} />;
  if (id === "drive") return <ShaderScene spec={SHADERS["sunset-drive"]} />;
  return <ArtScene />;
}

export function BackdropSwitch({
  value,
  onChange,
}: {
  value: BackdropId;
  onChange: (id: BackdropId) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Backdrop"
      className="pointer-events-auto inline-flex items-center gap-1 rounded-full border border-line-soft bg-ink-900/75 p-1 backdrop-blur"
    >
      {BACKDROPS.map((entry) => {
        const active = entry.id === value;
        return (
          <button
            key={entry.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(entry.id)}
            className={`min-h-9 rounded-full px-3.5 font-mono text-xs tracking-wide transition-colors duration-200 ${
              active
                ? "bg-magenta/20 text-fg"
                : "text-dim hover:text-fg"
            }`}
          >
            {entry.label}
          </button>
        );
      })}
    </div>
  );
}
