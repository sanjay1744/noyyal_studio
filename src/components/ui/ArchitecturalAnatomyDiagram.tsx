"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Sun, Wind, Droplets, Layers, ArrowUpRight } from "lucide-react";

interface Hotspot {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  desc: string;
  icon: typeof Sun;
  x: number; // percentage
  y: number; // percentage
}

const HOTSPOTS: Hotspot[] = [
  {
    id: "plinth",
    num: "01",
    title: "Raised Riverbed Plinth",
    subtitle: "Adapting to the Noyyal River",
    desc: "A heavy granite plinth elevates inhabitation above seasonal monsoon river flows. We don't fight the terrain; we bend with it.",
    icon: Droplets,
    x: 28,
    y: 72,
  },
  {
    id: "courtyard",
    num: "02",
    title: "Passive Chimney Courtyard",
    subtitle: "Vernacular Thermal Draft",
    desc: "Central courtyard acts as a microclimate engine — pulling cool air off the shaded riverbed and exhausting tropical heat upward.",
    icon: Wind,
    x: 52,
    y: 48,
  },
  {
    id: "canopy",
    num: "03",
    title: "Cantilevered Timber Canopy",
    subtitle: "Light & Monsoon Shield",
    desc: "Deep overhangs shield structural walls from harsh midday sun while creating threshold verandas facing the valley fog.",
    icon: Sun,
    x: 74,
    y: 28,
  },
  {
    id: "mass",
    num: "04",
    title: "Laterite Thermal Mass",
    subtitle: "Material Honesty",
    desc: "Local quarried laterite walls absorb day heat and release warmth at night, mediating indoor temperatures naturally.",
    icon: Layers,
    x: 38,
    y: 35,
  },
];

export default function ArchitecturalAnatomyDiagram() {
  const [activeHotspot, setActiveHotspot] = useState<Hotspot>(HOTSPOTS[0]);

  return (
    <div className="w-full flex flex-col font-sans select-none">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between border-b border-[#222222]/20 pb-3 mb-4 font-mono text-[10px] uppercase text-[#111111]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#111111]" />
          <span className="font-bold tracking-widest">Architectural Anatomy Diagram</span>
        </div>
        <span className="text-gray">[SECTION NS-001 // TERRAIN INTEGRATION]</span>
      </div>

      {/* ── DIAGRAM CANVAS CONTAINER ── */}
      <div className="relative w-full aspect-[4/3] bg-[#F4F3EF] border border-[#222222] overflow-hidden group">
        {/* Background Architectural Blueprint Grid Lines */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #111111 1px, transparent 1px), linear-gradient(to bottom, #111111 1px, transparent 1px)`,
            backgroundSize: "32px 32px"
          }}
        />

        {/* Architectural Image / Diagram Illustration */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
          alt="Architectural Anatomy Section"
          className="w-full h-full object-cover grayscale contrast-125 opacity-85 group-hover:scale-102 transition-transform duration-700"
        />

        {/* Grayscale Architectural Overlay Mesh */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/80 via-black/30 to-transparent pointer-events-none" />

        {/* SVG SECTION VECTOR LINES & TERRAIN CURVE */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* River flow curve line */}
          <path d="M 0 85 Q 35 70, 65 90 T 100 75" fill="none" stroke="#FFFFFF" strokeWidth="0.75" strokeDasharray="2 2" opacity="0.6" />
          {/* Sun angle vector */}
          <line x1="85" y1="10" x2="52" y2="48" stroke="#FFFFFF" strokeWidth="0.5" strokeDasharray="1 2" opacity="0.5" />
        </svg>

        {/* INTERACTIVE HOTSPOT NODES */}
        {HOTSPOTS.map((hotspot) => {
          const isActive = activeHotspot.id === hotspot.id;
          const Icon = hotspot.icon;

          return (
            <button
              key={hotspot.id}
              onClick={() => setActiveHotspot(hotspot)}
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group/node cursor-pointer focus:outline-none"
            >
              {/* Outer Pulsing Ring */}
              <span
                className={`absolute inset-0 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-white/40 scale-150 animate-ping"
                    : "bg-white/20 group-hover/node:scale-125"
                }`}
              />

              {/* Inner Node Badge */}
              <div
                className={`relative w-8 h-8 rounded-full border flex items-center justify-center font-mono text-[10px] font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-white text-black border-black shadow-lg scale-110"
                    : "bg-black/70 text-white border-white/60 hover:bg-white hover:text-black"
                }`}
              >
                {hotspot.num}
              </div>
            </button>
          );
        })}

        {/* TOP RIGHT TAG */}
        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1.5 border border-white/10 text-white font-mono text-[9px] uppercase tracking-widest">
          INTERACTIVE DESIGN ANATOMY
        </div>
      </div>

      {/* ── ACTIVE HOTSPOT EXPLANATION CARD ── */}
      <div className="mt-4 p-5 bg-white border border-[#222222] flex flex-col justify-between min-h-[130px] shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeHotspot.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between border-b border-[#222222]/10 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold bg-black text-white px-2 py-0.5">
                  {activeHotspot.num}
                </span>
                <h4 className="text-sm font-bold uppercase tracking-tight text-black">
                  {activeHotspot.title}
                </h4>
              </div>
              <span className="font-mono text-[9.5px] text-gray uppercase tracking-wider">
                {activeHotspot.subtitle}
              </span>
            </div>

            <p className="text-xs text-mid leading-relaxed font-normal">
              {activeHotspot.desc}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-3 pt-2 border-t border-[#222222]/10 flex items-center justify-between font-mono text-[9px] text-gray uppercase tracking-widest">
          <span>Click numbered nodes (01-04) to explore design logic</span>
          <span>Noyyal Research Lab</span>
        </div>
      </div>
    </div>
  );
}
