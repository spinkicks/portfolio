"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion, useScroll } from "framer-motion";

const DEFAULT_VH = 900;
let cachedVh = DEFAULT_VH;
const vhListeners = new Set<() => void>();
let resizeAttached = false;

function onWindowResize() {
  const next = window.innerHeight || DEFAULT_VH;
  if (next !== cachedVh) {
    cachedVh = next;
    vhListeners.forEach((listener) => listener());
  }
}

function subscribeVh(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  vhListeners.add(onStoreChange);
  if (!resizeAttached) {
    cachedVh = window.innerHeight || DEFAULT_VH;
    window.addEventListener("resize", onWindowResize, { passive: true });
    resizeAttached = true;
  }
  return () => {
    vhListeners.delete(onStoreChange);
    if (vhListeners.size === 0 && resizeAttached) {
      window.removeEventListener("resize", onWindowResize);
      resizeAttached = false;
    }
  };
}

function getVhSnapshot() {
  return typeof window === "undefined" ? DEFAULT_VH : window.innerHeight || cachedVh;
}

function getVhServerSnapshot() {
  return DEFAULT_VH;
}

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
  const vh = useSyncExternalStore(subscribeVh, getVhSnapshot, getVhServerSnapshot);

  return { reduceMotion, scrollY, vh };
}

