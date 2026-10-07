"use client";

import { useEffect, useRef, useState, useMemo, useCallback, Suspense } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import { Project, ProjectCategory } from "@/config/sanity";
import { getOrLoadImage } from "./FrameTextureCanvas";
import { 
  ArrowRight, 
  Sparkles, 
  Compass, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Layers, 
  CornerDownRight,
  Eye
} from "lucide-react";
import { clsx } from "clsx";

// ── HALLWAY DEFINITIONS MATCHING EXACT ARCHITECTURAL GEOMETRY ──
export interface HallwayConfig {
  category: ProjectCategory;
  title: string;
  subtitle: string;
  // Position & rotation of the portal arch in the lobby rotunda
  portalPos: [number, number, number];
  portalRot: [number, number, number]; // Euler Y rotation
  // Camera focus viewpoint when framing this specific doorway directly
  focusCamPos: [number, number, number];
  focusLookAt: [number, number, number];
  // Camera entrance target when walking deep through the portal
  walkInCamPos: [number, number, number];
  walkInLookAt: [number, number, number];
  // Sample project hero image for corridor framed artwork
  previewImage: string;
  previewTitle: string;
}

export const HALLWAYS: HallwayConfig[] = [
  {
    category: "Residences",
    title: "RESIDENCES",
    subtitle: "5 PROJECTS",
    portalPos: [-7.6, 0, -2.4],
    portalRot: [0, Math.PI * 0.18, 0],
    focusCamPos: [-3.3, 1.45, -1.05],
    focusLookAt: [-7.6, 1.45, -2.4],
    walkInCamPos: [-9.5, 1.4, -6.5],
    walkInLookAt: [-10.2, 1.4, -12.0],
    previewImage: "/projects_/RESIDENCE/THE BLOCK HOUSE/5.png",
    previewTitle: "House on the Slope",
  },
  {
    category: "Interior",
    title: "INTERIOR",
    subtitle: "1 PROJECT",
    portalPos: [-3.3, 0, -5.2],
    portalRot: [0, Math.PI * 0.06, 0],
    focusCamPos: [-0.89, 1.45, -1.4],
    focusLookAt: [-3.3, 1.45, -5.2],
    walkInCamPos: [-3.6, 1.4, -10.5],
    walkInLookAt: [-3.8, 1.4, -16.0],
    previewImage: "/projects_/INTERIOR/BLOCK RESIDENCE/signal-2025-10-30-14-21-39-668_002.jpg",
    previewTitle: "Monolithic Micro-Cement Penthouse",
  },
  {
    category: "Unbuilt",
    title: "UNBUILT",
    subtitle: "2 PROJECTS",
    portalPos: [3.3, 0, -5.2],
    portalRot: [0, -Math.PI * 0.06, 0],
    focusCamPos: [0.89, 1.45, -1.4],
    focusLookAt: [3.3, 1.45, -5.2],
    walkInCamPos: [3.6, 1.4, -10.5],
    walkInLookAt: [3.8, 1.4, -16.0],
    previewImage: "/projects_/UNBUILT/THE CONTRAST/a1.png",
    previewTitle: "Terra Cotta Monolith Study",
  },
  {
    category: "Commercial",
    title: "COMMERCIAL",
    subtitle: "2 PROJECTS",
    portalPos: [7.6, 0, -2.4],
    portalRot: [0, -Math.PI * 0.18, 0],
    focusCamPos: [3.3, 1.45, -1.05],
    focusLookAt: [7.6, 1.45, -2.4],
    walkInCamPos: [9.5, 1.4, -6.5],
    walkInLookAt: [10.2, 1.4, -12.0],
    previewImage: "/projects_/commercial/THE WEAVERS/1.jpg",
    previewTitle: "Noyyal Craft & Cultural Center",
  },
];

// ── PROCEDURAL RICH HARDWOOD PARQUET FLOOR TEXTURE ──
function createWoodFloorTexture(): THREE.CanvasTexture {
  if (typeof document === "undefined") {
    return new THREE.Texture() as unknown as THREE.CanvasTexture;
  }
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Warm rich mahogany wood base
  ctx.fillStyle = "#2d160e";
  ctx.fillRect(0, 0, 1024, 1024);

  const plankHeight = 32;
  const plankWidth = 128;
  const rows = Math.ceil(1024 / plankHeight);
  const cols = Math.ceil(1024 / plankWidth) + 1;

  for (let r = 0; r < rows; r++) {
    const rowOffset = (r % 2) * (plankWidth / 2);
    for (let c = -1; c < cols; c++) {
      const x = c * plankWidth + rowOffset;
      const y = r * plankHeight;

      // Color variation per plank
      const hueShift = (Math.random() - 0.5) * 6;
      const lightness = 18 + Math.random() * 8;
      ctx.fillStyle = `hsl(${18 + hueShift}, 48%, ${lightness}%)`;
      ctx.fillRect(x, y, plankWidth - 2, plankHeight - 2);

      // Wood grain lines
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      for (let g = 0; g < 4; g++) {
        const gy = y + 4 + Math.random() * (plankHeight - 8);
        ctx.fillRect(x, gy, plankWidth - 2, 1 + Math.random() * 1.5);
      }

      // Specular highlight strip
      ctx.fillStyle = "rgba(255,200,160,0.04)";
      ctx.fillRect(x, y, plankWidth - 2, 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// ── ARTWORK TEXTURE HELPER ──
function createCorridorArtworkTexture(imageUrl: string, title: string): THREE.CanvasTexture {
  if (typeof document === "undefined") {
    return new THREE.Texture() as unknown as THREE.CanvasTexture;
  }
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 768;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = "#111214";
  ctx.fillRect(0, 0, 1024, 768);

  // Outer frame
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 6;
  ctx.strokeRect(20, 20, 984, 728);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const img = getOrLoadImage(imageUrl, () => {
    if (img && img.complete && ctx) {
      ctx.drawImage(img, 40, 40, 944, 620);
      ctx.fillStyle = "#0a0a0c";
      ctx.fillRect(40, 660, 944, 68);
      ctx.fillStyle = "#ffffff";
      ctx.font = "600 20px sans-serif";
      ctx.fillText(title.toUpperCase(), 60, 702);
      texture.needsUpdate = true;
    }
  });

  if (img && img.complete) {
    ctx.drawImage(img, 40, 40, 944, 620);
    ctx.fillStyle = "#0a0a0c";
    ctx.fillRect(40, 660, 944, 68);
    ctx.fillStyle = "#ffffff";
    ctx.font = "600 20px sans-serif";
    ctx.fillText(title.toUpperCase(), 60, 702);
  } else {
    ctx.fillStyle = "#22252a";
    ctx.fillRect(40, 40, 944, 620);
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "18px monospace";
    ctx.fillText("NOYYAL ARCHITECTURAL EXHIBITION", 60, 360);
  }

  return texture;
}

// ── 3D POTTED PLANT COMPONENT ──
function PottedPlant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.24, 0.9, 16]} />
        <meshStandardMaterial color="#4a4c4e" roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.88, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.05, 16]} />
        <meshStandardMaterial color="#221812" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.035, 0.045, 0.9, 8]} />
        <meshStandardMaterial color="#4a3b2c" roughness={0.8} />
      </mesh>
      <group position={[0, 1.7, 0]}>
        <mesh position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.38, 12, 12]} />
          <meshStandardMaterial color="#2c4228" roughness={0.6} />
        </mesh>
        <mesh position={[0.2, -0.1, 0.1]}>
          <sphereGeometry args={[0.26, 10, 10]} />
          <meshStandardMaterial color="#385433" roughness={0.6} />
        </mesh>
        <mesh position={[-0.18, -0.05, -0.12]}>
          <sphereGeometry args={[0.28, 10, 10]} />
          <meshStandardMaterial color="#273d24" roughness={0.6} />
        </mesh>
        <mesh position={[-0.1, 0.3, 0.15]}>
          <sphereGeometry args={[0.22, 10, 10]} />
          <meshStandardMaterial color="#43633e" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

// ── 3D CENTER GALLERY BENCH ──
function GalleryBench({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.44, 0.95]} />
        <meshStandardMaterial color="#737578" roughness={0.7} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.49, 0]} castShadow>
        <boxGeometry args={[2.65, 0.12, 0.82]} />
        <meshStandardMaterial color="#1a1c1e" roughness={0.35} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.552, 0]}>
        <planeGeometry args={[0.015, 0.8]} />
        <meshBasicMaterial color="#0b0c0d" />
      </mesh>
    </group>
  );
}

// ── INDIVIDUAL HALLWAY PORTAL & DEEP CORRIDOR ──
function HallwayPortal({
  config,
  categoryCount,
  isHovered,
  isActive,
  isEntering,
  onHover,
  onClick,
}: {
  config: HallwayConfig;
  categoryCount: number;
  isHovered: boolean;
  isActive: boolean;
  isEntering: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
}) {
  const artworkTex = useMemo(() => {
    return createCorridorArtworkTexture(config.previewImage, config.previewTitle);
  }, [config.previewImage, config.previewTitle]);

  const portalWidth = 2.7;
  const portalHeight = 4.2;
  const corridorDepth = 9.0;

  // Lintel highlight color based on active/hover status
  const casingColor = isActive ? "#3f4247" : isHovered ? "#35373c" : "#282a2d";
  const emissiveColor = isActive ? "#26292e" : isHovered ? "#181a1d" : "#000000";

  return (
    <group
      position={config.portalPos}
      rotation={config.portalRot}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(true);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("custom-cursor-hover", { detail: { hovering: true } }));
        }
      }}
      onPointerOut={() => {
        onHover(false);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("custom-cursor-hover", { detail: { hovering: false } }));
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* ── 3D CATEGORY TITLE & COUNT ON TOP OF THE PORTAL ── */}
      <group position={[0, portalHeight + 0.45, 0]}>
        {/* Main Category Title */}
        <Text
          position={[0, 0.22, 0.05]}
          fontSize={0.25}
          letterSpacing={0.22}
          color={isActive ? "#000000" : isHovered ? "#111111" : "#333333"}
          anchorX="center"
          anchorY="middle"
        >
          {config.title}
        </Text>

        {/* Project Count Subtitle */}
        <Text
          position={[0, -0.06, 0.05]}
          fontSize={0.12}
          letterSpacing={0.28}
          color={isActive ? "#b45309" : isHovered ? "#d97706" : "#666666"}
          anchorX="center"
          anchorY="middle"
        >
          {`${categoryCount} ${categoryCount === 1 ? "PROJECT" : "PROJECTS"}`}
        </Text>
      </group>

      {/* ── DARK BRONZE / STEEL ARCHITECTURAL PORTAL CASING ── */}
      <group position={[0, portalHeight / 2, 0]}>
        {/* Left Portal Column */}
        <mesh position={[-portalWidth / 2 - 0.12, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.24, portalHeight, 0.5]} />
          <meshStandardMaterial
            color={casingColor}
            roughness={0.3}
            metalness={0.4}
            emissive={emissiveColor}
          />
        </mesh>
        {/* Right Portal Column */}
        <mesh position={[portalWidth / 2 + 0.12, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.24, portalHeight, 0.5]} />
          <meshStandardMaterial
            color={casingColor}
            roughness={0.3}
            metalness={0.4}
            emissive={emissiveColor}
          />
        </mesh>
        {/* Top Header Lintel */}
        <mesh position={[0, portalHeight / 2 + 0.12, 0]} castShadow receiveShadow>
          <boxGeometry args={[portalWidth + 0.48, 0.24, 0.5]} />
          <meshStandardMaterial
            color={casingColor}
            roughness={0.3}
            metalness={0.4}
            emissive={emissiveColor}
          />
        </mesh>

        {/* Interactive Click Hitbox across entire portal */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[portalWidth + 0.6, portalHeight + 1.2]} />
          <meshBasicMaterial visible={false} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* ── DEEP LIT CORRIDOR INTERIOR EXTENDING BACKWARDS ── */}
      <group position={[0, portalHeight / 2, -corridorDepth / 2 - 0.2]}>
        {/* Left Corridor Wall */}
        <mesh position={[-portalWidth / 2, 0, 0]} receiveShadow>
          <boxGeometry args={[0.08, portalHeight, corridorDepth]} />
          <meshStandardMaterial color="#eae8e2" roughness={0.8} />
        </mesh>
        {/* Right Corridor Wall */}
        <mesh position={[portalWidth / 2, 0, 0]} receiveShadow>
          <boxGeometry args={[0.08, portalHeight, corridorDepth]} />
          <meshStandardMaterial color="#eae8e2" roughness={0.8} />
        </mesh>
        {/* Corridor Ceiling */}
        <mesh position={[0, portalHeight / 2, 0]} receiveShadow>
          <boxGeometry args={[portalWidth, 0.08, corridorDepth]} />
          <meshStandardMaterial color="#f0eee8" roughness={0.7} />
        </mesh>
        {/* Corridor Ceiling Warm Recessed Light Strip */}
        <mesh position={[0, portalHeight / 2 - 0.02, 0]}>
          <planeGeometry args={[0.2, corridorDepth - 1.0]} />
          <meshBasicMaterial color={isActive || isHovered ? "#fff5d8" : "#f5e8c4"} />
        </mesh>
        {/* Corridor Floor */}
        <mesh position={[0, -portalHeight / 2, 0]} receiveShadow>
          <boxGeometry args={[portalWidth, 0.08, corridorDepth]} />
          <meshStandardMaterial color="#351e14" roughness={0.35} metalness={0.1} />
        </mesh>

        {/* Corridor End Portal Opening / Backlit Gallery Threshold */}
        <mesh position={[0, 0, -corridorDepth / 2 + 0.05]}>
          <planeGeometry args={[portalWidth, portalHeight]} />
          <meshBasicMaterial color="#fbfaf6" />
        </mesh>

        {/* Framed Preview Artwork on Corridor Wall */}
        <mesh position={[-portalWidth / 2 + 0.05, 0.1, -1.0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[2.0, 1.4]} />
          <meshStandardMaterial map={artworkTex} roughness={0.2} />
        </mesh>

        {/* Small Placard under Artwork */}
        <mesh position={[-portalWidth / 2 + 0.05, -0.75, -1.0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.45, 0.12]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>

        {/* Interior Point Light inside corridor */}
        <pointLight 
          position={[0, 1.2, 0]} 
          intensity={isActive ? 2.6 : isHovered ? 2.2 : 1.6} 
          color="#fff6e8" 
          distance={7} 
        />
      </group>
    </group>
  );
}

// ── 3D ROTUNDA SCENE ARCHITECTURE & LIGHTING ──
function LobbyRotundaContent({
  allProjects,
  selectedCategory,
  activeFolder,
  onFolderChange,
  onEnterFolder,
  isTransitioning,
}: {
  allProjects: Project[];
  selectedCategory: string;
  activeFolder: ProjectCategory | null;
  onFolderChange: (cat: ProjectCategory | null) => void;
  onEnterFolder: (config: HallwayConfig) => void;
  isTransitioning: boolean;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [hoveredHallway, setHoveredHallway] = useState<string | null>(null);

  // Dynamic category counts
  const counts = useMemo(() => {
    const res: Record<string, number> = {};
    HALLWAYS.forEach((h) => {
      res[h.category] = allProjects.filter((p) => p.category === h.category).length;
    });
    return res;
  }, [allProjects]);

  const woodFloorTex = useMemo(() => createWoodFloorTexture(), []);

  // Standard Lobby Overview Camera Positions
  const overviewPos = useMemo(() => new THREE.Vector3(0, 1.45, 4.4), []);
  const overviewTarget = useMemo(() => new THREE.Vector3(0, 1.45, -5.2), []);

  // 1. Initial Scene Entrance Animation (Arrival Glide)
  useEffect(() => {
    // Start camera high up in architectural crane view
    camera.position.set(0, 3.8, 7.2);
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 1.45, -5.2);
      controlsRef.current.enabled = false;
    }

    // Smooth crane glide down into eye-level position
    gsap.to(camera.position, {
      x: overviewPos.x,
      y: overviewPos.y,
      z: overviewPos.z,
      duration: 1.8,
      ease: "power3.out",
      onUpdate: () => {
        if (controlsRef.current) controlsRef.current.update();
      },
      onComplete: () => {
        if (controlsRef.current) controlsRef.current.enabled = true;
      },
    });
  }, [camera, overviewPos]);

  // 2. Folder Switch Camera Glide & LookAt Framing
  useEffect(() => {
    if (isTransitioning || !controlsRef.current) return;

    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(controlsRef.current.target);

    if (activeFolder) {
      const config = HALLWAYS.find((h) => h.category === activeFolder);
      if (config) {
        const targetPos = new THREE.Vector3(...config.focusCamPos);
        const targetLook = new THREE.Vector3(...config.focusLookAt);

        gsap.to(camera.position, {
          x: targetPos.x,
          y: targetPos.y,
          z: targetPos.z,
          duration: 1.1,
          ease: "power2.inOut",
          onUpdate: () => {
            if (controlsRef.current) controlsRef.current.update();
          },
        });

        gsap.to(controlsRef.current.target, {
          x: targetLook.x,
          y: targetLook.y,
          z: targetLook.z,
          duration: 1.1,
          ease: "power2.inOut",
          onUpdate: () => {
            if (controlsRef.current) controlsRef.current.update();
          },
        });
      }
    } else {
      // Return smoothly to Rotunda Overview
      gsap.to(camera.position, {
        x: overviewPos.x,
        y: overviewPos.y,
        z: overviewPos.z,
        duration: 1.0,
        ease: "power2.out",
        onUpdate: () => {
          if (controlsRef.current) controlsRef.current.update();
        },
      });

      gsap.to(controlsRef.current.target, {
        x: overviewTarget.x,
        y: overviewTarget.y,
        z: overviewTarget.z,
        duration: 1.0,
        ease: "power2.out",
        onUpdate: () => {
          if (controlsRef.current) controlsRef.current.update();
        },
      });
    }
  }, [activeFolder, isTransitioning, camera, overviewPos, overviewTarget]);

  // Handle Walking Through Hallway with Cinematic Acceleration in 3D
  const handleWalkIn = useCallback(
    (config: HallwayConfig) => {
      if (isTransitioning) return;

      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }

      gsap.killTweensOf(camera.position);

      const targetCam = new THREE.Vector3(...config.walkInCamPos);
      const targetLook = new THREE.Vector3(...config.walkInLookAt);

      const currentLookAt = new THREE.Vector3();
      if (controlsRef.current) {
        currentLookAt.copy(controlsRef.current.target);
      } else {
        currentLookAt.copy(overviewTarget);
      }

      const timeline = gsap.timeline({
        onComplete: () => {
          onEnterFolder(config);
        },
      });

      // 1. Align camera lookAt directly into hallway
      timeline.to(
        currentLookAt,
        {
          x: targetLook.x,
          y: targetLook.y,
          z: targetLook.z,
          duration: 0.5,
          ease: "power2.inOut",
          onUpdate: () => {
            camera.lookAt(currentLookAt);
          },
        },
        0
      );

      // 2. Accelerate camera smoothly down the corridor
      timeline.to(
        camera.position,
        {
          x: targetCam.x,
          y: targetCam.y,
          z: targetCam.z,
          duration: 1.2,
          ease: "power3.inOut",
          onUpdate: () => {
            camera.lookAt(currentLookAt);
          },
        },
        0.15
      );
    },
    [isTransitioning, camera, overviewTarget, onEnterFolder]
  );

  // Active portal position for focused spotlight
  const activePortal = useMemo(() => {
    return HALLWAYS.find((h) => h.category === activeFolder) || null;
  }, [activeFolder]);

  // Clamp camera orbit safely within lobby rotunda bounds
  useFrame(() => {
    if (controlsRef.current && !isTransitioning) {
      controlsRef.current.target.y = THREE.MathUtils.clamp(controlsRef.current.target.y, 0.8, 2.2);
    }
  });

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        target={[0, 1.45, -5.2]}
        enableDamping
        dampingFactor={0.06}
        enablePan={false}
        enableZoom={true}
        zoomSpeed={0.4}
        minPolarAngle={Math.PI * 0.35}
        maxPolarAngle={Math.PI * 0.52}
        minAzimuthAngle={-Math.PI * 0.3}
        maxAzimuthAngle={Math.PI * 0.3}
        minDistance={2.0}
        maxDistance={7.0}
      />

      {/* ── LIGHTING SETUP ── */}
      <ambientLight intensity={1.1} color="#fffcf8" />

      {/* Skylight Diffuse Directional Light */}
      <directionalLight
        position={[0, 8, -2]}
        intensity={2.2}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Center Rotunda Warm Ambient Point Light */}
      <pointLight position={[0, 4.5, 0]} intensity={2.5} color="#fff7e6" distance={16} />

      {/* Baseboard Ambient Floor Glow */}
      <pointLight position={[0, 0.3, -4]} intensity={1.0} color="#ffeedd" distance={8} />

      {/* Focused Spotlight on Active Folder Portal */}
      {activePortal && (
        <pointLight
          position={[activePortal.portalPos[0], 4.2, activePortal.portalPos[2] + 1.2]}
          intensity={3.5}
          color="#fffaee"
          distance={10}
        />
      )}

      {/* ── ROTUNDA ARCHITECTURAL GEOMETRY ── */}
      <group>
        {/* 1. Hardwood Parquet Floor */}
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[28, 28]} />
          <meshStandardMaterial map={woodFloorTex} roughness={0.25} metalness={0.08} />
        </mesh>

        {/* 2. Curved Rotunda Walls (Museum-grade plaster) */}
        {/* Center Wall */}
        <mesh position={[0, 3.2, -7.2]} receiveShadow>
          <planeGeometry args={[4.2, 6.4]} />
          <meshStandardMaterial color="#f7f6f2" roughness={0.85} />
        </mesh>
        {/* Left Mid Wall */}
        <mesh position={[-5.4, 3.2, -6.1]} rotation={[0, Math.PI * 0.12, 0]} receiveShadow>
          <planeGeometry args={[4.2, 6.4]} />
          <meshStandardMaterial color="#f7f6f2" roughness={0.85} />
        </mesh>
        {/* Right Mid Wall */}
        <mesh position={[5.4, 3.2, -6.1]} rotation={[0, -Math.PI * 0.12, 0]} receiveShadow>
          <planeGeometry args={[4.2, 6.4]} />
          <meshStandardMaterial color="#f7f6f2" roughness={0.85} />
        </mesh>
        {/* Left Far Wall */}
        <mesh position={[-10.2, 3.2, -3.2]} rotation={[0, Math.PI * 0.26, 0]} receiveShadow>
          <planeGeometry args={[5.2, 6.4]} />
          <meshStandardMaterial color="#f7f6f2" roughness={0.85} />
        </mesh>
        {/* Right Far Wall */}
        <mesh position={[10.2, 3.2, -3.2]} rotation={[0, -Math.PI * 0.26, 0]} receiveShadow>
          <planeGeometry args={[5.2, 6.4]} />
          <meshStandardMaterial color="#f7f6f2" roughness={0.85} />
        </mesh>

        {/* Baseboard Cove Light Strips */}
        <mesh position={[0, 0.04, -7.15]}>
          <boxGeometry args={[4.2, 0.08, 0.06]} />
          <meshBasicMaterial color="#fffaee" />
        </mesh>
        <mesh position={[-5.4, 0.04, -6.05]} rotation={[0, Math.PI * 0.12, 0]}>
          <boxGeometry args={[4.2, 0.08, 0.06]} />
          <meshBasicMaterial color="#fffaee" />
        </mesh>
        <mesh position={[5.4, 0.04, -6.05]} rotation={[0, -Math.PI * 0.12, 0]}>
          <boxGeometry args={[4.2, 0.08, 0.06]} />
          <meshBasicMaterial color="#fffaee" />
        </mesh>

        {/* 3. Ceiling & Recessed Skylight */}
        <mesh position={[0, 6.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[28, 28]} />
          <meshStandardMaterial color="#fbfaf7" roughness={0.8} />
        </mesh>

        <group position={[0, 6.35, -2.5]}>
          <mesh position={[0, 0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[6.4, 4.2]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0.05, 2.1]}>
            <boxGeometry args={[6.4, 0.08, 0.08]} />
            <meshBasicMaterial color="#ffeed4" />
          </mesh>
          <mesh position={[0, 0.05, -2.1]}>
            <boxGeometry args={[6.4, 0.08, 0.08]} />
            <meshBasicMaterial color="#ffeed4" />
          </mesh>
          <mesh position={[3.2, 0.05, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[4.2, 0.08, 0.08]} />
            <meshBasicMaterial color="#ffeed4" />
          </mesh>
          <mesh position={[-3.2, 0.05, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[4.2, 0.08, 0.08]} />
            <meshBasicMaterial color="#ffeed4" />
          </mesh>
        </group>

        {/* ── 4. FEATURE WALL DIRECTORY ── */}
        <group position={[0, 3.2, -7.15]}>
          <Text
            position={[0, 0.95, 0.02]}
            fontSize={0.34}
            letterSpacing={0.28}
            color="#111111"
            anchorX="center"
            anchorY="middle"
          >
            PROJECTS
          </Text>

          <mesh position={[0, 0.45, 0.02]}>
            <planeGeometry args={[0.008, 0.42]} />
            <meshBasicMaterial color="#333333" transparent opacity={0.5} />
          </mesh>

          {(["Residences", "Commercial", "Interior", "Unbuilt"] as ProjectCategory[]).map(
            (cat, idx) => {
              const yPos = 0.05 - idx * 0.22;
              const isHoveredCat = hoveredHallway === cat;
              const isSelectedCat = activeFolder === cat;
              const cfg = HALLWAYS.find((h) => h.category === cat);

              return (
                <group
                  key={cat}
                  position={[0, yPos, 0.02]}
                  onPointerOver={(e) => {
                    e.stopPropagation();
                    setHoveredHallway(cat);
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(
                        new CustomEvent("custom-cursor-hover", { detail: { hovering: true } })
                      );
                    }
                  }}
                  onPointerOut={() => {
                    setHoveredHallway(null);
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(
                        new CustomEvent("custom-cursor-hover", { detail: { hovering: false } })
                      );
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (cfg) {
                      handleWalkIn(cfg);
                    }
                  }}
                >
                  <Text
                    position={[0, 0, 0]}
                    fontSize={0.095}
                    letterSpacing={0.24}
                    color={isSelectedCat ? "#b45309" : isHoveredCat ? "#000000" : "#555555"}
                    anchorX="center"
                    anchorY="middle"
                  >
                    {cat.toUpperCase()}
                  </Text>
                  <mesh position={[0, 0, 0]}>
                    <planeGeometry args={[1.6, 0.18]} />
                    <meshBasicMaterial visible={false} />
                  </mesh>
                </group>
              );
            }
          )}
        </group>

        {/* ── 5. THE 4 HALLWAY PORTALS WITH DEEP CORRIDORS ── */}
        {HALLWAYS.map((hConfig) => (
          <HallwayPortal
            key={hConfig.category}
            config={hConfig}
            categoryCount={counts[hConfig.category] || 0}
            isHovered={hoveredHallway === hConfig.category}
            isActive={activeFolder === hConfig.category}
            isEntering={isTransitioning}
            onHover={(hovered) => setHoveredHallway(hovered ? hConfig.category : null)}
            onClick={() => {
              handleWalkIn(hConfig);
            }}
          />
        ))}

        {/* ── 6. FLANKING POTTED PLANTS & BENCH ── */}
        <PottedPlant position={[-1.75, 0, -6.6]} />
        <PottedPlant position={[1.75, 0, -6.6]} />
        <PottedPlant position={[-5.3, 0, -4.8]} />
        <PottedPlant position={[5.3, 0, -4.8]} />
        <GalleryBench position={[0, 0, 0.2]} />
      </group>
    </>
  );
}

// ── MAIN PROJECTS LOBBY SCENE EXPORT ──
export default function ProjectsLobbyScene({
  allProjects,
  selectedCategory = "All",
  onSelectCategory,
  onBackToGrid,
}: {
  allProjects: Project[];
  selectedCategory?: string;
  onSelectCategory: (cat: ProjectCategory) => void;
  onBackToGrid?: () => void;
}) {
  const [activeFolder, setActiveFolder] = useState<ProjectCategory | null>(
    selectedCategory !== "All" ? (selectedCategory as ProjectCategory) : null
  );
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Dynamic counts for each category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allProjects.length };
    HALLWAYS.forEach((h) => {
      counts[h.category] = allProjects.filter((p) => p.category === h.category).length;
    });
    return counts;
  }, [allProjects]);

  // Handle Walking Through Hallway into Category
  const handleEnterFolder = useCallback(
    (config: HallwayConfig) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      onSelectCategory(config.category);
      setIsTransitioning(false);
    },
    [isTransitioning, onSelectCategory]
  );

  // Keyboard navigation for smooth folder switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioning) return;

      const categoryKeys: ProjectCategory[] = ["Residences", "Interior", "Unbuilt", "Commercial"];

      if (e.key === "ArrowRight") {
        if (!activeFolder) {
          setActiveFolder(categoryKeys[0]);
        } else {
          const currentIdx = categoryKeys.indexOf(activeFolder);
          const nextIdx = (currentIdx + 1) % categoryKeys.length;
          setActiveFolder(categoryKeys[nextIdx]);
        }
      } else if (e.key === "ArrowLeft") {
        if (!activeFolder) {
          setActiveFolder(categoryKeys[categoryKeys.length - 1]);
        } else {
          const currentIdx = categoryKeys.indexOf(activeFolder);
          const prevIdx = (currentIdx - 1 + categoryKeys.length) % categoryKeys.length;
          setActiveFolder(categoryKeys[prevIdx]);
        }
      } else if (e.key === "Escape") {
        setActiveFolder(null);
      } else if (e.key === "Enter" || e.key === " ") {
        if (activeFolder) {
          const cfg = HALLWAYS.find((h) => h.category === activeFolder);
          if (cfg) handleEnterFolder(cfg);
        }
      } else if (e.key === "1") {
        setActiveFolder("Residences");
      } else if (e.key === "2") {
        setActiveFolder("Interior");
      } else if (e.key === "3") {
        setActiveFolder("Unbuilt");
      } else if (e.key === "4") {
        setActiveFolder("Commercial");
      } else if (e.key === "0") {
        setActiveFolder(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeFolder, isTransitioning, handleEnterFolder]);

  return (
    <div className="relative w-full h-full min-h-[600px] bg-[#f7f6f2] text-black overflow-hidden select-none">
      {/* ── TOP BREADCRUMB & CONTROLS HUD ── */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-black/10 shadow-xs pointer-events-auto">
          <span className="text-[9.5px] font-mono tracking-widest uppercase text-black/60 font-semibold">
            Noyyal Rotunda Lobby
          </span>
          <span className="text-black/30 text-xs">/</span>
          <span className="text-[9.5px] font-mono tracking-widest uppercase text-black font-bold">
            {activeFolder ? `${activeFolder.toUpperCase()} FOLDER` : "ALL ARCHIVES"}
          </span>
        </div>

        {/* Keyboard shortcut hints badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur-md border border-black/5 text-[9px] font-mono tracking-wider text-black/50">
          <span>[← / →] Switch Folders</span>
          <span>·</span>
          <span>[Enter] Walk In</span>
          <span>·</span>
          <span>[Esc] Overview</span>
        </div>
      </div>

      {/* ── BOTTOM FLOATING FOLDER SWITCHER BAR ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto select-none">
        <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-[#111114]/90 text-white backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          {/* Rotunda Overview Button */}
          <button
            onClick={() => setActiveFolder(null)}
            className={clsx(
              "relative px-3.5 py-1.5 rounded-full text-[10px] font-mono tracking-widest uppercase font-medium transition-all flex items-center gap-1.5 cursor-pointer",
              activeFolder === null ? "text-black" : "text-white/70 hover:text-white"
            )}
          >
            {activeFolder === null && (
              <motion.div
                layoutId="activeFolderPill"
                className="absolute inset-0 bg-amber-400 rounded-full shadow-md"
                transition={{ type: "spring", stiffness: 450, damping: 32 }}
              />
            )}
            <Compass className="relative z-10 w-3.5 h-3.5" />
            <span className="relative z-10 hidden sm:inline">Overview</span>
          </button>

          <div className="w-[1px] h-4 bg-white/15 mx-0.5" />

          {/* 4 Category Folder Tabs */}
          {HALLWAYS.map((h) => {
            const isTabActive = activeFolder === h.category;
            const count = categoryCounts[h.category] || 0;

            return (
              <button
                key={h.category}
                onClick={() => {
                  if (isTabActive) {
                    handleEnterFolder(h);
                  } else {
                    setActiveFolder(h.category);
                  }
                }}
                className={clsx(
                  "relative px-3.5 py-1.5 rounded-full text-[10px] font-mono tracking-wider uppercase font-medium transition-all flex items-center gap-1.5 cursor-pointer shrink-0",
                  isTabActive ? "text-black" : "text-white/70 hover:text-white"
                )}
              >
                {isTabActive && (
                  <motion.div
                    layoutId="activeFolderPill"
                    className="absolute inset-0 bg-white rounded-full shadow-md"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-10 font-semibold">{h.title}</span>
                <span
                  className={clsx(
                    "relative z-10 text-[8.5px] px-1.5 py-0.2 rounded-full font-mono font-bold transition-colors",
                    isTabActive ? "bg-black text-white" : "bg-white/15 text-white/70"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3D CANVAS VIEWPORT ── */}
      <Canvas
        camera={{ position: [0, 1.45, 4.4], fov: 44 }}
        style={{ background: "#f7f6f2", pointerEvents: "auto" }}
        gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping }}
        dpr={[1, 2]}
        shadows
      >
        <Suspense fallback={null}>
          <LobbyRotundaContent
            allProjects={allProjects}
            selectedCategory={selectedCategory}
            activeFolder={activeFolder}
            onFolderChange={setActiveFolder}
            onEnterFolder={handleEnterFolder}
            isTransitioning={isTransitioning}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
