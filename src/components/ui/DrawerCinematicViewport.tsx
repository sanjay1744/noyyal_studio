"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, ChevronLeft, ChevronRight, Sparkles, MoveDown } from "lucide-react";
import { Project } from "@/config/sanity";

interface DrawerCinematicViewportProps {
  project: Project;
  onOpenFullscreen: () => void;
}

interface SceneExplanation {
  index: number;
  num: string;
  title: string;
  badge: string;
  desc: string;
  details: string[];
  thumbnail: string;
}

const STOP_RATIOS = [0, 0.25, 0.5, 0.75, 0.98];

const DRAWER_SCENES: SceneExplanation[] = [
  {
    index: 0,
    num: "01",
    title: "Monolithic Dravidian Threshold",
    badge: "Arrival Threshold",
    desc: "Heavy hand-troweled masonry massing defines the primary entry threshold, filtering direct tropical sunlight.",
    details: ["South-East Entry", "Local Brickwork", "Vernacular Plinth"],
    thumbnail: "/projects_/commercial/nool/frame_001.jpg",
  },
  {
    index: 1,
    num: "02",
    title: "Courtyard & Vaulted Lightwell",
    badge: "Stack Cooling",
    desc: "A central open sky-shaft draws ambient monsoon breeze through louvered brick openings.",
    details: ["Passive Air Draft", "Vaulted Lightwells", "Brick Louvers"],
    thumbnail: "/projects_/commercial/nool/frame_007.jpg",
  },
  {
    index: 2,
    num: "03",
    title: "Textile & Craft Atelier",
    badge: "Spatial Program",
    desc: "Spacious open-plan studio organized around traditional loom geometry, bathed in soft clerestory daylight.",
    details: ["340 sqm Area", "Concrete Beams", "450 Lux Uniform"],
    thumbnail: "/projects_/commercial/nool/frame_015.jpg",
  },
  {
    index: 3,
    num: "04",
    title: "Tactile Material Palette",
    badge: "Craft Joinery",
    desc: "Local Coimbatore laterite stone paired with reclaimed Malabar teak timber joinery and raw brass details.",
    details: ["Reclaimed Teak", "Raw Brass Details", "Natural Wax Finish"],
    thumbnail: "/projects_/commercial/nool/frame_022.jpg",
  },
  {
    index: 4,
    num: "05",
    title: "Floating Lattice Canopy",
    badge: "Canopy Synthesis",
    desc: "Cantilevered timber lattice roof canopy providing deep overhang shade while collecting rainwater.",
    details: ["3.2m Cantilever", "Water Catchment", "85% Shade Factor"],
    thumbnail: "/projects_/commercial/nool/frame_030.jpg",
  },
];

export default function DrawerCinematicViewport({
  project,
  onOpenFullscreen,
}: DrawerCinematicViewportProps) {
  const videoUrl = project.cinematicVideo;
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [isVideoReady, setIsVideoReady] = useState<boolean>(false);
  const [activeStopIndex, setActiveStopIndex] = useState<number>(0);

  // Mobile Efficiency & Fit States
  const [objectFit, setObjectFit] = useState<"cover" | "contain">("cover");
  const [isCardCollapsed, setIsCardCollapsed] = useState<boolean>(false);

  // Auto-adapt on mobile
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

  const getStopTimes = useCallback(() => {
    const dur = videoDuration || 5;
    return STOP_RATIOS.map((r) => r * dur);
  }, [videoDuration]);

  // Jump to specific stop point
  const jumpToStopPoint = useCallback(
    (stopIdx: number) => {
      const stopTimes = getStopTimes();
      const targetTime = stopTimes[stopIdx] || 0;
      targetTimeRef.current = targetTime;
      setActiveStopIndex(stopIdx);

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

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setVideoDuration(dur);
      setIsVideoReady(true);
      videoRef.current.currentTime = 0;
    }
  };

  // 60FPS Video Scrub Loop
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

  // Wheel listener inside viewport
  useEffect(() => {
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

    const container = document.getElementById("drawer-viewport-container");
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      clearTimeout(interactionTimeout);
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, [videoDuration, getStopTimes]);

  // Pointer & Drag
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

  const currentScene = DRAWER_SCENES[activeStopIndex] || DRAWER_SCENES[0];

  return (
    <div className="flex flex-col gap-6">
      {/* ── TOP HERO MAIN FRAME: INTERACTIVE 3D CINEMATIC VIEWPORT ── */}
      <div className="w-full aspect-[16/10] sm:aspect-[16/10] bg-black rounded-sm overflow-hidden relative shadow-lg group select-none">
        <div
          id="drawer-viewport-container"
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

          {!isVideoReady && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-20">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-3" />
              <div className="text-[9px] tracking-[0.2em] text-white/80 uppercase font-mono">
                Loading 3D Viewport...
              </div>
            </div>
          )}

          {/* Top Controls: Fit Mode & Fullscreen Buttons */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-30 flex items-center gap-1.5 pointer-events-auto">
            <button
              onClick={() => setObjectFit(objectFit === "cover" ? "contain" : "cover")}
              className="p-1.5 sm:p-2 bg-black/70 hover:bg-white hover:text-black text-white backdrop-blur-md rounded-full transition-all border border-white/20 cursor-pointer shadow-md flex items-center gap-1 text-[8px] sm:text-[9px] font-mono tracking-wider uppercase px-2.5 sm:px-3"
              title={objectFit === "cover" ? "Fit Entire Image (Contain)" : "Fill Frame (Cover)"}
            >
              <span>{objectFit === "cover" ? "Fit" : "Fill"}</span>
            </button>

            <button
              onClick={onOpenFullscreen}
              className="p-1.5 sm:p-2 bg-black/70 hover:bg-white hover:text-black text-white backdrop-blur-md rounded-full transition-all border border-white/20 cursor-pointer shadow-md flex items-center gap-1 text-[8px] sm:text-[9px] font-mono tracking-wider uppercase px-2.5 sm:px-3"
              title="Open Fullscreen View"
            >
              <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Full Screen</span>
            </button>
          </div>

          {/* Overlay Scene Callout Card inside Main Frame */}
          <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 z-30 pointer-events-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScene.num + (isCardCollapsed ? "-collapsed" : "-expanded")}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-[#1c1815]/75 backdrop-blur-md border border-[#4a3b32]/60 rounded-sm p-2.5 sm:p-4 text-[#fefae0] shadow-xl flex flex-col gap-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <span className="text-[7.5px] sm:text-[8.5px] font-mono tracking-widest uppercase bg-[#342820]/90 text-[#eddcd2] border border-[#7f5539]/60 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-xs font-bold shrink-0">
                      STOP {currentScene.num}
                    </span>
                    <span className="text-[7.5px] sm:text-[8.5px] font-mono tracking-wider uppercase text-[#ddb892]/70 truncate">
                      {currentScene.badge}
                    </span>
                  </div>

                  {/* Prev / Next / Collapse Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() =>
                        jumpToStopPoint(
                          (activeStopIndex - 1 + DRAWER_SCENES.length) %
                            DRAWER_SCENES.length
                        )
                      }
                      className="p-1 sm:p-1.5 rounded-xs bg-[#382b22]/70 hover:bg-[#eddcd2] hover:text-[#1c1815] border border-[#5c493c]/40 transition-colors cursor-pointer text-[#fefae0]"
                      title="Previous Scene"
                    >
                      <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        jumpToStopPoint(
                          (activeStopIndex + 1) % DRAWER_SCENES.length
                        )
                      }
                      className="p-1 sm:p-1.5 rounded-xs bg-[#382b22]/70 hover:bg-[#eddcd2] hover:text-[#1c1815] border border-[#5c493c]/40 transition-colors cursor-pointer text-[#fefae0]"
                      title="Next Scene"
                    >
                      <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                    <button
                      onClick={() => setIsCardCollapsed(!isCardCollapsed)}
                      className="p-1 sm:p-1.5 rounded-xs bg-[#5c493c]/60 hover:bg-[#eddcd2] hover:text-[#1c1815] border border-[#7f5539]/60 transition-colors cursor-pointer text-[#fefae0] ml-0.5"
                      title={isCardCollapsed ? "Expand Details" : "Collapse Card"}
                    >
                      <span className="text-[7.5px] font-mono">{isCardCollapsed ? "More" : "Hide"}</span>
                    </button>
                  </div>
                </div>

                <h4 className="font-syne text-[11px] sm:text-[14px] font-bold text-[#fefae0] tracking-tight leading-snug truncate m-0">
                  {currentScene.title}
                </h4>

                {!isCardCollapsed && (
                  <p className="font-playfair text-[10px] sm:text-[11.5px] leading-normal text-[#ede0d4]/85 line-clamp-2 mt-0.5 m-0">
                    {currentScene.desc}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW: 5 STOP POINT THUMBNAILS ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[8px] sm:text-[9px] tracking-[0.2em] sm:tracking-[0.25em] text-[#888] uppercase font-mono font-semibold truncate">
            5 Key Viewpoints
          </div>
          <div className="text-[7.5px] sm:text-[8.5px] font-mono text-[#888] flex items-center gap-1 shrink-0">
            <MoveDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#b08968] animate-pulse" />
            <span className="hidden sm:inline">Scroll video or click to jump</span>
            <span className="sm:hidden">Tap to jump</span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5">
          {DRAWER_SCENES.map((scene, sIdx) => {
            const isActive = activeStopIndex === sIdx;
            return (
              <button
                key={scene.num}
                onClick={() => jumpToStopPoint(sIdx)}
                className={`flex flex-col rounded-sm overflow-hidden border transition-all relative cursor-pointer group/thumb bg-white text-left ${
                  isActive
                    ? "border-black scale-102 shadow-md ring-1 sm:ring-2 ring-black/20"
                    : "border-[#e5e3dc] opacity-75 hover:opacity-100 hover:border-black/50"
                }`}
              >
                {/* Thumbnail Frame Image */}
                <div className="w-full aspect-[4/3] bg-[#eae8e1] overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={scene.thumbnail}
                    alt={scene.title}
                    className="w-full h-full object-cover group-hover/thumb:scale-1.08 transition-transform duration-500"
                  />
                  <div className="absolute top-0.5 left-0.5 bg-black/80 backdrop-blur-xs text-white text-[6.5px] sm:text-[7.5px] font-mono px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded-xs font-bold">
                    {scene.num}
                  </div>
                </div>

                {/* Thumbnail Caption */}
                <div className="p-1 sm:p-2 bg-white flex flex-col justify-between">
                  <div className="text-[7.5px] sm:text-[9px] font-mono font-bold text-black truncate leading-tight">
                    {scene.title}
                  </div>
                  <div className="text-[6.5px] sm:text-[7.5px] font-mono text-[#777] truncate mt-0.5 hidden sm:block">
                    {scene.badge}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
