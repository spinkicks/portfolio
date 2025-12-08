"use client";

import { useState } from "react";
import AltSite from "./components/AltSite";
import MainSite from "./components/MainSite";

export default function Home() {
  const [useAlt, setUseAlt] = useState(false);

  if (useAlt) {
    return <AltSite onBack={() => setUseAlt(false)} />;
  }

  return <MainSite onSwitch={() => setUseAlt(true)} />;
}
