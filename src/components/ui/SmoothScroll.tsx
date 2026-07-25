"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Expose lenis instance globally for ScrollTrigger or other components to interface with
    // Cast via unknown to Record<string, unknown> to avoid subsequent global conflicts and explicit-any lint warnings
    (window as unknown as Record<string, unknown>).lenis = lenis;

    return () => {
      lenis.destroy();
      (window as unknown as Record<string, unknown>).lenis = null;
    };
  }, []);

  return null;
}
