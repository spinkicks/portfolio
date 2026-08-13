"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import MainSite from "./components/MainSite";

const loadTerminalSite = () => import("./components/terminal/TerminalSite");

const TerminalSite = dynamic(loadTerminalSite, { ssr: false });

/**
 * Synthwave is the stable entry point. Terminal is an explicit alternate view
 * selected by the visitor and resets to synthwave on a fresh page load.
 */
export default function Home() {
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalLoading, setTerminalLoading] = useState(false);

  const openTerminal = useCallback(async () => {
    setTerminalLoading(true);
    try {
      await loadTerminalSite();
      setShowTerminal(true);
    } catch {
      // Stay on synthwave; do not leave an unhandled rejection.
    } finally {
      setTerminalLoading(false);
    }
  }, []);

  const closeTerminal = useCallback(() => {
    setShowTerminal(false);
  }, []);

  return (
    <>
      {terminalLoading ? (
        <p className="sr-only" role="status">
          Loading terminal
        </p>
      ) : null}
      {showTerminal ? (
        <div className="theme-terminal">
          <TerminalSite onSwitch={closeTerminal} />
        </div>
      ) : (
        <div className="theme-wireframe">
          <MainSite onSwitch={openTerminal} />
        </div>
      )}
    </>
  );
}
