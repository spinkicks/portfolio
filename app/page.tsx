"use client";

import { useState, useEffect } from "react";
import AltSite from "./components/AltSite";
import MainSite from "./components/MainSite";

export default function Home() {
  const [useAlt, setUseAlt] = useState<boolean | null>(null);

  // randomly choose between main and alt site on mount
  useEffect(() => {
    setUseAlt(Math.random() < 0.5);
  }, []);

  // don't render until we've decided which site to show
  if (useAlt === null) return null;

  if (useAlt) {
    return <AltSite onBack={() => setUseAlt(false)} />;
  }

  return (
    <div className="theme-wireframe">
      <MainSite onSwitch={() => setUseAlt(true)} />
    </div>
  );
}
