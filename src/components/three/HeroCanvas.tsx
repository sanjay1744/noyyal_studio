"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import InteractiveBuilding from "./InteractiveBuilding";
import { Suspense, useState } from "react";
import { clsx } from "clsx";

export default function HeroCanvas() {
  const [filterMode, setFilterMode] = useState<"bw" | "color">("bw");
  const [isHovered, setIsHovered] = useState(false);

  // Effective grayscale is active if in B&W mode and user is not hovering over the 3D model
  const isGrayscaleActive = filterMode === "bw" && !isHovered;

  return (
    <div 
      className="w-full h-full min-h-[380px] lg:min-h-[480px] relative select-none group/canvas"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── VERY SMALL MINIMAL B&W / COLOR TOGGLE BUTTON ── */}
      <div className="absolute top-3 right-3 lg:top-4 lg:right-4 z-20 select-none">
        <div className="flex items-center bg-[#f0eee8]/90 backdrop-blur-md p-0.5 rounded-full border border-[#dcdcd4] shadow-2xs">
          <button
            onClick={() => setFilterMode("bw")}
            className={clsx(
              "px-2 py-0.5 text-[8px] font-mono tracking-wider uppercase rounded-full transition-all cursor-pointer",
              filterMode === "bw"
                ? "bg-black text-white font-semibold"
                : "text-[#777] hover:text-black"
            )}
            title="Black & White Grayscale Mode"
          >
            B&W
          </button>
          <button
            onClick={() => setFilterMode("color")}
            className={clsx(
              "px-2 py-0.5 text-[8px] font-mono tracking-wider uppercase rounded-full transition-all cursor-pointer",
              filterMode === "color"
                ? "bg-black text-white font-semibold"
                : "text-[#777] hover:text-black"
            )}
            title="Full Natural Color Mode"
          >
            Color
          </button>
        </div>
      </div>

      {/* ── 3D CANVAS WITH DYNAMIC B&W / COLOR HOVER FILTER ── */}
      <div 
        className={clsx(
          "w-full h-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isGrayscaleActive 
            ? "filter grayscale contrast-[1.08] brightness-[0.96]" 
            : "filter grayscale-0 contrast-100 brightness-100"
        )}
      >
        <Canvas
          camera={{ position: [8.5, 5, 10], fov: 36 }}
          style={{ background: "transparent", pointerEvents: "auto" }}
          gl={{ antialias: true, alpha: true, toneMapping: 4 }}
          dpr={[1, 2]}
          shadows
        >
          {/* Natural architectural lighting */}
          <ambientLight intensity={0.7} />

          {/* Main Sunlight */}
          <directionalLight
            position={[14, 18, 12]}
            intensity={1.9}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-left={-12}
            shadow-camera-right={12}
            shadow-camera-top={12}
            shadow-camera-bottom={-12}
            shadow-bias={-0.0003}
            color="#fff6ec"
          />

          {/* Secondary Fill Light */}
          <directionalLight position={[-8, 10, -6]} intensity={0.4} color="#dbe8ff" />

          {/* Sky / Ambient Bounce */}
          <hemisphereLight args={["#c6dbf0", "#b8b2a4", 0.35]} />

          {/* Contact Shadow directly under base (y = -0.01) */}
          <ContactShadows
            position={[0, -0.01, 0]}
            opacity={0.4}
            scale={16}
            blur={2}
            far={6}
            color="#1a1a1a"
          />

          {/* Orbit Controls locked to frame: pan disabled, fixed initial view */}
          <OrbitControls
            makeDefault
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            autoRotate={false}
            minPolarAngle={0.1}
            maxPolarAngle={Math.PI / 2.05}
            minDistance={4}
            maxDistance={20}
            dampingFactor={0.06}
            enableDamping={true}
            target={[0, 1.2, 0]}
          />

          <Suspense fallback={null}>
            <InteractiveBuilding />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}
