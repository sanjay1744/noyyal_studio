"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setMounted(true);
    });
    
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('a, button, [role="button"], .interactive-element, .proj-list-row, .project-card-home, .research-card, .filter-chip, .sidebar-item')
      ) {
        setHovered(true);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('a, button, [role="button"], .interactive-element, .proj-list-row, .project-card-home, .research-card, .filter-chip, .sidebar-item')
      ) {
        setHovered(false);
      }
    };

    window.addEventListener("mousemove", updatePosition);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mouseout", handleMouseOut);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", updatePosition);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={clsx(
        "fixed pointer-events-none rounded-full bg-black mix-blend-multiply z-[9999] -translate-x-1/2 -translate-y-1/2 transition-[width,height] duration-200 ease-out hidden md:block",
        hovered ? "w-7 h-7" : "w-2.5 h-2.5"
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    />
  );
}
