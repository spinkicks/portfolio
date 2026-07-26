"use client";

import { useSyncExternalStore } from "react";
import TerminalSite from "./components/terminal/TerminalSite";
import MainSite from "./components/MainSite";

/**
 * Coin flip between the two layouts, decided once per page load.
 *
 * Held in a module-level store rather than in an effect. The choice cannot be
 * made while rendering, since the server would pick a different side than the
 * browser and hydration would tear, but setting state from an effect to work
 * around that is the pattern React now warns about. An external store states it
 * directly: the server has no answer, the client has one, and the switch
 * buttons on either layout can write to it.
 */
let choice: boolean | null = null;
const listeners = new Set<() => void>();

/** Memoised, so repeated reads within one render agree with each other. */
function getChoice() {
  if (choice === null) choice = Math.random() < 0.5;
  return choice;
}

function setChoice(next: boolean) {
  choice = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export default function Home() {
  const useAlt = useSyncExternalStore(subscribe, getChoice, () => null);

  // Server render and first client render alike: nothing, until the flip lands.
  if (useAlt === null) return null;

  if (useAlt) {
    return (
      <div className="theme-terminal">
        <TerminalSite onSwitch={() => setChoice(false)} />
      </div>
    );
  }

  return (
    <div className="theme-wireframe">
      <MainSite onSwitch={() => setChoice(true)} />
    </div>
  );
}
