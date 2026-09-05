"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { getProjects, Project, ProjectCategory } from "@/config/sanity";
import DrawerCinematicViewport from "@/components/ui/DrawerCinematicViewport";

// Dynamically load VirtualGalleryHall to prevent SSR canvas issues
const VirtualGalleryHall = dynamic(
  () => import("@/components/three/VirtualGalleryHall"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-neutral-950 text-white font-mono text-xs tracking-widest uppercase">
        <div className="w-12 h-12 border-2 border-white/20 border-t-amber-400 rounded-full animate-spin mb-4" />
        <span>Loading 3D Exhibition Hall GLB Model...</span>
      </div>
    ),
  }
);

export default function Standalone3DGalleryPage() {
  const router = useRouter();
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory>("Residences");

  useEffect(() => {
    getProjects().then((data) => {
      setAllProjects(data);
    });
  }, []);

  const handleOpenDrawer = (proj: Project) => {
    const idx = allProjects.indexOf(proj);
    router.push(`/projects?open=${idx >= 0 ? idx : 0}&category=${selectedCategory.toLowerCase()}`);
  };

  return (
    <div className="w-full min-h-screen bg-neutral-950">
      <VirtualGalleryHall
        allProjects={allProjects}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onBackToGrid={() => router.push("/projects")}
        onOpenProjectDrawer={handleOpenDrawer}
      />
    </div>
  );
}
