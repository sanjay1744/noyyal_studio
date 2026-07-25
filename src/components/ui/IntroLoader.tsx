"use client";

import { useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";

interface IntroLoaderProps {
  onComplete: () => void;
}

export default function IntroLoader({ onComplete }: IntroLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleTransition = useCallback(() => {
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        yPercent: -100,
        duration: 1.2,
        ease: "power4.inOut",
        onComplete: onComplete
      });
    }
  }, [onComplete]);

  useEffect(() => {
    const failsafeTimeout = setTimeout(() => {
      handleTransition();
    }, 8000);

    return () => {
      clearTimeout(failsafeTimeout);
    };
  }, [handleTransition]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black z-[9999] flex items-center justify-center select-none"
    >
      <video
        ref={videoRef}
        src="/intro.mp4"
        autoPlay
        muted
        playsInline
        onEnded={handleTransition}
        className="w-full h-full object-contain bg-black"
      />
    </div>
  );
}
