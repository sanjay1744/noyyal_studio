"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Maximize2, 
  Minimize2, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Scan, 
  Eye, 
  EyeOff 
} from "lucide-react";
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
  
  // Mobile Efficiency & Fit States
  const [objectFit, setObjectFit] = useState<"cover" | "contain">("cover");
  const [isCardCollapsed, setIsCardCollapsed] = useState<boolean>(false);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

  // Auto-adapt for mobile viewports on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setObjectFit("contain");
      setIsCardCollapsed(true);
    }
  }, []);

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
        if (targetTime > video.currentTime) {
          video.play().catch(() => {});
        } else {
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
        velocityRef.current *= 0.86;
        currentTimeRef.current += velocityRef.current;
        targetTimeRef.current = currentTimeRef.current;

        if (!video.paused) video.pause();
      } else {
        const targetT = targetTimeRef.current;
        const diff = targetT - video.currentTime;

        if (Math.abs(diff) > 0.05) {
          if (diff > 0 && video.paused) {
            video.play().catch(() => {});
          }
        } else {
          if (!video.paused) video.pause();
          currentTimeRef.current = targetT;
        }
      }

      currentTimeRef.current = Math.max(0, Math.min(dur, currentTimeRef.current));

      if (!video.seeking && (isInteractingRef.current || isDraggingRef.current)) {
        if (Math.abs(video.currentTime - currentTimeRef.current) > 0.02) {
          if ("fastSeek" in video && typeof (video as HTMLVideoElement & { fastSeek: (t: number) => void }).fastSeek === "function") {
            (video as HTMLVideoElement & { fastSeek: (t: number) => void }).fastSeek(currentTimeRef.current);
          } else {
            video.currentTime = currentTimeRef.current;
          }
        }
      }

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
      } else if (e.key === "f" || e.key === "F") {
        setIsFocusMode((prev) => !prev);
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
      {/* ── TOP HEADER (Hideable in Focus Mode) ── */}
      <AnimatePresence>
        {!isFocusMode && (
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between p-3 sm:p-5 md:p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-auto gap-2"
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="min-w-0">
                <h2 className="font-syne text-[13px] sm:text-[18px] md:text-[22px] font-extrabold tracking-tight text-white m-0 leading-tight truncate">
                  {project.name}
                </h2>
                <div className="text-[7.5px] sm:text-[9px] text-[#aaa] tracking-widest uppercase mt-0.5 truncate">
                  {project.category} · {project.location.split(",")[0]}
                </div>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Fit Mode Toggle: Contain vs Cover */}
              <button
                onClick={() => setObjectFit(objectFit === "cover" ? "contain" : "cover")}
                className="p-1.5 sm:p-2.5 rounded-full bg-white/10 hover:bg-white hover:text-black transition-all cursor-pointer backdrop-blur-md text-white border border-white/20 flex items-center gap-1 text-[8px] sm:text-[9px] tracking-wider uppercase px-2 sm:px-3"
                title={objectFit === "cover" ? "Show Entire Uncropped Image (Contain)" : "Fill Screen (Cover)"}
              >
                <Scan className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{objectFit === "cover" ? "Fit" : "Fill"}</span>
              </button>

              {/* Focus Mode (Hide UI) Toggle */}
              <button
                onClick={() => setIsFocusMode(true)}
                className="p-1.5 sm:p-2.5 rounded-full bg-white/10 hover:bg-white hover:text-black transition-all cursor-pointer backdrop-blur-md text-white border border-white/20 hidden sm:flex"
                title="Hide Controls (Focus View)"
              >
                <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreenMode}
                className="p-1.5 sm:p-2.5 rounded-full bg-white/10 hover:bg-white hover:text-black transition-all cursor-pointer backdrop-blur-md text-white border border-white/20"
                title="Toggle Fullscreen Mode"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="flex items-center gap-1 text-[8.5px] sm:text-[10px] tracking-widest uppercase bg-white text-black font-bold px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full hover:bg-gray-200 transition-all cursor-pointer shadow-lg"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Close</span>
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Floating Restore UI button when in Focus Mode */}
      {isFocusMode && (
        <button
          onClick={() => setIsFocusMode(false)}
          className="absolute top-3 right-3 z-50 p-2.5 rounded-full bg-black/80 text-white backdrop-blur-md border border-white/30 hover:bg-white hover:text-black transition-all cursor-pointer flex items-center gap-1.5 text-[9px] uppercase tracking-wider"
          title="Restore Controls"
        >
          <Eye className="w-4 h-4" />
          <span>Show UI</span>
        </button>
      )}

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
            className={`w-full h-full transition-all duration-300 pointer-events-none ${
              objectFit === "cover" ? "object-cover" : "object-contain bg-black"
            }`}
          />
        )}

        {/* Minimal Loader overlay while video initializes */}
        {!isVideoReady && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-20">
            <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mb-3 sm:mb-4" />
            <div className="text-[9px] sm:text-[10px] tracking-[0.25em] text-white/80 uppercase font-mono">
              Loading 3D Cinematic Scene...
            </div>
          </div>
        )}

        {/* ── 5 MINIMALIST CHAPTER DOT NAVIGATION (Hideable in Focus Mode) ── */}
        {!isFocusMode && (
          <div className="absolute right-1.5 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2 sm:gap-4 bg-[#1a1614]/55 backdrop-blur-xl px-1.5 py-3 sm:px-2.5 sm:py-5 rounded-full border border-[#4a3e35]/50 shadow-2xl pointer-events-auto">
            {SCENES.map((scene, idx) => {
              const isActive = activeStopIndex === idx;
              return (
                <button
                  key={scene.num}
                  onClick={() => jumpToScene(idx)}
                  className="group relative flex items-center justify-center p-1 sm:p-1.5 cursor-pointer"
                  title={`Jump to Scene ${scene.num}: ${scene.title}`}
                >
                  <span
                    className={`block rounded-full transition-all duration-300 ${
                      isActive
                        ? "w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-[#dda15e] shadow-[0_0_12px_rgba(221,161,94,0.85)] scale-110"
                        : "w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#ede0d4]/40 hover:bg-[#fefae0]"
                    }`}
                  />
                  <span className="absolute right-7 sm:right-8 text-[8px] sm:text-[9px] font-mono tracking-widest uppercase text-[#fefae0] opacity-0 group-hover:opacity-100 transition-opacity bg-[#1c1816]/95 border border-[#5c493c]/60 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-sm whitespace-nowrap pointer-events-none shadow-xl">
                    {scene.num} · {scene.title}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── SCENE EXPLANATION POP-UP CARD OVERLAY (Hideable in Focus Mode & Collapsible) ── */}
        {!isFocusMode && (
          <div className="absolute bottom-2 left-2 right-12 sm:right-auto sm:left-6 sm:bottom-6 md:left-10 md:bottom-10 z-40 max-w-lg sm:max-w-md md:max-w-lg pointer-events-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScene.num + (isCardCollapsed ? "-collapsed" : "-expanded")}
                initial={{ opacity: 0, y: 15, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="bg-[#1c1815]/75 backdrop-blur-xl border border-[#4a3b32]/60 rounded-lg p-3 sm:p-5 md:p-6 shadow-2xl text-[#fefae0] relative overflow-hidden"
              >
                {/* Ambient Glow */}
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#cb997e]/15 rounded-full blur-2xl pointer-events-none" />

                {/* Card Header Bar */}
                <div className="flex items-center justify-between gap-2 border-b border-[#4a3b32]/50 pb-2 sm:pb-3">
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <span className="text-[8px] sm:text-[10px] font-mono tracking-widest uppercase bg-[#342820]/90 text-[#eddcd2] border border-[#7f5539]/60 px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded-xs font-bold shrink-0">
                      SCENE {currentScene.num}
                    </span>
                    <span className="text-[7.5px] sm:text-[9px] font-mono tracking-wider uppercase text-[#ddb892]/80 truncate">
                      {currentScene.badge}
                    </span>
                  </div>

                  {/* Scene Jump & Card Collapse Controls */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() =>
                        jumpToScene(
                          (activeStopIndex - 1 + SCENES.length) % SCENES.length
                        )
                      }
                      className="p-1 sm:p-1.5 rounded-xs bg-[#382b22]/70 hover:bg-[#eddcd2] hover:text-[#1c1815] border border-[#5c493c]/40 transition-colors cursor-pointer text-[#fefae0]"
                      title="Previous Scene"
                    >
                      <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        jumpToScene((activeStopIndex + 1) % SCENES.length)
                      }
                      className="p-1 sm:p-1.5 rounded-xs bg-[#382b22]/70 hover:bg-[#eddcd2] hover:text-[#1c1815] border border-[#5c493c]/40 transition-colors cursor-pointer text-[#fefae0]"
                      title="Next Scene"
                    >
                      <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                    <button
                      onClick={() => setIsCardCollapsed(!isCardCollapsed)}
                      className="p-1 sm:p-1.5 rounded-xs bg-[#5c493c]/60 hover:bg-[#eddcd2] hover:text-[#1c1815] border border-[#7f5539]/60 transition-colors cursor-pointer text-[#fefae0] ml-1 flex items-center gap-0.5 text-[8px] font-mono"
                      title={isCardCollapsed ? "Expand Details" : "Collapse Card"}
                    >
                      {isCardCollapsed ? (
                        <>
                          <ChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span className="hidden sm:inline">More</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span className="hidden sm:inline">Hide</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Scene Title */}
                <h3 className="font-syne text-[13px] sm:text-[18px] md:text-[20px] font-bold text-[#fefae0] tracking-tight leading-snug mt-2 mb-1 truncate">
                  {currentScene.title}
                </h3>

                {/* Expanded Details Section */}
                {!isCardCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Scene Architectural Explanation */}
                    <p className="font-playfair text-[11px] sm:text-[13px] md:text-[14px] leading-relaxed text-[#ede0d4]/90 m-0 mb-3 sm:mb-4 line-clamp-3 sm:line-clamp-none">
                      {currentScene.desc}
                    </p>

                    {/* Architectural Detail Pills */}
                    <div className="flex flex-wrap gap-1 sm:gap-2 pt-2 border-t border-[#4a3b32]/50">
                      {currentScene.details.map((detail, dIdx) => (
                        <span
                          key={dIdx}
                          className="text-[7.5px] sm:text-[8.5px] font-mono tracking-wider uppercase bg-[#382b22]/50 text-[#e6ccb2] border border-[#5c493c]/40 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-xs"
                        >
                          {detail}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

