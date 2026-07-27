"use client";

import { useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";

interface IntroLoaderProps {
  onTransitionStart: () => void;
  onComplete: () => void;
}

export default function IntroLoader({ onTransitionStart, onComplete }: IntroLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const logoRef = useRef<SVGSVGElement>(null);

  const handleTransition = useCallback(() => {
    if (!containerRef.current || !videoRef.current || !logoRef.current) return;

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
        color: "#0c0c0c",
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

  useEffect(() => {
    // Failsafe timer (8 seconds) to prevent frozen screen if video hangs or autoplay block active
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
      className="fixed inset-0 bg-black z-[9999] flex items-center justify-center select-none overflow-hidden"
    >
      {/* Centered SVG Logo (overlay on top of final frame of video, starts at opacity 0) */}
      <svg
        ref={logoRef}
        viewBox="0 0 100 100"
        className="fixed z-20 w-24 h-24 text-white opacity-0 pointer-events-none"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)"
        }}
      >
        <rect x="3" y="3" width="94" height="94" fill="none" stroke="currentColor" strokeWidth="3"/>
        <line x1="3" y1="97" x2="97" y2="3" stroke="currentColor" strokeWidth="3"/>
        <path d="M10,75 C20,55 28,40 38,52 C48,64 52,72 62,58 C72,44 82,20 94,10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M3,85 C14,65 22,48 33,62 C44,76 48,84 58,68 C68,52 78,28 97,15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>

      <video
        ref={videoRef}
        src="/intro.mp4"
        autoPlay
        muted
        playsInline
        onEnded={handleTransition}
        className="w-full h-full object-contain bg-black z-10"
      />
    </div>
  );
}
