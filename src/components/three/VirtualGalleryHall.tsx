"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Html, Text } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ArrowLeft, 
  Box,
  RotateCcw,
  Compass,
  Clock,
  ExternalLink
} from "lucide-react";
import { Project, ProjectCategory } from "@/config/sanity";
import { createFrameTexture, createComingSoonTexture, getOrLoadImage } from "./FrameTextureCanvas";

const MODEL_PATH = "/models/nft_3d_art_gallery_-_luciano_robur.glb";

// 12 Picture Material Names ordered starting with Front Wall (Left, Center, Right in 90° view), then Side Walls
const VISIBLE_FRAME_MATERIALS_ORDER = [
  "Picture04", // 0: Front Wall Left Frame
  "Picture05", // 1: Front Wall Center Frame
  "Picture06", // 2: Front Wall Right Frame
  "Picture07", // 3: Left Wall Frame
  "Picture03", // 4: Right Wall Frame
  "Picture08", // 5: Secondary Left Wall
  "Picture09", // 6: Secondary Left Wall
  "Picture02", // 7: Secondary Right Wall
  "Picture01", // 8: Secondary Right Wall
  "Picture11", // 9: Rear Wall Center
  "Picture10", // 10: Rear Wall Left
  "Picture12"  // 11: Rear Wall Right
];

interface FrameData {
  name: string;
  matName: string;
  mesh: THREE.Mesh;
  worldPos: THREE.Vector3;
  bottomCenterPos: THREE.Vector3;
  surfaceNormal: THREE.Vector3;
  quadGeom: THREE.BufferGeometry | null;
  project: Project | null;
}

function assignProjectsToFrames(sortedFrames: FrameData[], categoryProjects: Project[]): FrameData[] {
  return sortedFrames.map((frame, idx) => ({
    ...frame,
    project: categoryProjects[idx] || null,
  }));
}

// ── 3D SCENE CONTENT COMPONENT ──
function GallerySceneContent({
  categoryProjects,
  selectedCategory,
  focusedFrameIdx,
  onFrameClick,
  onCameraArrived,
  frameImageIndices,
}: {
  categoryProjects: Project[];
  selectedCategory: ProjectCategory;
  focusedFrameIdx: number | null;
  onFrameClick: (idx: number) => void;
  onCameraArrived: (idx: number) => void;
  frameImageIndices: Record<number, number>;
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

  // Preload all project images for immediate rendering
  useEffect(() => {
    categoryProjects.forEach((proj) => {
      if (proj.heroImage) getOrLoadImage(proj.heroImage, () => {});
      if (proj.gallery) {
        proj.gallery.forEach((imgUrl) => getOrLoadImage(imgUrl, () => {}));
      }
    });
  }, [categoryProjects]);

  // Gather frame meshes metadata and configure materials
  useEffect(() => {
    if (!scene) return;
    scene.updateMatrixWorld(true);

    const extractedMap = new Map<string, FrameData>();
    const matMap = new Map<string, THREE.MeshStandardMaterial>();

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const rawMat = mesh.material;
        const materialsList: THREE.Material[] = Array.isArray(rawMat) ? rawMat : rawMat ? [rawMat] : [];

        materialsList.forEach((mat) => {
          if (mat && VISIBLE_FRAME_MATERIALS_ORDER.includes(mat.name)) {
            const clonedMat = new THREE.MeshStandardMaterial({
              color: new THREE.Color("#ffffff"),
              roughness: 0.2,
              metalness: 0.0,
              emissive: new THREE.Color("#000000"),
              emissiveIntensity: 0.0,
              emissiveMap: null,
              map: null,
              lightMap: null,
              aoMap: null,
              roughnessMap: null,
              metalnessMap: null,
              normalMap: null,
              alphaMap: null,
              transparent: false,
              opacity: 1.0,
            });
            clonedMat.name = mat.name;

            if (Array.isArray(mesh.material)) {
              const idx = mesh.material.indexOf(mat);
              if (idx !== -1) mesh.material[idx] = clonedMat;
            } else {
              mesh.material = clonedMat;
            }

            matMap.set(mat.name, clonedMat);

            // Extract exact frame quad geometry and compute exact center & normal
            let quadGeom: THREE.BufferGeometry | null = null;
            let worldPos = new THREE.Vector3();
            let bottomCenterPos = new THREE.Vector3();
            let surfaceNormal = new THREE.Vector3(0, 0, 1);

            const geom = mesh.geometry as THREE.BufferGeometry;
            if (geom && geom.attributes.position && geom.attributes.uv) {
              const posAttr = geom.attributes.position;
              const uvAttr = geom.attributes.uv;
              const matIndex = materialsList.indexOf(mat);
              const group = geom.groups.find((g) => g.materialIndex === matIndex);
              const index = geom.index;
              const start = group ? group.start : 0;
              const count = group ? group.count : posAttr.count;

              if (count >= 4) {
                const box = new THREE.Box3();
                const posArray = new Float32Array(count * 3);
                const verts: THREE.Vector3[] = [];
                for (let i = 0; i < count; i++) {
                  const vIdx = index ? index.getX(start + i) : (start + i);
                  const v = new THREE.Vector3(posAttr.getX(vIdx), posAttr.getY(vIdx), posAttr.getZ(vIdx));
                  v.applyMatrix4(mesh.matrixWorld);
                  posArray[i * 3] = v.x;
                  posArray[i * 3 + 1] = v.y;
                  posArray[i * 3 + 2] = v.z;
                  verts.push(v);
                  box.expandByPoint(v);
                }
                quadGeom = new THREE.BufferGeometry();
                quadGeom.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
                if (count === 4) {
                  quadGeom.setIndex([0, 1, 2, 0, 2, 3]);
                }
                quadGeom.computeVertexNormals();

                // Exact geometric bounding-box center of the frame in scene space
                worldPos = new THREE.Vector3();
                box.getCenter(worldPos);

                // Extract exact corner vertices using UV coordinates (u: 0->1, v: 0->1)
                let pBL: THREE.Vector3 | null = null;
                let pBR: THREE.Vector3 | null = null;
                let pTL: THREE.Vector3 | null = null;
                let pTR: THREE.Vector3 | null = null;

                for (let i = 0; i < posAttr.count; i++) {
                  const v = new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
                  v.applyMatrix4(mesh.matrixWorld);
                  const u = uvAttr.getX(i);
                  const vCoord = uvAttr.getY(i);

                  if (u < 0.5 && vCoord < 0.5 && !pBL) pBL = v;
                  else if (u >= 0.5 && vCoord < 0.5 && !pBR) pBR = v;
                  else if (u < 0.5 && vCoord >= 0.5 && !pTL) pTL = v;
                  else if (u >= 0.5 && vCoord >= 0.5 && !pTR) pTR = v;
                }

                if (pBL && pBR && pTL && pTR) {
                  // Exact bottom-center point at u = 0.5, v = 0.09 (horizontal center of bottom plaque)
                  const u = 0.5, v = 0.09;
                  bottomCenterPos = new THREE.Vector3()
                    .addScaledVector(pBL, (1 - u) * (1 - v))
                    .addScaledVector(pBR, u * (1 - v))
                    .addScaledVector(pTL, (1 - u) * v)
                    .addScaledVector(pTR, u * v);

                  // Surface normal from quad axes
                  const uAxis = pBR.clone().sub(pBL).normalize();
                  const vAxis = pTL.clone().sub(pBL).normalize();
                  surfaceNormal = new THREE.Vector3().crossVectors(uAxis, vAxis).normalize();
                } else {
                  bottomCenterPos = new THREE.Vector3(worldPos.x, box.min.y + 0.10, worldPos.z);
                  const e1 = verts[1].clone().sub(verts[0]);
                  const e2 = verts[2].clone().sub(verts[0]);
                  surfaceNormal = new THREE.Vector3().crossVectors(e1, e2).normalize();
                }

                const toCenter = new THREE.Vector3(0, worldPos.y, 0).sub(worldPos);
                if (surfaceNormal.dot(toCenter) < 0) {
                  surfaceNormal.negate();
                }
              }
            }

            extractedMap.set(mat.name, {
              name: mesh.name,
              matName: mat.name,
              mesh,
              worldPos,
              bottomCenterPos,
              surfaceNormal,
              quadGeom,
              project: null,
            });
          }
        });
      }
    });

    materialsMapRef.current = matMap;

    const orderedFrames: FrameData[] = VISIBLE_FRAME_MATERIALS_ORDER
      .map((matName) => extractedMap.get(matName))
      .filter(Boolean) as FrameData[];

    if (orderedFrames.length === 0) return;

    const sortedFrames = assignProjectsToFrames(orderedFrames, categoryProjects);
    setFramesData(sortedFrames);
  }, [scene, categoryProjects]);

  // Update frame textures: Projects for available slots, "COMING SOON" for empty slots
  useEffect(() => {
    if (framesData.length === 0) return;

    framesData.forEach((frame, idx) => {
      const mat = materialsMapRef.current.get(frame.matName);
      if (!mat) return;

      const isFocused = focusedFrameIdx === idx;

      if (frame.project) {
        const currentImgIdx = frameImageIndices[idx] || 0;
        
        const newTexture = createFrameTexture(frame.project, currentImgIdx, () => {
          mat.needsUpdate = true;
        }, isFocused);

        if (mat.map) mat.map.dispose();
        mat.map = newTexture;
      } else {
        const comingSoonTexture = createComingSoonTexture(selectedCategory, isFocused);
        if (mat.map) mat.map.dispose();
        mat.map = comingSoonTexture;
      }

      mat.needsUpdate = true;
    });
  }, [framesData, frameImageIndices, focusedFrameIdx, selectedCategory]);

  // Compute dynamic room center from frame positions
  const roomCenter = useMemo(() => {
    if (framesData.length === 0) return new THREE.Vector3(0, 0, 0);
    const sum = new THREE.Vector3(0, 0, 0);
    framesData.forEach((f) => sum.add(f.worldPos.clone().multiplyScalar(targetScale)));
    return sum.divideScalar(framesData.length);
  }, [framesData, targetScale]);

  // Active per-frame boundary lock: strictly keep camera & target inside the exhibition hall
  useFrame(() => {
    // Safe interior bounding limits of the 3D Gallery hall
    // (Inner walls are at ±6.16 in X and Z, floor at -1.55, ceiling at +3.27)
    const SAFE_MIN_X = -4.2;
    const SAFE_MAX_X = 4.2;
    const SAFE_MIN_Y = -0.2;
    const SAFE_MAX_Y = 2.2;
    const SAFE_MIN_Z = -4.2;
    const SAFE_MAX_Z = 4.2;

    camera.position.x = THREE.MathUtils.clamp(camera.position.x, SAFE_MIN_X, SAFE_MAX_X);
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, SAFE_MIN_Y, SAFE_MAX_Y);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, SAFE_MIN_Z, SAFE_MAX_Z);

    if (controlsRef.current) {
      // Keep orbit target securely inside room interior
      controlsRef.current.target.x = THREE.MathUtils.clamp(controlsRef.current.target.x, -3.5, 3.5);
      controlsRef.current.target.y = THREE.MathUtils.clamp(controlsRef.current.target.y, -0.2, 1.5);
      controlsRef.current.target.z = THREE.MathUtils.clamp(controlsRef.current.target.z, -3.5, 3.5);
    }
  });

  // Camera Zoom Animation: Fly close in front of clicked frame, or return to overview
  useEffect(() => {
    if (!controlsRef.current) return;

    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(controlsRef.current.target);

    const overviewCamPos = new THREE.Vector3(roomCenter.x + 2.0, roomCenter.y - 0.2, roomCenter.z);
    const overviewTarget = new THREE.Vector3(roomCenter.x - 1.0, roomCenter.y - 0.2, roomCenter.z);

    if (focusedFrameIdx !== null && framesData[focusedFrameIdx]) {
      const frame = framesData[focusedFrameIdx];
      const framePos = frame.worldPos.clone().multiplyScalar(targetScale);

      // Gentle, natural camera glide from overview towards the frame (stays 100% inside room interior)
      const targetCamPos = overviewCamPos.clone().lerp(framePos, 0.28);
      targetCamPos.x = THREE.MathUtils.clamp(targetCamPos.x, -4.0, 4.0);
      targetCamPos.y = THREE.MathUtils.clamp(THREE.MathUtils.lerp(overviewCamPos.y, framePos.y, 0.5), 0.2, 1.8);
      targetCamPos.z = THREE.MathUtils.clamp(targetCamPos.z, -4.0, 4.0);

      gsap.to(camera.position, {
        x: targetCamPos.x,
        y: targetCamPos.y,
        z: targetCamPos.z,
        duration: 0.8,
        ease: "power2.inOut",
        onUpdate: () => {
          if (controlsRef.current) controlsRef.current.update();
        },
        onComplete: () => {
          onCameraArrived(focusedFrameIdx);
        }
      });

      gsap.to(controlsRef.current.target, {
        x: THREE.MathUtils.clamp(framePos.x, -3.8, 3.8),
        y: THREE.MathUtils.clamp(framePos.y, 0.0, 1.6),
        z: THREE.MathUtils.clamp(framePos.z, -3.8, 3.8),
        duration: 0.8,
        ease: "power2.inOut",
        onUpdate: () => {
          if (controlsRef.current) controlsRef.current.update();
        }
      });
    } else {
      // Return smoothly to hall overview
      gsap.to(camera.position, {
        x: overviewCamPos.x,
        y: overviewCamPos.y,
        z: overviewCamPos.z,
        duration: 0.9,
        ease: "power2.out",
        onUpdate: () => {
          if (controlsRef.current) controlsRef.current.update();
        }
      });

      gsap.to(controlsRef.current.target, {
        x: overviewTarget.x,
        y: overviewTarget.y,
        z: overviewTarget.z,
        duration: 0.9,
        ease: "power2.out",
        onUpdate: () => {
          if (controlsRef.current) controlsRef.current.update();
        }
      });
    }
  }, [focusedFrameIdx, framesData, roomCenter, targetScale, camera, onCameraArrived]);

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        target={[-1.0, 0.35, 0]}
        enableDamping
        dampingFactor={0.06}
        enablePan={false}
        enableZoom={true}
        zoomSpeed={0.5}
        minPolarAngle={Math.PI * 0.22}
        maxPolarAngle={Math.PI * 0.51}
        minDistance={0.5}
        maxDistance={3.2}
      />

      <group ref={groupRef} scale={targetScale}>
        <primitive object={scene} />

        {/* Ambient Warm Interior Gallery Point Light */}
        <pointLight position={[roomCenter.x, roomCenter.y + 1.8, roomCenter.z]} intensity={3.8} color="#fffaf0" />

        {/* ── ARCHITECTURAL WALL TYPOGRAPHY (PRIMARY VIEW FRONT WALL) ── */}
        <group position={[-3.94, 1.44, 0]} rotation={[0, Math.PI / 2, 0]}>
          {/* Studio Monograph Label */}
          <Text
            position={[0, 0.18, 0]}
            fontSize={0.062}
            letterSpacing={0.26}
            color="#94a3b8"
            anchorX="center"
            anchorY="middle"
          >
            NOYYAL ARCHITECTURAL STUDIO
          </Text>

          {/* Main Category Project Type Title */}
          <Text
            position={[0, 0.04, 0]}
            fontSize={0.19}
            letterSpacing={0.16}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {selectedCategory.toUpperCase()}
          </Text>

          {/* Thin Architectural Divider Line */}
          <mesh position={[0, -0.065, 0]}>
            <planeGeometry args={[1.5, 0.003]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
          </mesh>

          {/* Exhibition Subtitle & Project Count */}
          <Text
            position={[0, -0.12, 0]}
            fontSize={0.052}
            letterSpacing={0.22}
            color="#cbd5e1"
            anchorX="center"
            anchorY="middle"
          >
            {`EXHIBITION HALL · ${categoryProjects.length} CURATED PROJECTS`}
          </Text>
        </group>

        {/* Pixel-Perfect Clickable Hitboxes directly using each frame's exact surface quad geometry */}
        {framesData.map((frame, idx) => {
          if (!frame.quadGeom) return null;
          return (
            <mesh
              key={frame.matName}
              geometry={frame.quadGeom}
              onClick={(e) => {
                e.stopPropagation();
                onFrameClick(idx);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                if (typeof window !== "undefined") {
                  window.dispatchEvent(
                    new CustomEvent("custom-cursor-hover", {
                      detail: { hovering: true }
                    })
                  );
                }
              }}
              onPointerOut={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(
                    new CustomEvent("custom-cursor-hover", {
                      detail: { hovering: false }
                    })
                  );
                }
              }}
            >
              <meshBasicMaterial visible={false} side={THREE.DoubleSide} />
            </mesh>
          );
        })}

        {/* 3D Shining Silver Interactive Hotspot Dot on Image Bottom-Center */}
        {focusedFrameIdx === null && framesData.map((frame, idx) => {
          if (!frame.project) return null;
          return (
            <group
              key={`hotspot-${frame.matName}`}
              position={[
                frame.bottomCenterPos.x + frame.surfaceNormal.x * 0.015,
                frame.bottomCenterPos.y,
                frame.bottomCenterPos.z + frame.surfaceNormal.z * 0.015
              ]}
            >
              <Html center distanceFactor={11} zIndexRange={[20, 0]}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFrameClick(idx);
                  }}
                  onPointerOver={(e) => {
                    e.stopPropagation();
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(
                        new CustomEvent("custom-cursor-hover", {
                          detail: { hovering: true }
                        })
                      );
                    }
                  }}
                  onPointerOut={() => {
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(
                        new CustomEvent("custom-cursor-hover", {
                          detail: { hovering: false }
                        })
                      );
                    }
                  }}
                  className="relative flex items-center justify-center group cursor-pointer focus:outline-none select-none transition-transform duration-200 hover:scale-135 active:scale-90"
                  aria-label={`View ${frame.project.name}`}
                >
                  {/* Outer Pulsing Silver Ripple Wave */}
                  <span className="absolute w-7 h-7 rounded-full border border-slate-200/90 animate-ping opacity-80 pointer-events-none" />

                  {/* Soft Silver Aura Glow */}
                  <span className="absolute w-8 h-8 rounded-full bg-slate-300/30 blur-[4px] animate-pulse pointer-events-none" />

                  {/* Shining Metallic Silver Dot */}
                  <div className="relative w-4 h-4 rounded-full bg-gradient-to-tr from-slate-400 via-white to-slate-200 border border-white shadow-[0_0_12px_rgba(255,255,255,1),0_0_22px_rgba(210,230,255,0.85)] group-hover:shadow-[0_0_18px_rgba(255,255,255,1),0_0_28px_rgba(230,240,255,1)] transition-all">
                    {/* Metallic Specular Highlight Glint */}
                    <span className="absolute top-[2.5px] left-[2.5px] w-1.5 h-1.5 rounded-full bg-white opacity-95 pointer-events-none" />
                  </div>
                </button>
              </Html>
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
  onOpenProjectDrawer,
  hideTopHud = false,
}: {
  allProjects: Project[];
  selectedCategory: ProjectCategory;
  onSelectCategory: (cat: ProjectCategory) => void;
  onBackToGrid?: () => void;
  onOpenProjectDrawer?: (project: Project) => void;
  hideTopHud?: boolean;
}) {
  const [focusedFrameIdx, setFocusedFrameIdx] = useState<number | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [frameImageIndices, setFrameImageIndices] = useState<Record<number, number>>({});

  // Filter projects exclusively for the chosen category
  const categoryProjects = useMemo(() => {
    return allProjects.filter((p) => p.category === selectedCategory);
  }, [allProjects, selectedCategory]);

  // Handle frame click: start camera zoom, ensure popup stays closed until arrival
  const handleFrameClick = useCallback((idx: number) => {
    setIsPopupOpen(false);
    setFocusedFrameIdx(idx);
  }, []);

  // Handle camera arrival: smoothly open popup once camera reaches the frame
  const handleCameraArrived = useCallback((_idx: number) => {
    setIsPopupOpen(true);
  }, []);

  // Handle closing popup and returning camera to overview
  const handleClose = useCallback(() => {
    setIsPopupOpen(false);
    setFocusedFrameIdx(null);
  }, []);

  // Active focused project metadata (1-to-1 matching the clicked frame slot)
  const activeProject = useMemo(() => {
    if (focusedFrameIdx === null || categoryProjects.length === 0) return null;
    return categoryProjects[focusedFrameIdx] || null;
  }, [focusedFrameIdx, categoryProjects]);

  // Is focused frame a "Coming Soon" frame?
  const isComingSoonFocused = focusedFrameIdx !== null && !activeProject;

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
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedFrameIdx, activeProject, activeGalleryImages, handleClose]);

  // Reset frame focus & image indices when changing category
  useEffect(() => {
    setIsPopupOpen(false);
    setFocusedFrameIdx(null);
    setFrameImageIndices({});
  }, [selectedCategory]);

  const handleCategoryChange = (cat: ProjectCategory) => {
    setIsPopupOpen(false);
    setFocusedFrameIdx(null);
    setFrameImageIndices({});
    if (onSelectCategory) onSelectCategory(cat);
  };

  const categoriesList: ProjectCategory[] = ["Residences", "Commercial", "Interior", "Unbuilt"];

  return (
    <div className="relative w-full h-full min-h-[600px] bg-neutral-950 text-white overflow-hidden select-none">
      {/* ── TOP NAVIGATION HUD ── */}
      {!hideTopHud && (
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
                onClick={handleClose}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black border border-amber-500/40 text-xs font-mono transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Hall View</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── 3D CANVAS VIEWPORT ── */}
      <Canvas
        camera={{ position: [2.0, 0.35, 0], fov: 50 }}
        className="w-full h-full cursor-none"
        onPointerMissed={() => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("custom-cursor-hover", {
                detail: { hovering: false }
              })
            );
          }
        }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 15, 10]} intensity={2.0} />
        <directionalLight position={[-10, 10, -10]} intensity={1.0} />

        <GallerySceneContent
          categoryProjects={categoryProjects}
          selectedCategory={selectedCategory}
          focusedFrameIdx={focusedFrameIdx}
          onFrameClick={handleFrameClick}
          onCameraArrived={handleCameraArrived}
          frameImageIndices={frameImageIndices}
        />
      </Canvas>

      {/* ── FULLSCREEN PROJECT IMAGE POPUP OVERLAY ── */}
      <AnimatePresence>
        {activeProject && isPopupOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0 z-30 flex items-center justify-center"
            onClick={handleClose}
          >
            {/* Dark overlay backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            />

            {/* Main popup container */}
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 25 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 15 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-40 w-[92vw] max-w-6xl h-[85vh] flex flex-col rounded-3xl overflow-hidden border border-white/15 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between px-6 py-4 bg-black/90 backdrop-blur-2xl border-b border-white/10 shrink-0">
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-mono text-[11px] tracking-widest border border-amber-500/30">
                    {activeProject.num || `NS-${focusedFrameIdx! + 1}`}
                  </span>
                  <div>
                    <h3 className="text-base font-bold tracking-tight text-white">
                      {activeProject.name}
                    </h3>
                    <p className="text-[11px] font-mono text-gray-400">
                      {activeProject.location} · {activeProject.year} · {activeProject.area}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Image Counter */}
                  <span className="px-3 py-1.5 rounded-lg bg-white/10 text-amber-300 font-mono text-[11px] font-bold border border-white/10">
                    {activeImageIdx + 1} / {activeGalleryImages.length}
                  </span>

                  {/* View Specs */}
                  {onOpenProjectDrawer && (
                    <button
                      onClick={() => onOpenProjectDrawer(activeProject)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white hover:text-black text-white text-[11px] font-mono transition-all cursor-pointer border border-white/10"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Specs</span>
                    </button>
                  )}

                  {/* Close */}
                  <button
                    onClick={handleClose}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white hover:text-black text-white transition-all cursor-pointer border border-white/10"
                    title="Close (Esc)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Image Display Area */}
              <div className="relative flex-1 bg-neutral-950 flex items-center justify-center overflow-hidden">
                {/* The Image */}
                <motion.img
                  key={activeGalleryImages[activeImageIdx]}
                  src={activeGalleryImages[activeImageIdx]}
                  alt={`${activeProject.name} - Image ${activeImageIdx + 1}`}
                  className="max-w-full max-h-full object-contain select-none"
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  draggable={false}
                />

                {/* Left Arrow */}
                {activeGalleryImages.length > 1 && (
                  <button
                    onClick={() => {
                      if (focusedFrameIdx === null) return;
                      setFrameImageIndices((prev) => {
                        const cur = prev[focusedFrameIdx] || 0;
                        const nextVal = (cur - 1 + activeGalleryImages.length) % activeGalleryImages.length;
                        return { ...prev, [focusedFrameIdx]: nextVal };
                      });
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-white hover:text-black text-white backdrop-blur-md border border-white/20 transition-all active:scale-90 cursor-pointer shadow-xl"
                    title="Previous Image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                {/* Right Arrow */}
                {activeGalleryImages.length > 1 && (
                  <button
                    onClick={() => {
                      if (focusedFrameIdx === null) return;
                      setFrameImageIndices((prev) => {
                        const cur = prev[focusedFrameIdx] || 0;
                        const nextVal = (cur + 1) % activeGalleryImages.length;
                        return { ...prev, [focusedFrameIdx]: nextVal };
                      });
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-white hover:text-black text-white backdrop-blur-md border border-white/20 transition-all active:scale-90 cursor-pointer shadow-xl"
                    title="Next Image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}

                {/* Dot indicators */}
                {activeGalleryImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                    {activeGalleryImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (focusedFrameIdx === null) return;
                          setFrameImageIndices((prev) => ({ ...prev, [focusedFrameIdx]: i }));
                        }}
                        className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                          i === activeImageIdx
                            ? "bg-amber-400 w-6"
                            : "bg-white/30 hover:bg-white/60"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom description bar */}
              <div className="px-6 py-3 bg-black/90 backdrop-blur-2xl border-t border-white/10 shrink-0">
                <p className="text-xs text-gray-400 line-clamp-2 max-w-4xl leading-relaxed">
                  {activeProject.desc}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Popup for COMING SOON Frames */}
        {isComingSoonFocused && isPopupOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="absolute inset-0 z-30 flex items-center justify-center"
            onClick={handleClose}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-40 w-[80vw] max-w-xl p-10 rounded-3xl bg-neutral-900/95 backdrop-blur-2xl border border-amber-500/30 shadow-2xl text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <Clock className="w-8 h-8 text-amber-400" />
                </div>
                <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-mono text-[10px] tracking-widest border border-amber-500/40 uppercase">
                  NS — UPCOMING
                </span>
                <h3 className="text-2xl font-bold text-white">
                  Coming Soon
                </h3>
                <p className="text-sm text-gray-400 max-w-md leading-relaxed">
                  This exhibition frame is reserved for an upcoming Noyyal Studio {selectedCategory.toLowerCase()} project currently under design & research.
                </p>
                <button
                  onClick={handleClose}
                  className="mt-4 flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white hover:text-black text-white text-sm font-mono transition-all cursor-pointer border border-white/15"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Back to Gallery</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

useGLTF.preload(MODEL_PATH);
