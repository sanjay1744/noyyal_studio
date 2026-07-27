"use client";

import { useEffect, useState } from "react";
import IntroLoader from "./IntroLoader";

export default function IntroWrapper({ children }: { children: React.ReactNode }) {
  const [showWebsite, setShowWebsite] = useState(false);
  const [loaderMounted, setLoaderMounted] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setMounted(true);
      
      const isIntroComplete = typeof window !== "undefined" && 
                               (window as unknown as Record<string, unknown>).introComplete;
      if (isIntroComplete) {
        setShowWebsite(true);
        setLoaderMounted(false);
      } else {
        if (typeof window !== "undefined") {
          (window as unknown as Record<string, unknown>).introComplete = false;
        }
      }
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  if (!mounted) {
    // Splash screen loader state to prevent flash of content during hydration
    return <div className="fixed inset-0 bg-black z-[9999]" />;
  }

  return (
    <>
      {loaderMounted && (
        <IntroLoader 
          onTransitionStart={() => setShowWebsite(true)} 
          onComplete={() => setLoaderMounted(false)} 
        />
      )}
      <div style={{ visibility: showWebsite ? "visible" : "hidden" }}>
        {children}
      </div>
    </>
  );
}
