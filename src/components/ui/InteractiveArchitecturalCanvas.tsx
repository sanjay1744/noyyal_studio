"use client";

import { useEffect, useRef, useState } from "react";

export default function InteractiveArchitecturalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<"fluid" | "blueprint" | "speculative">("fluid");
  const [mousePos, setMousePos] = useState({ x: 250, y: 250 });
  const [isHovered, setIsHovered] = useState(false);
  const [flowSpeed, setFlowSpeed] = useState(1.5);
  const [contourCount, setContourCount] = useState(8);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.015 * flowSpeed;
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas with crisp off-white
      ctx.fillStyle = "#FAFAFA";
      ctx.fillRect(0, 0, width, height);

      // Draw technical blueprint grid
      ctx.strokeStyle = "rgba(34, 34, 34, 0.06)";
      ctx.lineWidth = 1;

      const gridSize = 25;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw concentric drafting guide circles around mouse or center
      const centerX = isHovered ? mousePos.x : width / 2;
      const centerY = isHovered ? mousePos.y : height / 2;

      ctx.strokeStyle = "rgba(17, 17, 17, 0.12)";
      ctx.setLineDash([3, 4]);
      for (let r = 40; r <= 220; r += 45) {
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // DRAW NOYYAL RIVER FLUID CONTOURS
      if (mode === "fluid" || mode === "speculative") {
        for (let i = 0; i < contourCount; i++) {
          const amplitude = 35 + i * 4;
          const opacity = Math.max(0.1, 1 - i / contourCount);

          ctx.strokeStyle = i === 0 ? "#111111" : `rgba(17, 17, 17, ${opacity * 0.7})`;
          ctx.lineWidth = i === 0 ? 2.5 : 1;

          ctx.beginPath();
          for (let x = 0; x <= width; x += 10) {
            // Fluid wave equation influenced by time and mouse position
            const mouseDist = Math.hypot(x - centerX, 250 - centerY);
            const mouseFactor = isHovered ? Math.sin(mouseDist * 0.02 - time) * 15 : 0;
            const y =
              height / 2 +
              Math.sin(x * 0.008 + time + i * 0.4) * amplitude +
              Math.cos(x * 0.015 - time) * 12 +
              mouseFactor +
              (i - contourCount / 2) * 18;

            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }

      // DRAW ARCHITECTURAL BLUEPRINT STRUCTURE
      if (mode === "blueprint" || mode === "speculative") {
        const boxX = 140;
        const boxY = 120;
        const boxW = 220;
        const boxH = 220;

        ctx.strokeStyle = "#111111";
        ctx.lineWidth = 1.5;

        // Outer isometric box projection
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        // Perspective projection lines to mouse
        ctx.strokeStyle = "rgba(34, 34, 34, 0.25)";
        ctx.setLineDash([2, 2]);

        ctx.beginPath();
        ctx.moveTo(boxX, boxY);
        ctx.lineTo(centerX, centerY);

        ctx.moveTo(boxX + boxW, boxY);
        ctx.lineTo(centerX, centerY);

        ctx.moveTo(boxX, boxY + boxH);
        ctx.lineTo(centerX, centerY);

        ctx.moveTo(boxX + boxW, boxY + boxH);
        ctx.lineTo(centerX, centerY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Internal cross section planes
        ctx.strokeStyle = "rgba(17, 17, 17, 0.5)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(boxX + boxW / 2, boxY);
        ctx.lineTo(boxX + boxW / 2, boxY + boxH);
        ctx.moveTo(boxX, boxY + boxH / 2);
        ctx.lineTo(boxX + boxW, boxY + boxH / 2);
        ctx.stroke();
      }

      // DRAW INTERACTIVE CURSOR CROSSHAIR & ANNOTATIONS
      if (isHovered) {
        ctx.strokeStyle = "#111111";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(mousePos.x - 12, mousePos.y);
        ctx.lineTo(mousePos.x + 12, mousePos.y);
        ctx.moveTo(mousePos.x, mousePos.y - 12);
        ctx.lineTo(mousePos.x, mousePos.y + 12);
        ctx.stroke();

        ctx.fillStyle = "#111111";
        ctx.font = "9px monospace";
        ctx.fillText(
          `X:${Math.round(mousePos.x)} Y:${Math.round(mousePos.y)}`,
          mousePos.x + 16,
          mousePos.y - 8
        );
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode, mousePos, isHovered, flowSpeed, contourCount]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* ── CANVAS HEADER CONTROLS ── */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#222222]/20 font-mono text-[10px] uppercase text-[#111111]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#111111] animate-pulse" />
          <span className="font-bold tracking-widest">Interactive Terrain Canvas</span>
        </div>

        {/* MODE TOGGLES */}
        <div className="flex items-center gap-1 bg-[#EAEAEA] p-1 rounded-sm border border-[#222222]/20">
          <button
            onClick={() => setMode("fluid")}
            className={`px-3 py-1 text-[9.5px] tracking-wider transition-colors duration-150 ${
              mode === "fluid"
                ? "bg-[#111111] text-white font-bold"
                : "text-gray hover:text-black"
            }`}
          >
            River Flow
          </button>
          <button
            onClick={() => setMode("blueprint")}
            className={`px-3 py-1 text-[9.5px] tracking-wider transition-colors duration-150 ${
              mode === "blueprint"
                ? "bg-[#111111] text-white font-bold"
                : "text-gray hover:text-black"
            }`}
          >
            Blueprint
          </button>
          <button
            onClick={() => setMode("speculative")}
            className={`px-3 py-1 text-[9.5px] tracking-wider transition-colors duration-150 ${
              mode === "speculative"
                ? "bg-[#111111] text-white font-bold"
                : "text-gray hover:text-black"
            }`}
          >
            Overlay
          </button>
        </div>
      </div>

      {/* ── CANVAS CONTAINER ── */}
      <div className="relative w-full aspect-square max-w-[480px] bg-[#FAFAFA] border border-[#222222] overflow-hidden shadow-lg group">
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="w-full h-full cursor-none block"
        />

        {/* OVERLAY TECHNICAL LABELS */}
        <div className="absolute top-4 left-4 pointer-events-none font-mono text-[9px] text-[#111111] tracking-widest uppercase space-y-1">
          <div>[SIMULATION: {mode.toUpperCase()}]</div>
          <div className="text-gray">VELOCITY: {(flowSpeed * 1.8).toFixed(1)} m/s</div>
        </div>

        <div className="absolute top-4 right-4 pointer-events-none font-mono text-[9px] text-[#111111] tracking-widest uppercase text-right">
          <div>SCALE 1:250</div>
          <div className="text-gray">PALANI HILLS / NOYYAL</div>
        </div>

        <div className="absolute bottom-4 left-4 pointer-events-none font-mono text-[9px] text-gray tracking-widest uppercase">
          MOVE CURSOR TO PERTURB WAVEFORM
        </div>

        <div className="absolute bottom-4 right-4 pointer-events-none font-mono text-[9px] text-[#111111] font-bold tracking-widest uppercase">
          NOYYAL LAB • 2026
        </div>
      </div>

      {/* ── PARAMETRIC SLIDERS ── */}
      <div className="w-full max-w-[480px] mt-4 grid grid-cols-2 gap-4 font-mono text-[10px] text-gray uppercase">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <span>Flow Wave Speed:</span>
            <span className="text-black font-bold">{flowSpeed.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={flowSpeed}
            onChange={(e) => setFlowSpeed(parseFloat(e.target.value))}
            className="accent-[#111111] h-1 bg-[#DDD] cursor-pointer"
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <span>Terrain Contours:</span>
            <span className="text-black font-bold">{contourCount} lines</span>
          </div>
          <input
            type="range"
            min="3"
            max="14"
            step="1"
            value={contourCount}
            onChange={(e) => setContourCount(parseInt(e.target.value))}
            className="accent-[#111111] h-1 bg-[#DDD] cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
