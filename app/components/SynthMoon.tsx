"use client";
import { motion, useScroll, useTransform } from "framer-motion";

export default function SynthMoon() {
  // 1. hook into the scroll progress (0 = top, 1 = bottom)
  const { scrollYProgress } = useScroll();

  // 2. map scroll to X coordinate (Moves Right -> Left)
  // Starts at 85% of screen width, ends at 15%
  const x = useTransform(scrollYProgress, [0, 1], ["85vw", "15vw"]);

  // 3. map scroll to Y coordinate; the arc
  // [start, middle, end] -> [low, high, low]
  // create parabola: starts at 200px from top, rises to 50px, drops back to 300px
  const y = useTransform(scrollYProgress, [0, 0.5, 1], ["20vh", "5vh", "30vh"]);

  // 4. scale it a little as it rises
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.2, 0.8]);

  return (
    <motion.div
      style={{ x, y, scale }}
      className="fixed top-0 left-0 z-10 pointer-events-none"
    >
      {/* moon graphic */}
      {/* CSS box-shadow to create synthwave neon glow (testing) */}
      <div className="w-16 h-16 rounded-full bg-cyan-300 shadow-[0_0_20px_5px_rgba(34,211,238,0.6)]" />
    </motion.div>
  );
}