"use client";

import { useEffect, useState } from "react";
import IntroLoader from "./IntroLoader";
import { preloadCritical } from "@/lib/preloadAssets";

export default function IntroWrapper({ children }: { children: React.ReactNode }) {
  const [showWebsite, setShowWebsite] = useState(false);
  const [loaderMounted, setLoaderMounted] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [playIntro, setPlayIntro] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const boot = window.__boot;

    const introDone = !!window.introComplete;

    const frameId = requestAnimationFrame(() => {
      setMounted(true);
      if (introDone) {
        setShowWebsite(true);
        setLoaderMounted(false);
      }
    });

    if (introDone) {
      // Intro already ran in this session (e.g. remount) – skip game and video.
      boot?.hide(true);
    } else {
      window.introComplete = false;

      // Load the intro video, 3D models and home images behind the block game.
      preloadCritical((p, groups) => boot?.setProgress(p, groups)).then(({ videoUrl }) => {
        if (cancelled) return;
        setVideoUrl(videoUrl);
        if (boot) {
          // Tell the player loading is done; they choose when to enter.
          boot.setReady();
          boot.onEnter(() => {
            boot.hide();
            setPlayIntro(true);
          });
        } else {
          setPlayIntro(true);
        }
      });
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
    };
  }, []);

  if (!mounted) {
    // Black backdrop under the boot game until hydration completes
    return <div className="fixed inset-0 bg-black z-[9999]" />;
  }

  return (
    <>
      {loaderMounted && (
        <IntroLoader
          videoUrl={videoUrl}
          play={playIntro}
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
