"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { clsx } from "clsx";

const emptySubscribe = () => () => {};

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const coordsRef = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);
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
      }
    };

    window.addEventListener("mousemove", updateCursor);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.removeEventListener("mousemove", updateCursor);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      ref={cursorRef}
      className={clsx(
        "fixed top-0 left-0 pointer-events-none z-[9999] transition-opacity duration-150 hidden md:block",
        isVisible ? "opacity-100" : "opacity-0"
      )}
      style={{
        willChange: "transform",
      }}
    >
      {/* Crosshair horizontal line */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-7 h-px bg-black" />

      {/* Crosshair vertical line */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-px h-7 bg-black" />

      {/* Center Square */}
      <div
        className={clsx(
          "absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 bg-black transition-all duration-150 ease-out",
          hovered ? "w-[8px] h-[8px] rotate-45" : "w-[5px] h-[5px]"
        )}
      />

      {/* Coordinates label (no background) */}
      <div className="absolute top-0 left-0 -translate-x-1/2 translate-y-4 text-black text-[9px] font-mono tracking-tight whitespace-nowrap flex items-center justify-center select-none font-medium">
        <span ref={coordsRef}>X: 0, Y: 0</span>
      </div>
    </div>
  );
}

