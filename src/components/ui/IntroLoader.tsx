"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { preloadProjects } from "@/lib/preloadAssets";

interface IntroLoaderProps {
  /** Preloaded (blob) URL of the intro video; null while still loading. */
  videoUrl: string | null;
  /** Start playback – set once the user leaves the boot game. */
  play: boolean;
  onTransitionStart: () => void;
  onComplete: () => void;
}

export default function IntroLoader({ videoUrl, play, onTransitionStart, onComplete }: IntroLoaderProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const transitionedRef = useRef(false);

  const handleTransition = useCallback(() => {
    if (transitionedRef.current) return;
    if (!containerRef.current || !videoRef.current || !logoRef.current) return;
    transitionedRef.current = true;

    // 1. Notify the parent wrapper to make the website DOM layout visible
    onTransitionStart();

    // 2. Wait for the browser paint cycle to lay out the DOM so we can measure the target bounds
    requestAnimationFrame(() => {
      if (!containerRef.current || !videoRef.current || !logoRef.current) return;

      // Disable mouse interactions on loader during transition phase
      containerRef.current.style.pointerEvents = "none";

      // Instantly initialize GSAP transform parameters to match the CSS centered position
      gsap.set(logoRef.current, { 
        opacity: 1,
        xPercent: -50,
        yPercent: -50,
        x: 0,
        y: 0,
        scale: 1,
        transformOrigin: "center center"
      });

      // Measure the exact layout positions of both the starting centered logo and the destination navbar logo
      const navbarLogo = document.getElementById("navbar-logo-svg");
      const startRect = logoRef.current.getBoundingClientRect();
      
      let targetX = 0;
      let targetY = 0;
      let scaleFactor = 32 / 96; // Fallback scale: Navbar width (32px) / Center width (96px)

      if (navbarLogo && startRect.width > 0) {
        const targetRect = navbarLogo.getBoundingClientRect();
        
        // Calculate centers of both elements relative to viewport
        const cx1 = startRect.left + startRect.width / 2;
        const cy1 = startRect.top + startRect.height / 2;
        const cx2 = targetRect.left + targetRect.width / 2;
        const cy2 = targetRect.top + targetRect.height / 2;
        
        // Calculate translation deltas and scale differences
        targetX = cx2 - cx1;
        targetY = cy2 - cy1;
        scaleFactor = targetRect.width / startRect.width;
      } else {
        // Fallback viewport estimate
        targetX = 48 - window.innerWidth / 2;
        targetY = 28 - window.innerHeight / 2;
      }

      // Dispatch the global introComplete event so the layout and page start their fade-in entrance animations
      window.introComplete = true;
      window.dispatchEvent(new Event("introComplete"));

      const transitionTimeline = gsap.timeline({
        onComplete: () => {
          // Wait 120ms before calling onComplete to unmount the loader container,
          // giving the browser time to settle without frame-drop stuttering.
          setTimeout(onComplete, 120);
        }
      });

      // Fade out the video elements
      transitionTimeline.to(videoRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut"
      }, 0);

      // Fade out the black overlay container backdrop
      transitionTimeline.to(containerRef.current, {
        backgroundColor: "rgba(0,0,0,0)",
        duration: 1.4,
        ease: "power3.inOut"
      }, 0);

      // Seamlessly transform the logo: translate and scale from center to target
      // Simultaneously morph stroke colors from white (#ffffff) to black (#0c0c0c)
      transitionTimeline.to(logoRef.current, {
        x: targetX,
        y: targetY,
        scale: scaleFactor,
        duration: 1.5,
        ease: "power4.inOut"
      }, 0);

      // Centrally orchestrate the navigation items fading in around the moving logo
      transitionTimeline.to(".nav-fade-in", {
        opacity: 1,
        duration: 1.2,
        ease: "power3.out"
      }, 0.2); // starts slightly after movement begins

      // Exact frame-perfect handoff:
      // Fade out floating logo and fade in permanent logo during the last 0.1 seconds of the timeline
      transitionTimeline.to(logoRef.current, {
        opacity: 0,
        duration: 0.1,
        ease: "none"
      }, 1.4);

      transitionTimeline.to("#navbar-logo-svg", {
        opacity: 1,
        duration: 0.1,
        ease: "none"
      }, 1.4);
    });
  }, [onTransitionStart, onComplete]);

  // Latest handleTransition without re-triggering the play effect on parent re-renders.
  const transitionRef = useRef(handleTransition);
  useEffect(() => {
    transitionRef.current = handleTransition;
  }, [handleTransition]);

  // Start the intro once the user leaves the boot game.
  useEffect(() => {
    if (!play || !videoUrl) return;
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => transitionRef.current());

    // Failsafe so a stalled video never leaves the site hidden.
    const duration = Number.isFinite(video.duration) ? video.duration * 1000 : 0;
    const failsafeTimeout = setTimeout(() => transitionRef.current(), Math.max(8000, duration + 2000));
    return () => clearTimeout(failsafeTimeout);
  }, [play, videoUrl]);

  // While the intro plays, quietly load the projects page in the background.
  const handlePlaying = useCallback(() => {
    preloadProjects((href) => router.prefetch(href));
  }, [router]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black z-[9999] flex items-center justify-center select-none overflow-hidden"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={logoRef}
        src="/n3.png"
        alt="Noyyal Studios Logo"
        className="fixed z-20 w-24 h-24 object-contain opacity-0 pointer-events-none"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)"
        }}
      />

      <video
        ref={videoRef}
        src={videoUrl ?? undefined}
        preload="auto"
        muted
        playsInline
        onPlaying={handlePlaying}
        onEnded={handleTransition}
        className="w-full h-full object-contain bg-black z-10"
      />
    </div>
  );
}
