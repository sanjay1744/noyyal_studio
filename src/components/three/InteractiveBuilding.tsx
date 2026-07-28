"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Center, Clone } from "@react-three/drei";
import * as THREE from "three";

const MODEL_PATH = "/models/modern_luxury_villa_house_building_home.glb";

export default function InteractiveBuilding() {
  const { scene } = useGLTF(MODEL_PATH);
  const groupRef = useRef<THREE.Group>(null);

  // Compute scale ONCE from pristine raw scene bounding box
  const targetScale = useMemo(() => {
    if (!scene) return 1;

    // Reset pristine transforms on cached scene to prevent mutation accumulation across page navigations
    scene.scale.set(1, 1, 1);
    scene.position.set(0, 0, 0);
    scene.rotation.set(0, 0, 0);

    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);

    const targetSize = 12;
    return maxDim > 0 ? targetSize / maxDim : 1;
  }, [scene]);

  // Slow continuous rotation around Y axis (turntable effect)
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.12;
    }
  });

  return (
    <group ref={groupRef}>
      {/* <Center top> aligns the building base at y = 0 */}
      <Center top>
        <group scale={targetScale}>
          {/* <Clone> creates an un-mutated render instance so page revisits never corrupt transforms */}
          <Clone object={scene} castShadow receiveShadow />
        </group>
      </Center>
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
