"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, Minimize2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Project } from "@/config/sanity";

interface CinematicScrollModalProps {
  project: Project;
  onClose: () => void;
}

interface SceneExplanation {
  index: number;
  num: string;
  title: string;
  badge: string;
  desc: string;
  details: string[];
}

const SCENES: SceneExplanation[] = [
  {
    index: 0,
    num: "01",
    title: "Monolithic Dravidian Threshold",
    badge: "Architectural Arrival",
    desc: "Heavy hand-troweled masonry massing defines the primary entry threshold, filtering direct tropical sunlight through recessed reveal joints.",
    details: ["Orientation: South-East", "Material: Local Brickwork", "Thermal Buffer: Vernacular Plinth"],
  },
  {
    index: 1,
    num: "02",
    title: "Courtyard & Vaulted Lightwell",
    badge: "Passive Stack Cooling",
    desc: "A central open sky-shaft draws ambient monsoon breeze through louvered brick openings, naturally cooling interior spaces without mechanical air conditioning.",
    details: ["Microclimate: Passive Air Draft", "Daylighting: Vaulted Lightwells", "Acoustics: Dampened Brick Echo"],
  },
  {
    index: 2,
    num: "03",
    title: "Textile & Craft Atelier",
    badge: "Spatial Program",
    desc: "Spacious open-plan studio organized around traditional loom geometry, bathed in soft glare-free north-facing clerestory daylight.",
    details: ["Floor Area: 340 sqm", "Structure: Exposed Concrete Beams", "Light Level: 450 Lux Uniform"],
  },
  {
    index: 3,
    num: "04",
    title: "Tactile Material Palette",
    badge: "Craft Joinery",
    desc: "Local Coimbatore laterite stone paired with reclaimed Malabar teak timber joinery and raw hand-cast brass hardware details.",
    details: ["Wood: Reclaimed Teak", "Metal: Raw Brushed Brass", "Finish: Natural Wax Polish"],
  },
  {
    index: 4,
    num: "05",
    title: "Floating Lattice Canopy",
    badge: "Canopy Synthesis",
    desc: "Cantilevered timber lattice roof canopy providing deep overhang shade while collecting rainwater for monsoon catchment basins below.",
    details: ["Overhang: 3.2m Cantilever", "Water Catchment: Integrated Flume", "Shade Coefficient: 85% Dynamic"],
  },
];

export default function CinematicScrollModal({
  project,
  onClose,
}: CinematicScrollModalProps) {
  const videoUrl = project.cinematicVideo;
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [isVideoReady, setIsVideoReady] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeStopIndex, setActiveStopIndex] = useState<number>(0);

  // Physics state
  const targetTimeRef = useRef<number>(0);
  const currentTimeRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const isInteractingRef = useRef<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const lastPointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // 5 Stop Timestamps based on video duration
  const getStopTimes = useCallback(() => {
    const dur = videoDuration || 5;
    return [0, dur * 0.25, dur * 0.5, dur * 0.75, dur * 0.98];
  }, [videoDuration]);

  // Jump smoothly to a scene
  const jumpToScene = useCallback(
    (sceneIdx: number) => {
      const stopTimes = getStopTimes();
      const targetTime = stopTimes[sceneIdx] || 0;
      targetTimeRef.current = targetTime;
      setActiveStopIndex(sceneIdx);

      const video = videoRef.current;
      if (video) {
        // If jumping forward, use hardware 60fps video playback
        if (targetTime > video.currentTime) {
          video.play().catch(() => {});
        } else {
          // If seeking backward, use fastSeek or currentTime
          if ("fastSeek" in video && typeof (video as HTMLVideoElement & { fastSeek: (t: number) => void }).fastSeek === "function") {
            (video as HTMLVideoElement & { fastSeek: (t: number) => void }).fastSeek(targetTime);
          } else {
            video.currentTime = targetTime;
          }
        }
      }
    },
    [getStopTimes]
  );

  // When video metadata is loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setVideoDuration(dur);
      setIsVideoReady(true);
      videoRef.current.currentTime = 0;
    }
  };

  // 60FPS Hardware Video Scrub & Smooth Seeking Engine
  useEffect(() => {
    let rafId: number;

    const physicsLoop = () => {
      const video = videoRef.current;
      if (!video) return;

      const dur = videoDuration || 5;
      const stopTimes = getStopTimes();

      if (isInteractingRef.current || isDraggingRef.current) {
        // User is scrolling / dragging
        velocityRef.current *= 0.86; // Viscous damping
        currentTimeRef.current += velocityRef.current;
        targetTimeRef.current = currentTimeRef.current;

        // Pause native play so we scrub
        if (!video.paused) video.pause();
      } else {
        // User released interaction: smooth spring lerp toward target stop time
        const targetT = targetTimeRef.current;
        const diff = targetT - video.currentTime;

        if (Math.abs(diff) > 0.05) {
          // If video is playing towards target, check when to pause
          if (diff > 0 && video.paused) {
            video.play().catch(() => {});
          }
        } else {
          if (!video.paused) video.pause();
          currentTimeRef.current = targetT;
        }
      }

      // Clamp time bounds [0, duration]
      currentTimeRef.current = Math.max(0, Math.min(dur, currentTimeRef.current));

      // Apply currentTime safely WITHOUT decoder congestion (check video.seeking guard)
      if (!video.seeking && (isInteractingRef.current || isDraggingRef.current)) {
        if (Math.abs(video.currentTime - currentTimeRef.current) > 0.02) {
          if ("fastSeek" in video && typeof (video as HTMLVideoElement & { fastSeek: (t: number) => void }).fastSeek === "function") {
            (video as HTMLVideoElement & { fastSeek: (t: number) => void }).fastSeek(currentTimeRef.current);
          } else {
            video.currentTime = currentTimeRef.current;
          }
        }
      }

      // Update active stop index
      let closestIdx = 0;
      let minDiff = Infinity;
      stopTimes.forEach((t, idx) => {
        const d = Math.abs(t - video.currentTime);
        if (d < minDiff) {
          minDiff = d;
          closestIdx = idx;
        }
      });
      setActiveStopIndex(closestIdx);

      rafId = requestAnimationFrame(physicsLoop);
    };

    rafId = requestAnimationFrame(physicsLoop);
    return () => cancelAnimationFrame(rafId);
  }, [videoDuration, getStopTimes]);

  // Handle Wheel Scroll
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    let interactionTimeout: NodeJS.Timeout;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      isInteractingRef.current = true;

      const dur = videoDuration || 5;
      const sensitivity = (dur / 30) * 0.005;
      velocityRef.current += e.deltaY * sensitivity;

      clearTimeout(interactionTimeout);
      interactionTimeout = setTimeout(() => {
        isInteractingRef.current = false;
        // Magnetic snap to closest stop time
        const stopTimes = getStopTimes();
        let closestIdx = 0;
        let minDiff = Infinity;
        stopTimes.forEach((t, idx) => {
          const d = Math.abs(t - currentTimeRef.current);
          if (d < minDiff) {
            minDiff = d;
            closestIdx = idx;
          }
        });
        targetTimeRef.current = stopTimes[closestIdx];
        setActiveStopIndex(closestIdx);
      }, 180);
    };

    const container = document.getElementById("cinematic-viewport-container");
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      clearTimeout(interactionTimeout);
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, [videoDuration, getStopTimes]);

  // Pointer & Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    isInteractingRef.current = true;
    lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaY = e.clientY - lastPointerPosRef.current.y;
    const deltaX = e.clientX - lastPointerPosRef.current.x;
    const delta = Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : deltaX;

    const dur = videoDuration || 5;
    const sensitivity = (dur / 30) * 0.012;
    velocityRef.current += delta * sensitivity;

    lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    setTimeout(() => {
      isInteractingRef.current = false;
      const stopTimes = getStopTimes();
      let closestIdx = 0;
      let minDiff = Infinity;
      stopTimes.forEach((t, idx) => {
        const d = Math.abs(t - currentTimeRef.current);
        if (d < minDiff) {
          minDiff = d;
          closestIdx = idx;
        }
      });
      targetTimeRef.current = stopTimes[closestIdx];
      setActiveStopIndex(closestIdx);
    }, 120);
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        const next = (activeStopIndex + 1) % SCENES.length;
        jumpToScene(next);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        const prev = (activeStopIndex - 1 + SCENES.length) % SCENES.length;
        jumpToScene(prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeStopIndex, jumpToScene, onClose]);

  const toggleFullscreenMode = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  };

  const currentScene = SCENES[activeStopIndex] || SCENES[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-[1000] bg-black text-white flex flex-col justify-between overflow-hidden select-none font-mono"
    >
      {/* ── TOP HEADER ── */}
      <header className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between p-6 md:p-8 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="font-syne text-[18px] md:text-[22px] font-extrabold tracking-tight text-white m-0 leading-none">
              {project.name}
            </h2>
            <div className="text-[9px] text-[#aaa] tracking-widest uppercase mt-1">
              {project.category} · {project.location}
            </div>
          </div>
        </div>

        {/* Minimal Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleFullscreenMode}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white hover:text-black transition-all cursor-pointer backdrop-blur-md text-white border border-white/20"
            title="Toggle Fullscreen Mode"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-2 text-[10px] tracking-widest uppercase bg-white text-black font-bold px-4 py-2 rounded-full hover:bg-gray-200 transition-all cursor-pointer shadow-lg"
          >
            <X className="w-4 h-4" />
            <span>Close (ESC)</span>
          </button>
        </div>
      </header>

      {/* ── MAIN VIDEO & SCENE VIEWPORT ── */}
      <div
        id="cinematic-viewport-container"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full relative cursor-grab active:cursor-grabbing flex items-center justify-center bg-black"
      >
        {videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            onLoadedMetadata={handleLoadedMetadata}
            preload="auto"
            muted
            playsInline
            className="w-full h-full object-cover pointer-events-none"
          />
        )}

        {/* Minimal Loader overlay while video initializes */}
        {!isVideoReady && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-20">
            <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4" />
            <div className="text-[10px] tracking-[0.25em] text-white/80 uppercase font-mono">
              Loading 3D Cinematic Scene...
            </div>
          </div>
        )}

        {/* ── 5 MINIMALIST CHAPTER DOT NAVIGATION ── */}
        <div className="absolute right-6 md:right-8 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-4 bg-black/50 backdrop-blur-xl px-2.5 py-5 rounded-full border border-white/15 shadow-2xl pointer-events-auto">
          {SCENES.map((scene, idx) => {
            const isActive = activeStopIndex === idx;
            return (
              <button
                key={scene.num}
                onClick={() => jumpToScene(idx)}
                className="group relative flex items-center justify-center p-1.5 cursor-pointer"
                title={`Jump to Scene ${scene.num}: ${scene.title}`}
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-3.5 h-3.5 bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)] scale-110"
                      : "w-2 h-2 bg-white/40 hover:bg-white"
                  }`}
                />
                <span className="absolute right-8 text-[9px] font-mono tracking-widest uppercase text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 border border-white/20 px-2.5 py-1 rounded-sm whitespace-nowrap pointer-events-none shadow-xl">
                  {scene.num} · {scene.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── SCENE EXPLANATION POP-UP CARD OVERLAY ── */}
        <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-40 max-w-lg w-[calc(100%-48px)] sm:w-auto pointer-events-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScene.num}
              initial={{ opacity: 0, y: 25, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="bg-black/85 backdrop-blur-xl border border-white/20 rounded-lg p-6 shadow-2xl text-white relative overflow-hidden"
            >
              {/* Subtle Ambient Glow */}
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Card Header */}
              <div className="flex items-center justify-between gap-4 mb-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono tracking-widest uppercase bg-emerald-950/90 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-xs font-bold">
                    SCENE {currentScene.num}
                  </span>
                  <span className="text-[9px] font-mono tracking-wider uppercase text-white/60">
                    {currentScene.badge}
                  </span>
                </div>

                {/* Prev / Next Scene Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      jumpToScene(
                        (activeStopIndex - 1 + SCENES.length) % SCENES.length
                      )
                    }
                    className="p-1 rounded-xs bg-white/10 hover:bg-white hover:text-black transition-colors cursor-pointer text-white"
                    title="Previous Scene"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      jumpToScene((activeStopIndex + 1) % SCENES.length)
                    }
                    className="p-1 rounded-xs bg-white/10 hover:bg-white hover:text-black transition-colors cursor-pointer text-white"
                    title="Next Scene"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Scene Title */}
              <h3 className="font-syne text-[18px] md:text-[20px] font-bold text-white tracking-tight leading-snug mb-2">
                {currentScene.title}
              </h3>

              {/* Scene Architectural Explanation */}
              <p className="font-playfair text-[13px] md:text-[14px] leading-relaxed text-white/85 m-0 mb-4">
                {currentScene.desc}
              </p>

              {/* Architectural Detail Pills */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                {currentScene.details.map((detail, dIdx) => (
                  <span
                    key={dIdx}
                    className="text-[8.5px] font-mono tracking-wider uppercase bg-white/10 text-white/90 border border-white/15 px-2.5 py-1 rounded-xs"
                  >
                    {detail}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
