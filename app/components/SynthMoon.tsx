"use client";
import { motion, useScroll, useTransform } from "framer-motion";

export default function SynthMoon() {
  // 1. hook into the scroll progress (0 = top, 1 = bottom)
  const { scrollYProgress } = useScroll();

  // 2. map scroll to X coordinate (Moves Right -> Left)
  // Starts at 85% of screen width, ends at 15%
  const x = useTransform(scrollYProgress, [0, 1], ["71vw", "20vw"]);

  // 3. map scroll to Y coordinate; the
  // [start, middle, end] -> [low, high, low]
  // create parabola: starts at 200px from top, rises to 50px, drops back to 300px
  const y = useTransform(scrollYProgress, [0, 0.5, 1], ["21vh", "5vh", "18vh"]);

  // 4. scale it a little as it rises
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.2, 0.8]);

  return (
    <motion.div 
        style={{ x, y, scale }} 
        className="fixed top-0 left-0 z-10">
      <img 
        src="/moon-overlay.png" 
        alt="Synth Moon" 
        className="w-55 h-55 opacity-50 drop-shadow-[0_0_15px_rgba(100,200,255,0.4)]" 
      />
    </motion.div>
  );
}