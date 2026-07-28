"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { getProjects, Project } from "@/config/sanity";
import Footer from "@/components/ui/Footer";

// Dynamically import Three.js components to prevent SSR errors
const HeroCanvas = dynamic(() => import("@/components/three/HeroCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[380px] lg:min-h-[480px] flex items-center justify-center text-[9px] tracking-widest text-gray uppercase animate-pulse">
      Loading structural model...
    </div>
  ),
});

export default function HomePage() {
  const [selectedProjects, setSelectedProjects] = useState<Project[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch mock/cms projects
    getProjects().then((data) => {
      // Pick first 3 as selected/featured
      setSelectedProjects(data.slice(0, 3));
    });

    let ctx: gsap.Context | null = null;

    const startEntranceAnimations = () => {
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

        // Clean slide-up and fade-in for headers
        tl.fromTo(
          ".animate-eyebrow",
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 1.2, delay: 0.2 }
        );

        tl.fromTo(
          ".animate-word",
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1.4, stagger: 0.15 },
          "-=0.9"
        );

        tl.fromTo(
          descRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1.2 },
          "-=1.0"
        );

        // Stagger stats cell load
        tl.fromTo(
          ".animate-stat-cell",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1.0, stagger: 0.12 },
          "-=0.8"
        );
      }, containerRef);
    };

    // Orchestrate with the Intro Loader wrapper
    const isIntroComplete = typeof window !== "undefined" && 
                             (window as unknown as Record<string, unknown>).introComplete;
    
    if (isIntroComplete) {
      startEntranceAnimations();
    } else {
      window.addEventListener("introComplete", startEntranceAnimations);
    }

    return () => {
      window.removeEventListener("introComplete", startEntranceAnimations);
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full min-h-screen flex flex-col bg-white">
      {/* ── HERO SECTION ── */}
      <section className="w-full grid grid-cols-1 md:grid-cols-2 border-b border-light-gray">
        {/* Left Side Info */}
        <div className="flex flex-col justify-between p-8 md:p-12 border-r border-light-gray min-h-[50vh] md:min-h-[calc(100vh-56px)]">
          <div className="text-[9px] tracking-[0.3em] text-gray uppercase animate-eyebrow">
            — Architecture & Research Studio
          </div>
          
          <h1 
            ref={headlineRef} 
            className="font-syne text-[clamp(44px,5.2vw,80px)] font-extrabold leading-[0.92] tracking-tighter mt-12 mb-12 select-none"
          >
            <div className="overflow-hidden inline-block py-1">
              <span className="animate-word inline-block">Space</span>
            </div>
            <br />
            <div className="overflow-hidden inline-block py-1">
              <span className="animate-word inline-block">as</span>
            </div>
            <br />
            <div className="overflow-hidden inline-block py-1">
              <span className="animate-word inline-block font-normal italic font-playfair text-gray">
                inquiry.
              </span>
            </div>
          </h1>

          <div 
            ref={descRef} 
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
          >
            <p className="text-[10px] tracking-wide text-gray max-w-[240px] leading-[1.8] m-0">
              We design homes and research how architecture shapes human experience — rooted in the landscapes of South India.
            </p>
            <Link 
              href="/projects" 
              className="inline-block text-[9.5px] tracking-widest uppercase text-black border-b border-black pb-0.5 no-underline hover:opacity-50 transition-opacity self-start sm:self-auto"
            >
              View Work →
            </Link>
          </div>
        </div>

        {/* Right Side 3D Canvas */}
        <div className="relative flex flex-col justify-end p-8 md:p-12 min-h-[50vh] md:min-h-[calc(100vh-56px)] overflow-hidden">
          <div className="absolute inset-0 z-0">
            <HeroCanvas />
          </div>
          <div className="relative z-10 text-[9px] tracking-widest text-light-gray uppercase pointer-events-none mt-auto">
            Architectural Massing Study — Series I
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section 
        ref={statsRef}
        className="w-full grid grid-cols-2 md:grid-cols-4 border-b border-light-gray select-none"
      >
        <div className="animate-stat-cell p-7 md:p-8 border-r border-b md:border-b-0 border-light-gray">
          <div className="font-syne text-[32px] font-extrabold tracking-tighter leading-none">12</div>
          <div className="text-[9px] tracking-[0.2em] text-gray uppercase mt-1.5">Built Projects</div>
        </div>
        <div className="animate-stat-cell p-7 md:p-8 border-r-0 md:border-r border-b md:border-b-0 border-light-gray">
          <div className="font-syne text-[32px] font-extrabold tracking-tighter leading-none">4</div>
          <div className="text-[9px] tracking-[0.2em] text-gray uppercase mt-1.5">Active Research</div>
        </div>
        <div className="animate-stat-cell p-7 md:p-8 border-r border-light-gray">
          <div className="font-syne text-[32px] font-extrabold tracking-tighter leading-none">2018</div>
          <div className="text-[9px] tracking-[0.2em] text-gray uppercase mt-1.5">Founded</div>
        </div>
        <div className="animate-stat-cell p-7 md:p-8">
          <div className="font-syne text-[32px] font-extrabold tracking-tighter leading-none">3</div>
          <div className="text-[9px] tracking-[0.2em] text-gray uppercase mt-1.5">Publications</div>
        </div>
      </section>

      {/* ── SELECTED WORK ── */}
      <section className="w-full flex flex-col">
        <div className="flex justify-between items-baseline p-10 px-8 md:px-12 border-b border-light-gray">
          <h2 className="font-syne text-[11px] font-bold tracking-[0.3em] uppercase m-0">Selected Work</h2>
          <Link 
            href="/projects" 
            className="text-[9.5px] tracking-widest uppercase text-gray hover:text-black border-b border-light-gray hover:border-black pb-0.5 transition-all no-underline"
          >
            All Projects
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3">
          {selectedProjects.map((project, index) => (
            <Link 
              href={`/projects?open=${index}`}
              key={project.num}
              className="group border-b md:border-b-0 md:border-r last:border-r-0 border-light-gray flex flex-col no-underline transition-colors duration-300 hover:bg-[#eeede8]"
            >
              {/* Image */}
              <div className="w-full aspect-[4/3] bg-light-gray overflow-hidden relative">
                {project.heroImage ? (
                  <img
                    src={project.heroImage}
                    alt={project.name}
                    className="w-full h-full object-cover filter grayscale contrast-[1.05] group-hover:grayscale-0 group-hover:contrast-100 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#d6d4ce] via-[#c8c6bf] to-[#b8b6b0] flex items-center justify-center text-[9px] tracking-widest text-[#aaa] uppercase">
                    Image Placeholder
                  </div>
                )}
              </div>

              {/* Meta */}
              <div className="p-6 md:p-8">
                <div className="text-[9px] tracking-widest text-gray mb-1.5">{project.num}</div>
                <div className="font-syne text-[15px] font-bold tracking-tight text-black leading-snug">
                  {project.name}
                </div>
                <div className="text-[9px] tracking-[0.15em] text-gray uppercase mt-1.5">
                  {project.type} · {project.location.split(",")[0]} · {project.year}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── STUDIO STATEMENT ── */}
      <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 p-12 px-8 md:px-12 border-t border-b border-light-gray select-none">
        <div className="text-[9px] tracking-[0.3em] text-gray uppercase">Practice</div>
        <div className="md:col-span-2">
          <p className="font-playfair text-[clamp(20px,2.6vw,34px)] leading-[1.35] tracking-tight text-black m-0">
            We believe architecture is a form of <span className="font-normal italic text-gray">slow research</span> — each house is also a question about how light falls, how a threshold feels, how a room decides to breathe.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
