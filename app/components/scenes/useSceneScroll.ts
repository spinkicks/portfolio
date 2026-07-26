"use client";

import { useEffect, useState } from "react";
import { useReducedMotion, useScroll } from "framer-motion";

/**
 * Scroll plumbing shared by the parallax scenes.
 *
 * Deliberately keyed to viewport height rather than document progress: the
 * hero backdrop should settle after roughly one screen of scrolling no matter
 * how long the page below it grows.
 */
export function useSceneScroll() {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const [vh, setVh] = useState(900);

  useEffect(() => {
    const update = () => setVh(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return { reduceMotion, scrollY, vh };
}
