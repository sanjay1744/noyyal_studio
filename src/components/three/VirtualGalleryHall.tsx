"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Maximize2, 
  ArrowLeft, 
  Box,
  RotateCcw,
  Compass,
  Clock
} from "lucide-react";
import { Project, ProjectCategory } from "@/config/sanity";
import { createFrameTexture, createComingSoonTexture } from "./FrameTextureCanvas";

const MODEL_PATH = "/models/nft_3d_art_gallery_-_luciano_robur.glb";

// 12 Picture Material Names in the GLB model
const PICTURE_MATERIALS = [
  "Picture01", "Picture02", "Picture03", "Picture04",
  "Picture05", "Picture06", "Picture07", "Picture08",
  "Picture09", "Picture10", "Picture11", "Picture12"
];

interface FrameData {
  name: string;
  matName: string;
  mesh: THREE.Mesh;
  worldPos: THREE.Vector3;
  surfaceNormal: THREE.Vector3;
  project: Project | null;
}

// ── 3D SCENE CONTENT COMPONENT ──
function GallerySceneContent({
  categoryProjects,
  selectedCategory,
  focusedFrameIdx,
  setFocusedFrameIdx,
  frameImageIndices,
  setFrameImageIndices,
}: {
  categoryProjects: Project[];
  selectedCategory: ProjectCategory;
  focusedFrameIdx: number | null;
  setFocusedFrameIdx: (idx: number | null) => void;
  frameImageIndices: Record<number, number>;
  setFrameImageIndices: React.Dispatch<React.SetStateAction<Record<number, number>>>;
}) {
  const { scene } = useGLTF(MODEL_PATH);
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Frames state and materials reference map
  const [framesData, setFramesData] = useState<FrameData[]>([]);
  const materialsMapRef = useRef<Map<string, THREE.MeshStandardMaterial>>(new Map());

  // Model scale fit
  const targetScale = useMemo(() => {
    if (!scene) return 1;
    scene.scale.set(1, 1, 1);
    scene.position.set(0, 0, 0);
    scene.rotation.set(0, 0, 0);

    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    return maxDim > 0 ? 16 / maxDim : 1;
  }, [scene]);

  // Clone materials & gather frame meshes metadata (No Project Repetition!)
  useEffect(() => {
    if (!scene) return;

    const extractedFrames: FrameData[] = [];
    const matMap = new Map<string, THREE.MeshStandardMaterial>();

    // Traversal to find picture meshes
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.Material;
        
        if (mat && PICTURE_MATERIALS.includes(mat.name)) {
          // Clone material so each frame is completely independent
          const clonedMat = (mat as THREE.MeshStandardMaterial).clone();
          clonedMat.roughness = 0.15;
          clonedMat.metalness = 0.05;
          clonedMat.color = new THREE.Color("#ffffff");
          mesh.material = clonedMat;
          matMap.set(mat.name, clonedMat);

          const frameIdx = PICTURE_MATERIALS.indexOf(mat.name);
          // Assign project ONLY if within project count (Do not repeat!)
          const assignedProject = frameIdx < categoryProjects.length ? categoryProjects[frameIdx] : null;

          // Compute world position
          mesh.updateMatrixWorld(true);
          const worldPos = new THREE.Vector3();
          mesh.getWorldPosition(worldPos);

          // Normal vector facing inward toward room center (0, 0, 0)
          const surfaceNormal = new THREE.Vector3(0, 0, 0).sub(worldPos);
          surfaceNormal.y = 0;
          surfaceNormal.normalize();

          extractedFrames[frameIdx] = {
            name: mesh.name,
            matName: mat.name,
            mesh,
            worldPos,
            surfaceNormal,
            project: assignedProject
          };
        }
      }
    });

    materialsMapRef.current = matMap;
    setFramesData(extractedFrames.filter(Boolean));
  }, [scene, categoryProjects]);

  // Update frame textures: Projects for available slots, "COMING SOON" for empty slots
  useEffect(() => {
    if (framesData.length === 0) return;

    framesData.forEach((frame, idx) => {
      const mat = materialsMapRef.current.get(frame.matName);
      if (!mat) return;

      const isFocused = focusedFrameIdx === idx;

      if (idx < categoryProjects.length) {
        const project = categoryProjects[idx];
        const currentImgIdx = frameImageIndices[idx] || 0;
        
        const newTexture = createFrameTexture(project, currentImgIdx, () => {
          mat.needsUpdate = true;
        }, isFocused);

        if (mat.map) mat.map.dispose();
        mat.map = newTexture;
      } else {
        // Extra frame slots marked as COMING SOON
        const comingSoonTexture = createComingSoonTexture(selectedCategory, isFocused);
        if (mat.map) mat.map.dispose();
        mat.map = comingSoonTexture;
      }

      mat.needsUpdate = true;
    });
  }, [framesData, categoryProjects, frameImageIndices, focusedFrameIdx, selectedCategory]);

  // Compute dynamic room center from frame positions
  const roomCenter = useMemo(() => {
    if (framesData.length === 0) return new THREE.Vector3(0, 0, 0);
    const sum = new THREE.Vector3(0, 0, 0);
    framesData.forEach((f) => sum.add(f.worldPos));
    return sum.divideScalar(framesData.length);
  }, [framesData]);

  // Smooth Camera GSAP Animation Engine
  useEffect(() => {
    if (!controlsRef.current) return;

    if (focusedFrameIdx !== null && framesData[focusedFrameIdx]) {
      const frame = framesData[focusedFrameIdx];
      
      // Compute inward normal facing room center
      const normal = roomCenter.clone().sub(frame.worldPos);
      normal.y = 0;
      normal.normalize();

      // Stand 2.2 meters in front of frame inside room at eye level
      const standDistance = 2.2;
      const targetCamPos = frame.worldPos.clone().add(normal.multiplyScalar(standDistance));
      targetCamPos.y = frame.worldPos.y; // Eye level with frame center

      // Animate camera position and target
      gsap.to(camera.position, {
        x: targetCamPos.x,
        y: targetCamPos.y,
        z: targetCamPos.z,
        duration: 1.6,
        ease: "power3.inOut"
      });

      gsap.to(controlsRef.current.target, {
        x: frame.worldPos.x,
        y: frame.worldPos.y,
        z: frame.worldPos.z,
        duration: 1.6,
        ease: "power3.inOut"
      });
    } else {
      // Overview Mode: INSIDE the gallery hall facing picture frames
      const overviewCamPos = new THREE.Vector3(roomCenter.x, roomCenter.y + 0.1, roomCenter.z + 1.2);
      const overviewTarget = new THREE.Vector3(roomCenter.x, roomCenter.y + 0.1, roomCenter.z - 0.6);

      gsap.to(camera.position, {
        x: overviewCamPos.x,
        y: overviewCamPos.y,
        z: overviewCamPos.z,
        duration: 1.5,
        ease: "power2.out"
      });

      gsap.to(controlsRef.current.target, {
        x: overviewTarget.x,
        y: overviewTarget.y,
        z: overviewTarget.z,
        duration: 1.5,
        ease: "power2.out"
      });
    }
  }, [focusedFrameIdx, framesData, roomCenter, camera]);

  // Category switch entrance sweep inside hall
  useEffect(() => {
    if (!controlsRef.current) return;
    if (focusedFrameIdx !== null) return;

    gsap.fromTo(
      camera.position,
      { x: roomCenter.x - 1.2, y: roomCenter.y + 0.2, z: roomCenter.z + 0.8 },
      { x: roomCenter.x, y: roomCenter.y + 0.1, z: roomCenter.z + 1.2, duration: 1.8, ease: "power2.out" }
    );
  }, [selectedCategory, roomCenter]);

  // Slow subtle rotation when in hall overview mode
  useFrame((_, delta) => {
    if (controlsRef.current && focusedFrameIdx === null) {
      controlsRef.current.azimuthAngle += delta * 0.025;
      controlsRef.current.update();
    }
  });

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        maxPolarAngle={Math.PI / 2 + 0.05}
        minDistance={0.5}
        maxDistance={4.0}
      />

      <group ref={groupRef} scale={targetScale}>
        <primitive object={scene} />

        {/* Ambient Warm Interior Gallery Point Light */}
        <pointLight position={[roomCenter.x, roomCenter.y + 1.8, roomCenter.z]} intensity={3.8} color="#fffaf0" />

        {/* Clickable Hitbox Planes over picture frames */}
        {framesData.map((frame, idx) => {
          return (
            <group key={frame.matName} position={frame.worldPos}>
              {/* Invisible Click Receiver Plane over frame surface */}
              <mesh
                onClick={(e) => {
                  e.stopPropagation();
                  setFocusedFrameIdx(idx);
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  document.body.style.cursor = "pointer";
                }}
                onPointerOut={() => {
                  document.body.style.cursor = "auto";
                }}
              >
                <planeGeometry args={[1.8, 1.8]} />
                <meshBasicMaterial visible={false} />
              </mesh>
            </group>
          );
        })}
      </group>
    </>
  );
}

// ── MAIN VIRTUAL GALLERY HALL WRAPPER ──
export default function VirtualGalleryHall({
  allProjects,
  selectedCategory,
  onSelectCategory,
  onBackToGrid,
  onOpenProjectDrawer
}: {
  allProjects: Project[];
  selectedCategory: ProjectCategory;
  onSelectCategory: (cat: ProjectCategory) => void;
  onBackToGrid?: () => void;
  onOpenProjectDrawer?: (project: Project) => void;
}) {
  const [focusedFrameIdx, setFocusedFrameIdx] = useState<number | null>(null);
  const [frameImageIndices, setFrameImageIndices] = useState<Record<number, number>>({});

  // Filter projects exclusively for the chosen category
  const categoryProjects = useMemo(() => {
    return allProjects.filter((p) => p.category === selectedCategory);
  }, [allProjects, selectedCategory]);

  // Is focused frame an active project or a "Coming Soon" frame?
  const isComingSoonFocused = focusedFrameIdx !== null && focusedFrameIdx >= categoryProjects.length;

  // Active focused project metadata
  const activeProject = useMemo(() => {
    if (focusedFrameIdx === null || isComingSoonFocused || categoryProjects.length === 0) return null;
    return categoryProjects[focusedFrameIdx];
  }, [focusedFrameIdx, isComingSoonFocused, categoryProjects]);

  // Gallery image list for active project
  const activeGalleryImages = useMemo(() => {
    if (!activeProject) return [];
    return activeProject.gallery && activeProject.gallery.length > 0
      ? activeProject.gallery
      : [activeProject.heroImage];
  }, [activeProject]);

  const activeImageIdx = focusedFrameIdx !== null ? (frameImageIndices[focusedFrameIdx] || 0) : 0;

  // Handle Keyboard Navigation (Left / Right arrows for frame images, Escape to reset view)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (focusedFrameIdx === null) return;

      if (e.key === "ArrowLeft" && activeProject) {
        setFrameImageIndices((prev) => {
          const cur = prev[focusedFrameIdx] || 0;
          const nextVal = (cur - 1 + activeGalleryImages.length) % activeGalleryImages.length;
          return { ...prev, [focusedFrameIdx]: nextVal };
        });
      } else if (e.key === "ArrowRight" && activeProject) {
        setFrameImageIndices((prev) => {
          const cur = prev[focusedFrameIdx] || 0;
          const nextVal = (cur + 1) % activeGalleryImages.length;
          return { ...prev, [focusedFrameIdx]: nextVal };
        });
      } else if (e.key === "Escape") {
        setFocusedFrameIdx(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedFrameIdx, activeProject, activeGalleryImages]);

  // Reset frame focus when changing category
  const handleCategoryChange = (cat: ProjectCategory) => {
    setFocusedFrameIdx(null);
    onSelectCategory(cat);
  };

  const categoriesList: ProjectCategory[] = ["Residences", "Commercial", "Interior", "Unbuilt"];

  return (
    <div className="relative w-full h-[calc(100vh-64px)] min-h-[650px] bg-neutral-950 text-white overflow-hidden select-none">
      {/* ── TOP NAVIGATION HUD ── */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl">
        {/* Left: Hall Title & Back Button */}
        <div className="flex items-center gap-4">
          {onBackToGrid && (
            <button
              onClick={onBackToGrid}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white hover:text-black text-xs font-medium transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Grid</span>
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <Box className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-gray-400 block">
                3D EXHIBITION HALL
              </span>
              <h2 className="text-sm font-semibold tracking-wide uppercase">
                {selectedCategory} Gallery ({categoryProjects.length} Projects)
              </h2>
            </div>
          </div>
        </div>

        {/* Center: Category Selector Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 overflow-x-auto">
          {categoriesList.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = allProjects.filter((p) => p.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-mono tracking-wider transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "bg-white text-black font-bold shadow-lg scale-105"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {cat.toUpperCase()} ({count})
              </button>
            );
          })}
        </div>

        {/* Right: Hall View Reset Button */}
        <div className="flex items-center gap-2">
          {focusedFrameIdx !== null && (
            <button
              onClick={() => setFocusedFrameIdx(null)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black border border-amber-500/40 text-xs font-mono transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Hall View</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 3D CANVAS VIEWPORT ── */}
      <Canvas
        camera={{ position: [0, 1.6, 2.5], fov: 50 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 15, 10]} intensity={2.0} />
        <directionalLight position={[-10, 10, -10]} intensity={1.0} />

        <GallerySceneContent
          categoryProjects={categoryProjects}
          selectedCategory={selectedCategory}
          focusedFrameIdx={focusedFrameIdx}
          setFocusedFrameIdx={setFocusedFrameIdx}
          frameImageIndices={frameImageIndices}
          setFrameImageIndices={setFrameImageIndices}
        />
      </Canvas>

      {/* ── BOTTOM HUD: FOCUSED PROJECT SINGLE-FRAME SLIDER & DETAILS ── */}
      <AnimatePresence>
        {activeProject && focusedFrameIdx !== null && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.35 }}
            className="absolute bottom-4 left-4 right-4 z-20 p-5 rounded-2xl bg-black/85 backdrop-blur-2xl border border-white/15 shadow-2xl max-w-4xl mx-auto"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              {/* Left Info Column */}
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] tracking-widest border border-amber-500/30">
                    {activeProject.num || `NS-${focusedFrameIdx + 1}`}
                  </span>
                  <span className="text-xs font-mono text-gray-400">
                    {activeProject.location} · {activeProject.year}
                  </span>
                  <span className="text-xs font-mono text-gray-400">
                    {activeProject.area}
                  </span>
                </div>

                <h3 className="text-lg font-bold tracking-tight text-white">
                  {activeProject.name}
                </h3>

                <p className="text-xs text-gray-300 line-clamp-2 max-w-2xl leading-relaxed">
                  {activeProject.desc}
                </p>
              </div>

              {/* Right Column: Single Frame Gallery Slider Controls */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-white/10">
                {/* Image Navigation Buttons (< >) & Counter */}
                <div className="flex items-center gap-2 bg-white/10 border border-white/15 p-1.5 rounded-xl">
                  <button
                    onClick={() => {
                      setFrameImageIndices((prev) => {
                        const cur = prev[focusedFrameIdx] || 0;
                        const nextVal = (cur - 1 + activeGalleryImages.length) % activeGalleryImages.length;
                        return { ...prev, [focusedFrameIdx]: nextVal };
                      });
                    }}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white hover:text-black transition-all active:scale-90 text-white cursor-pointer"
                    title="Previous Image (Left Arrow)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="px-3 text-xs font-mono font-bold text-amber-300 min-w-[85px] text-center">
                    IMG {activeImageIdx + 1} / {activeGalleryImages.length}
                  </span>

                  <button
                    onClick={() => {
                      setFrameImageIndices((prev) => {
                        const cur = prev[focusedFrameIdx] || 0;
                        const nextVal = (cur + 1) % activeGalleryImages.length;
                        return { ...prev, [focusedFrameIdx]: nextVal };
                      });
                    }}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white hover:text-black transition-all active:scale-90 text-white cursor-pointer"
                    title="Next Image (Right Arrow)"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* View Details Button */}
                {onOpenProjectDrawer && (
                  <button
                    onClick={() => onOpenProjectDrawer(activeProject)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-gray-200 transition-all shadow-lg active:scale-95 w-full sm:w-auto cursor-pointer"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>View Project Specs</span>
                  </button>
                )}

                {/* Close Focus Button */}
                <button
                  onClick={() => setFocusedFrameIdx(null)}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all cursor-pointer"
                  title="Close Focus View (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* HUD for COMING SOON Frames */}
        {isComingSoonFocused && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.35 }}
            className="absolute bottom-4 left-4 right-4 z-20 p-5 rounded-2xl bg-black/85 backdrop-blur-2xl border border-amber-500/30 shadow-2xl max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] tracking-widest border border-amber-500/40 uppercase">
                    NS — UPCOMING FRAME #{focusedFrameIdx + 1}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  Upcoming {selectedCategory} Project
                </h3>
                <p className="text-xs text-gray-400">
                  This exhibition frame is reserved for a future Noyyal Studio {selectedCategory.toLowerCase()} project currently under design & research.
                </p>
              </div>

              <button
                onClick={() => setFocusedFrameIdx(null)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white hover:text-black text-white text-xs font-mono transition-all cursor-pointer shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Hall View</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FLOATING HELPER BADGE ── */}
      {focusedFrameIdx === null && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-xs text-gray-300 font-mono tracking-wider animate-bounce">
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Click any 3D picture frame to view project artwork</span>
          </div>
        </div>
      )}
    </div>
  );
}

useGLTF.preload(MODEL_PATH);
