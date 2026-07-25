"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getProjects, Project } from "@/config/sanity";
import Footer from "@/components/ui/Footer";
import { clsx } from "clsx";

function ProjectsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number>(-1);
  const [isOpen, setIsOpen] = useState(false);

  // Filters
  const [activeType, setActiveType] = useState("all");
  const [activeYear, setActiveYear] = useState("all");
  const [activeStatus, setActiveStatus] = useState("all");

  // Load data
  useEffect(() => {
    getProjects().then((data) => {
      setAllProjects(data);
      
      // Check query params to see if we should open a project
      const openParam = searchParams.get("open");
      if (openParam !== null) {
        const idx = parseInt(openParam, 10);
        if (idx >= 0 && idx < data.length) {
          setSelectedProject(data[idx]);
          setSelectedIdx(idx);
          setIsOpen(true);
        }
      }
    });
  }, [searchParams]);

  // Apply filters dynamically during render to avoid cascading useEffect calls
  const filteredProjects = allProjects.filter((p) => {
    if (activeType !== "all" && p.type.toLowerCase() !== activeType.toLowerCase()) return false;
    if (activeYear !== "all" && p.year !== activeYear) return false;
    if (activeStatus !== "all" && p.status !== activeStatus) return false;
    return true;
  });

  const handleOpenProject = (proj: Project, idx: number) => {
    setSelectedProject(proj);
    setSelectedIdx(idx);
    setIsOpen(true);
    router.push(`/projects?open=${idx}`, { scroll: false });
  };

  const handleCloseProject = () => {
    setIsOpen(false);
    router.push("/projects", { scroll: false });
  };

  const handleNextProject = () => {
    if (allProjects.length === 0) return;
    const nextIdx = (selectedIdx + 1) % allProjects.length;
    setSelectedProject(allProjects[nextIdx]);
    setSelectedIdx(nextIdx);
    router.push(`/projects?open=${nextIdx}`, { scroll: false });
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-white">
      <div className="flex-grow flex relative pt-0">
        {/* ── SIDEBAR FILTERS ── */}
        <aside className="w-[260px] border-r border-light-gray h-[calc(100vh-56px)] sticky top-14 overflow-y-auto hidden md:block bg-white shrink-0 select-none">
          {/* Section: Type */}
          <div className="border-b border-light-gray py-5 px-6">
            <div className="text-[9px] tracking-[0.3em] text-gray uppercase mb-3">Filter by Type</div>
            <div className="flex flex-wrap gap-2">
              {["all", "residential", "research"].map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={clsx(
                    "text-[9px] tracking-[0.15em] uppercase border px-2.5 py-1 transition-all duration-200 cursor-none",
                    activeType === type 
                      ? "border-black text-black font-semibold" 
                      : "border-light-gray text-gray hover:border-black hover:text-black"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Year */}
          <div className="border-b border-light-gray py-5 px-6 flex flex-col gap-1.5">
            <div className="text-[9px] tracking-[0.3em] text-gray uppercase mb-2">Filter by Year</div>
            <button
              onClick={() => setActiveYear("all")}
              className={clsx(
                "text-[10px] tracking-[0.08em] text-left py-1.5 border-l-2 pl-3 transition-all cursor-none",
                activeYear === "all" ? "border-black text-black font-semibold bg-[rgba(0,0,0,0.015)]" : "border-transparent text-mid hover:text-black"
              )}
            >
              All Years
            </button>
            {["2024", "2023", "2022", "2021"].map((yr) => (
              <button
                key={yr}
                onClick={() => setActiveYear(yr)}
                className={clsx(
                  "text-[10px] tracking-[0.08em] text-left py-1.5 border-l-2 pl-3 transition-all cursor-none",
                  activeYear === yr ? "border-black text-black font-semibold bg-[rgba(0,0,0,0.015)]" : "border-transparent text-mid hover:text-black"
                )}
              >
                {yr}
              </button>
            ))}
          </div>

          {/* Section: Status */}
          <div className="border-b border-light-gray py-5 px-6 flex flex-col gap-1.5">
            <div className="text-[9px] tracking-[0.3em] text-gray uppercase mb-2">Filter by Status</div>
            <button
              onClick={() => setActiveStatus("all")}
              className={clsx(
                "text-[10px] tracking-[0.08em] text-left py-1.5 border-l-2 pl-3 transition-all cursor-none",
                activeStatus === "all" ? "border-black text-black font-semibold bg-[rgba(0,0,0,0.015)]" : "border-transparent text-mid hover:text-black"
              )}
            >
              All
            </button>
            {["built", "ongoing", "study"].map((st) => (
              <button
                key={st}
                onClick={() => setActiveStatus(st)}
                className={clsx(
                  "text-[10px] tracking-[0.08em] text-left py-1.5 border-l-2 pl-3 transition-all cursor-none",
                  activeStatus === st ? "border-black text-black font-semibold bg-[rgba(0,0,0,0.015)]" : "border-transparent text-mid hover:text-black"
                )}
              >
                <span className="capitalize">{st}</span>
              </button>
            ))}
          </div>

          {/* Section: Jump to */}
          <div className="py-5 px-6 flex flex-col gap-1.5">
            <div className="text-[9px] tracking-[0.3em] text-gray uppercase mb-2">Jump to</div>
            {allProjects.map((p, i) => (
              <button
                key={p.num}
                onClick={() => handleOpenProject(p, i)}
                className="text-[10px] tracking-[0.08em] text-left py-1.5 text-mid hover:text-black transition-colors cursor-none"
              >
                {p.name}
              </button>
            ))}
          </div>
        </aside>

        {/* ── PROJECTS LIST AREA ── */}
        <section className="flex-grow flex flex-col">
          {/* Header Row */}
          <div className="grid grid-cols-[48px_2fr_1fr_1fr_80px] px-8 py-3.5 border-b border-light-gray text-[8.5px] tracking-[0.25em] text-gray uppercase font-semibold select-none">
            <span>#</span>
            <span>Project</span>
            <span>Type</span>
            <span>Year</span>
            <span className="text-center">Status</span>
          </div>

          {/* Rows */}
          <div className="flex-grow">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((p, index) => {
                const originalIndex = allProjects.indexOf(p);
                return (
                  <div
                    key={p.num}
                    onClick={() => handleOpenProject(p, originalIndex)}
                    className="grid grid-cols-[48px_2fr_1fr_1fr_80px] px-8 items-center border-b border-light-gray min-h-[68px] hover:bg-[#eeede8] transition-colors duration-200 cursor-none"
                  >
                    <span className="text-[9px] text-gray tracking-wide">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-syne text-[14px] font-semibold text-black tracking-tight">
                      {p.name}
                    </span>
                    <span className="text-[9.5px] text-gray tracking-wide uppercase">
                      {p.type}
                    </span>
                    <span className="text-[9.5px] text-gray">{p.year}</span>
                    <span className="flex justify-center">
                      <span
                        className={clsx(
                          "text-[8.5px] tracking-widest uppercase border px-2 py-0.5 min-w-[70px] text-center",
                          p.status === "built" ? "border-black text-black" : "border-light-gray text-gray"
                        )}
                      >
                        {p.status}
                      </span>
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-gray text-[10px] tracking-widest uppercase py-24">
                No projects match selected filter criteria.
              </div>
            )}
          </div>
          
          <Footer leftText="© 2026 Noyyal Studios · Project Catalogue" />
        </section>

        {/* ── DETAIL OVERLAY PANEL ── */}
        <div
          className={clsx(
            "fixed top-14 right-0 w-[100%] md:w-[calc(100%-260px)] h-[calc(100vh-56px)] bg-[#f4f3ef] border-l border-light-gray z-[200] flex flex-col md:flex-row transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden",
            isOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          {/* Close trigger */}
          <button
            onClick={handleCloseProject}
            className="absolute top-6 left-6 text-[9.5px] tracking-widest uppercase text-gray hover:text-black bg-none border-none transition-colors cursor-none z-30"
          >
            ← Close
          </button>

          {selectedProject && (
            <>
              {/* Left Column: Visuals */}
              <div className="w-full md:w-[55%] border-r border-light-gray overflow-y-auto p-12 pt-16 flex flex-col gap-6">
                <div className="text-[9px] text-gray tracking-widest">{selectedProject.num}</div>
                <h3 className="font-syne text-[clamp(28px,2.8vw,48px)] font-extrabold leading-[0.95] tracking-tighter m-0">
                  {selectedProject.name}
                </h3>
                
                {/* Hero visual */}
                <div className="w-full aspect-[16/10] bg-gradient-to-br from-[#d6d4ce] to-[#b8b6b0] flex items-center justify-center text-[9px] tracking-widest text-[#aaa] uppercase select-none">
                  Image Placeholder — {selectedProject.name}
                </div>

                {/* Sub drawings/details grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="aspect-[4/3] bg-gradient-to-br from-[#ccc] to-[#b0afa9] flex items-center justify-center text-[8px] text-[#aaa] tracking-widest uppercase select-none">
                    Detail 01
                  </div>
                  <div className="aspect-[4/3] bg-gradient-to-br from-[#ccc] to-[#b0afa9] flex items-center justify-center text-[8px] text-[#aaa] tracking-widest uppercase select-none">
                    Detail 02
                  </div>
                  <div className="aspect-[4/3] bg-gradient-to-br from-[#ccc] to-[#b0afa9] flex items-center justify-center text-[8px] text-[#aaa] tracking-widest uppercase select-none">
                    Section Drawing
                  </div>
                  <div className="aspect-[4/3] bg-gradient-to-br from-[#ccc] to-[#b0afa9] flex items-center justify-center text-[8px] text-[#aaa] tracking-widest uppercase select-none">
                    Floor Plan
                  </div>
                </div>
              </div>

              {/* Right Column: Information */}
              <div className="w-full md:w-[45%] overflow-y-auto p-10 pt-16 flex flex-col gap-8 select-none">
                <div className="h-6 hidden md:block"></div>
                
                {/* Metadata Table */}
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-light-gray">
                      <td className="py-2.5 text-[9px] text-gray tracking-widest uppercase w-32">Location</td>
                      <td className="py-2.5 text-[10px] text-black tracking-wide">{selectedProject.location}</td>
                    </tr>
                    <tr className="border-b border-light-gray">
                      <td className="py-2.5 text-[9px] text-gray tracking-widest uppercase">Year</td>
                      <td className="py-2.5 text-[10px] text-black tracking-wide">{selectedProject.year}</td>
                    </tr>
                    <tr className="border-b border-light-gray">
                      <td className="py-2.5 text-[9px] text-gray tracking-widest uppercase">Program</td>
                      <td className="py-2.5 text-[10px] text-black tracking-wide">{selectedProject.program}</td>
                    </tr>
                    <tr className="border-b border-light-gray">
                      <td className="py-2.5 text-[9px] text-gray tracking-widest uppercase">Area</td>
                      <td className="py-2.5 text-[10px] text-black tracking-wide">{selectedProject.area}</td>
                    </tr>
                    <tr className="border-b border-light-gray">
                      <td className="py-2.5 text-[9px] text-gray tracking-widest uppercase">Status</td>
                      <td className="py-2.5 text-[10px] text-black tracking-wide capitalize">{selectedProject.status}</td>
                    </tr>
                    <tr className="border-b border-light-gray">
                      <td className="py-2.5 text-[9px] text-gray tracking-widest uppercase">Type</td>
                      <td className="py-2.5 text-[10px] text-black tracking-wide">{selectedProject.type}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Description */}
                <p className="font-playfair text-[15px] leading-[1.75] text-mid m-0">
                  {selectedProject.desc}
                </p>

                {/* Keywords */}
                <div>
                  <div className="text-[8.5px] tracking-[0.3em] text-gray uppercase mb-3 pb-2 border-b border-light-gray">
                    Keywords
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[8.5px] tracking-widest uppercase border border-light-gray px-2.5 py-1 text-gray"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Next Project link */}
                <div className="mt-6 border-t border-light-gray pt-6">
                  <div className="text-[8.5px] tracking-[0.3em] text-gray uppercase mb-3">Next Project</div>
                  <button
                    onClick={handleNextProject}
                    className="font-syne text-[14px] font-bold text-black text-left hover:opacity-50 transition-opacity flex items-center gap-2 cursor-none"
                  >
                    {allProjects[(selectedIdx + 1) % allProjects.length]?.name} →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen flex items-center justify-center text-[10px] tracking-widest text-gray uppercase animate-pulse">
        Loading project grid catalog...
      </div>
    }>
      <ProjectsContent />
    </Suspense>
  );
}
