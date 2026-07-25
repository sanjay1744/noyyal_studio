"use client";

import { Canvas } from "@react-three/fiber";
import InteractiveBuilding from "./InteractiveBuilding";
import { Suspense } from "react";

export default function HeroCanvas() {
  return (
    <div className="w-full h-full min-h-[380px] lg:min-h-[480px] relative select-none">
      <Canvas
        camera={{ position: [4, 3, 6], fov: 42 }}
        style={{ background: "transparent", pointerEvents: "auto" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 3]} intensity={1.2} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} />

        <Suspense fallback={null}>
          <InteractiveBuilding />
        </Suspense>
      </Canvas>
    </div>
  );
}
