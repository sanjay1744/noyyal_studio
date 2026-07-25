"use client";

import { useEffect, useState } from "react";
import IntroLoader from "./IntroLoader";

export default function IntroWrapper({ children }: { children: React.ReactNode }) {
  const [showIntro, setShowIntro] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setMounted(true);
      if (typeof window !== "undefined") {
        (window as unknown as Record<string, unknown>).introComplete = false;
      }
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
    if (typeof window !== "undefined") {
      (window as unknown as Record<string, unknown>).introComplete = true;
      window.dispatchEvent(new Event("introComplete"));
    }
  };

  if (!mounted) {
    // Splash screen loader state to prevent flash of content during hydration
    return <div className="fixed inset-0 bg-black z-[9999]" />;
  }

  return (
    <>
      {showIntro && <IntroLoader onComplete={handleIntroComplete} />}
      <div style={{ visibility: showIntro ? "hidden" : "visible" }}>
        {children}
      </div>
    </>
  );
}
