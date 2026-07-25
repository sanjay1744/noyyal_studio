"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function InteractiveBuilding() {
  const groupRef = useRef<THREE.Group>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);

    let scrollTriggerInstance: ScrollTrigger | null = null;

    if (groupRef.current) {
      scrollTriggerInstance = ScrollTrigger.create({
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5,
        onUpdate: (self) => {
          if (groupRef.current) {
            // Rotate structure on scroll
            groupRef.current.rotation.y = self.progress * Math.PI * 1.5;
            // Slightly compress/decompress volumes for organic architectural feel
            groupRef.current.scale.y = 1 - self.progress * 0.15;
          }
        }
      });
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (scrollTriggerInstance) {
        scrollTriggerInstance.kill();
      }
    };
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;

    // Apply interactive inertia based on cursor positions
    const targetX = mouse.current.y * 0.2;
    const targetZ = -mouse.current.x * 0.2;

    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.08;
    groupRef.current.rotation.z += (targetZ - groupRef.current.rotation.z) * 0.08;
  });

  return (
    <group ref={groupRef}>
      {/* Grid Ground Floor mapping */}
      <gridHelper args={[16, 16, "#d8d6d0", "#e8e7e3"]} position={[0, -2, 0]} />

      {/* Abstract Massing Blocks */}
      
      {/* Foundation plinth */}
      <mesh position={[0, -1.85, 0]}>
        <boxGeometry args={[4, 0.3, 5]} />
        <meshBasicMaterial color="#d8d6d0" wireframe />
      </mesh>

      {/* Living Wing Block */}
      <mesh position={[-0.8, -0.7, -0.6]}>
        <boxGeometry args={[2, 2, 2.8]} />
        <meshBasicMaterial color="#888888" wireframe />
      </mesh>

      {/* Cantilevered Bedroom Wing */}
      <mesh position={[0.6, 0.7, 0.8]}>
        <boxGeometry args={[2.2, 1.2, 3.4]} />
        <meshBasicMaterial color="#0c0c0c" wireframe />
      </mesh>

      {/* Vertical Stairwell Core */}
      <mesh position={[0.8, -0.1, -1.2]}>
        <boxGeometry args={[0.9, 3.2, 0.9]} />
        <meshBasicMaterial color="#444444" wireframe />
      </mesh>

      {/* Supporting Column Lines */}
      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(2.2, 1.2, 3.4)]} />
        <lineBasicMaterial attach="material" color="#0c0c0c" linewidth={1} />
      </lineSegments>
    </group>
  );
}
