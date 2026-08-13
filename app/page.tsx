"use client";

import { useState } from "react";
import TerminalSite from "./components/terminal/TerminalSite";
import MainSite from "./components/MainSite";

/**
 * Synthwave is the stable entry point. Terminal is an explicit alternate view
 * selected by the visitor and resets to synthwave on a fresh page load.
 */
export default function Home() {
  const [showTerminal, setShowTerminal] = useState(false);

  if (showTerminal) {
    return (
      <div className="theme-terminal">
        <TerminalSite onSwitch={() => setShowTerminal(false)} />
      </div>
    );
  }

  return (
    <div className="theme-wireframe">
      <MainSite onSwitch={() => setShowTerminal(true)} />
    </div>
  );
}
