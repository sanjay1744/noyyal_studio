"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { clsx } from "clsx";

const emptySubscribe = () => () => {};

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const coordsRef = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);
  const [cursorLabel, setCursorLabel] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  useEffect(() => {
    const updateCursor = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
      if (coordsRef.current) {
        coordsRef.current.textContent = `X: ${x}, Y: ${y}`;
      }
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        target.closest(
          'a, button, input, textarea, select, [role="button"], .interactive-element, .proj-list-row, .project-card-home, .research-card, .filter-chip, .sidebar-item'
        )
      ) {
        setHovered(true);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        target.closest(
          'a, button, input, textarea, select, [role="button"], .interactive-element, .proj-list-row, .project-card-home, .research-card, .filter-chip, .sidebar-item'
        )
      ) {
        setHovered(false);
        setCursorLabel(null);
      }
    };

    // Custom 3D mesh hover event listener
    const handleCustomHover = (e: Event) => {
      const customEvent = e as CustomEvent<{ hovering: boolean; label?: string }>;
      setHovered(customEvent.detail.hovering);
      setCursorLabel(customEvent.detail.label || null);
    };

    window.addEventListener("mousemove", updateCursor);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mouseout", handleMouseOut);
    window.addEventListener("custom-cursor-hover", handleCustomHover);

    return () => {
      window.removeEventListener("mousemove", updateCursor);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("custom-cursor-hover", handleCustomHover);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      ref={cursorRef}
      className={clsx(
        "fixed top-0 left-0 pointer-events-none z-[9999] transition-opacity duration-150 hidden md:block mix-blend-difference",
        isVisible ? "opacity-100" : "opacity-0"
      )}
      style={{
        willChange: "transform",
      }}
    >
      {/* Crosshair horizontal line */}
      <div 
        className={clsx(
          "absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 bg-white transition-all duration-200",
          hovered ? "w-10 h-[1.5px]" : "w-7 h-px"
        )} 
      />

      {/* Crosshair vertical line */}
      <div 
        className={clsx(
          "absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 bg-white transition-all duration-200",
          hovered ? "w-[1.5px] h-10" : "w-px h-7"
        )} 
      />

      {/* Center Reticle / Diamond Box */}
      <div
        className={clsx(
          "absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-out border border-white",
          hovered
            ? "w-[13px] h-[13px] bg-white/40 rotate-45 scale-110 shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            : "w-[5px] h-[5px] bg-white"
        )}
      />

      {/* Coordinates label & Action Hint */}
      <div className="absolute top-0 left-0 -translate-x-1/2 translate-y-4 text-white text-[9px] font-mono tracking-tight whitespace-nowrap flex flex-col items-center justify-center select-none font-medium pointer-events-none">
        <span ref={coordsRef}>X: 0, Y: 0</span>
        {hovered && cursorLabel && (
          <span className="text-[8px] tracking-widest uppercase font-bold text-white mt-0.5 animate-pulse">
            [{cursorLabel}]
          </span>
        )}
      </div>
    </div>
  );
}

