"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

// Fades + lifts its children into view once, as they scroll into the viewport.
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// A meandering "river" stroke that draws itself in when it scrolls into view.
export function RiverLine({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 1200 120" fill="none" preserveAspectRatio="none" className={className} aria-hidden="true">
      <motion.path
        d="M0 60 C 120 10, 220 110, 340 60 S 560 10, 680 60 S 900 110, 1020 60 S 1160 20, 1200 50"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={reduce ? false : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2.4, ease: [0.65, 0, 0.35, 1] }}
      />
    </svg>
  );
}
