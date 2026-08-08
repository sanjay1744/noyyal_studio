"use client";

import { useEffect, useState, useMemo, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getProjects, 
  Project, 
  ProjectCategory 
} from "@/config/sanity";
import Footer from "@/components/ui/Footer";
import { clsx } from "clsx";
import { 
  Grid, 
  List, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Calendar, 
  Maximize2, 
  Layers, 
  Tag, 
  ArrowUpRight,
  Search
} from "lucide-react";

type CategoryFilter = "All" | ProjectCategory;

const CATEGORIES: CategoryFilter[] = [
  "All",
  "Residences",
  "Commercial",
  "Interior",
  "Unbuilt"
];

function ProjectsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [activeYear, setActiveYear] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Selected project drawer state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number>(-1);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Fetch Projects Data
  useEffect(() => {
    getProjects().then((data) => {
      setAllProjects(data);

      // Handle category from query param if available
      const catParam = searchParams.get("category");
      if (catParam) {
        const foundCategory = CATEGORIES.find(
          (c) => c.toLowerCase() === catParam.toLowerCase()
        );
        if (foundCategory) setActiveCategory(foundCategory);
      }

      // Handle project open from query param
      const openParam = searchParams.get("open");
      if (openParam !== null) {
        const idx = parseInt(openParam, 10);
        if (idx >= 0 && idx < data.length) {
          setSelectedProject(data[idx]);
          setSelectedIdx(idx);
          setActiveGalleryIdx(0);
          setIsOpen(true);
        }
      }
    });
  }, [searchParams]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allProjects.length };
    CATEGORIES.forEach((cat) => {
      if (cat !== "All") {
        counts[cat] = allProjects.filter((p) => p.category === cat).length;
      }
    });
    return counts;
  }, [allProjects]);

  // Available years list
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(allProjects.map((p) => p.year))).sort().reverse();
    return ["All", ...years];
  }, [allProjects]);

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return allProjects.filter((p) => {
      // 1. Category Filter
      if (activeCategory !== "All" && p.category !== activeCategory) {
        return false;
      }
      // 2. Year Filter
      if (activeYear !== "All" && p.year !== activeYear) {
        return false;
      }
      // 3. Search Query Filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesLoc = p.location.toLowerCase().includes(query);
        const matchesProgram = p.program.toLowerCase().includes(query);
        const matchesTags = p.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchesName && !matchesLoc && !matchesProgram && !matchesTags) {
          return false;
        }
      }
      return true;
    });
  }, [allProjects, activeCategory, activeYear, searchQuery]);

  // Open detail panel
  const handleOpenProject = (proj: Project, idx: number) => {
    setSelectedProject(proj);
    setSelectedIdx(idx);
    setActiveGalleryIdx(0);
    setIsOpen(true);
    router.push(`/projects?open=${idx}${activeCategory !== "All" ? `&category=${activeCategory.toLowerCase()}` : ""}`, { scroll: false });
  };

  // Close detail panel
  const handleCloseProject = useCallback(() => {
    setIsOpen(false);
    router.push(`/projects${activeCategory !== "All" ? `?category=${activeCategory.toLowerCase()}` : ""}`, { scroll: false });
  }, [activeCategory, router]);

  // Switch to Next Project
  const handleNextProject = useCallback(() => {
    if (allProjects.length === 0) return;
    const nextIdx = (selectedIdx + 1) % allProjects.length;
    setSelectedProject(allProjects[nextIdx]);
    setSelectedIdx(nextIdx);
    setActiveGalleryIdx(0);
    router.push(`/projects?open=${nextIdx}${activeCategory !== "All" ? `&category=${activeCategory.toLowerCase()}` : ""}`, { scroll: false });
  }, [allProjects, selectedIdx, activeCategory, router]);

  // Switch to Prev Project
  const handlePrevProject = useCallback(() => {
    if (allProjects.length === 0) return;
    const prevIdx = (selectedIdx - 1 + allProjects.length) % allProjects.length;
    setSelectedProject(allProjects[prevIdx]);
    setSelectedIdx(prevIdx);
    setActiveGalleryIdx(0);
    router.push(`/projects?open=${prevIdx}${activeCategory !== "All" ? `&category=${activeCategory.toLowerCase()}` : ""}`, { scroll: false });
  }, [allProjects, selectedIdx, activeCategory, router]);

  // Keyboard navigation & escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        handleCloseProject();
      } else if (e.key === "ArrowRight") {
        handleNextProject();
      } else if (e.key === "ArrowLeft") {
        handlePrevProject();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleCloseProject, handleNextProject, handlePrevProject]);

  // Set active category filter
  const handleCategorySelect = (cat: CategoryFilter) => {
    setActiveCategory(cat);
    if (cat === "All") {
      router.push("/projects", { scroll: false });
    } else {
      router.push(`/projects?category=${cat.toLowerCase()}`, { scroll: false });
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-transparent text-[#111]">
      {/* ── TOP CONTROL & FILTER BAR ── */}
      <header className="sticky top-14 z-30 w-full bg-[#f4f3ef]/90 backdrop-blur-md border-b border-[#e5e3dc] px-4 md:px-8 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3 transition-all select-none">
        {/* Compact Category Filter Bar */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto scrollbar-none py-0.5">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            const count = categoryCounts[cat] || 0;

            return (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={clsx(
                  "relative px-3.5 py-1.5 text-[9.5px] tracking-[0.18em] uppercase font-semibold transition-colors duration-300 rounded-full shrink-0 flex items-center gap-1.5 cursor-pointer",
                  isActive ? "text-black" : "text-[#777] hover:text-black"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryPill"
                    className="absolute inset-0 bg-[#e8e6df] rounded-full border border-[#d8d6ce] shadow-2xs"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{cat}</span>
                <span 
                  className={clsx(
                    "relative z-10 text-[8.5px] px-1.5 py-0.2 rounded-full font-mono transition-colors",
                    isActive ? "bg-black text-white" : "bg-[#eceae3] text-[#777]"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Tools: Year Filter, Search & View Switcher */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-[#e5e3dc] pt-2 md:pt-0">
          {/* Year Filter dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={activeYear}
              onChange={(e) => setActiveYear(e.target.value)}
              className="bg-[#f0eee8] text-[9.5px] tracking-widest uppercase border border-[#dcdcd4] rounded-full px-3 py-1 text-black font-mono outline-none focus:border-black cursor-pointer"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr === "All" ? "All Years" : yr}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative flex items-center">
            <Search className="w-3 h-3 absolute left-2.5 text-[#888] pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#f0eee8] text-[10px] tracking-wide placeholder-[#999] border border-[#dcdcd4] rounded-full pl-7 pr-3 py-1 w-28 sm:w-36 outline-none focus:border-black transition-all focus:w-44"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                className="absolute right-2 text-[#888] hover:text-black cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Grid / List Mode Switcher */}
          <div className="flex items-center bg-[#eceae3] p-0.5 rounded-full border border-[#dcdcd4]">
            <button
              onClick={() => setViewMode("grid")}
              className={clsx(
                "p-1 rounded-full transition-all cursor-pointer",
                viewMode === "grid" ? "bg-white text-black shadow-xs" : "text-[#777] hover:text-black"
              )}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={clsx(
                "p-1 rounded-full transition-all cursor-pointer",
                viewMode === "list" ? "bg-white text-black shadow-xs" : "text-[#777] hover:text-black"
              )}
              title="Architectural List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-grow px-4 md:px-10 py-6 max-w-[1700px] w-full mx-auto">
        {/* Results Metadata summary */}
        <div className="flex items-center justify-between mb-5 border-b border-[#e5e3dc] pb-2.5 select-none">
          <div className="text-[9.5px] tracking-[0.25em] text-[#777] uppercase font-mono">
            Showing <span className="text-black font-bold">{filteredProjects.length}</span> {activeCategory === "All" ? "Total Projects" : `${activeCategory} Projects`}
          </div>
          {searchQuery && (
            <div className="text-[9.5px] text-[#777]">
              Filtering for &ldquo;<span className="text-black italic">{searchQuery}</span>&rdquo;
            </div>
          )}
        </div>

        {/* ── VIEW MODE: GRID ── */}
        {viewMode === "grid" && (
          <AnimatePresence mode="wait">
            {filteredProjects.length > 0 ? (
              <motion.div
                key={`grid-${activeCategory}-${activeYear}-${searchQuery}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
              >
                {filteredProjects.map((p, index) => {
                  const originalIndex = allProjects.indexOf(p);
                  return (
                    <motion.div
                      key={p.num}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      onClick={() => handleOpenProject(p, originalIndex)}
                      className="group cursor-pointer flex flex-col bg-white border border-[#e5e3dc] rounded-sm overflow-hidden shadow-xs hover:shadow-xl hover:border-black transition-all duration-500"
                    >
                      {/* Image Container with Zoom & Floating Badges */}
                      <div className="w-full aspect-[16/11] bg-[#eae8e1] overflow-hidden relative">
                        {p.heroImage ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={p.heroImage}
                            alt={p.name}
                            className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-1.07"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] tracking-widest text-[#aaa] uppercase font-mono">
                            {p.name}
                          </div>
                        )}
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-40 group-hover:opacity-60 transition-opacity duration-300" />

                        {/* Top Badges */}
                        <div className="absolute top-3 right-3 flex items-center justify-end pointer-events-none">
                          <span 
                            className={clsx(
                              "text-[8px] font-mono tracking-widest uppercase px-2.5 py-1 rounded-sm border backdrop-blur-md font-semibold",
                              p.status === "built" 
                                ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/30" 
                                : p.status === "unbuilt"
                                ? "bg-amber-950/80 text-amber-300 border-amber-500/30"
                                : "bg-black/80 text-gray-200 border-white/20"
                            )}
                          >
                            {p.status}
                          </span>
                        </div>

                        {/* Bottom Overlay Info on Hover */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity">
                          <span className="text-[9px] tracking-wider font-mono flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-sm">
                            <MapPin className="w-2.5 h-2.5" />
                            {p.location.split(",")[0]}
                          </span>
                          <span className="text-[9px] tracking-wider font-mono bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-sm">
                            {p.area}
                          </span>
                        </div>
                      </div>

                      {/* Content Card Info */}
                      <div className="p-6 flex flex-col justify-between flex-grow bg-white group-hover:bg-[#faf9f5] transition-colors">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[9px] tracking-[0.2em] font-semibold text-[#888] uppercase">
                              {p.category}
                            </span>
                            <span className="text-[9.5px] font-mono text-[#888]">
                              {p.year}
                            </span>
                          </div>

                          <h3 className="font-syne text-[18px] font-bold text-black tracking-tight leading-snug group-hover:text-black transition-colors flex items-center justify-between">
                            <span>{p.name}</span>
                            <ArrowUpRight className="w-4 h-4 text-[#aaa] group-hover:text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                          </h3>

                          <p className="font-playfair text-[13px] text-[#666] leading-relaxed line-clamp-2 mt-2">
                            {p.desc}
                          </p>
                        </div>

                        {/* Keyword Tags */}
                        <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-[#f0eee8]">
                          {p.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[8px] tracking-widest uppercase bg-[#f3f1eb] text-[#666] px-2 py-0.5 rounded-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-24 text-center border border-dashed border-[#dcdcd4] rounded-lg p-12 bg-white"
              >
                <Layers className="w-8 h-8 text-[#aaa] mx-auto mb-3" />
                <p className="font-syne text-[16px] font-semibold text-black mb-1">
                  No projects match your filter criteria
                </p>
                <p className="text-[11px] text-[#777] mb-6">
                  Try switching category or resetting search parameters.
                </p>
                <button
                  onClick={() => {
                    setActiveCategory("All");
                    setActiveYear("All");
                    setSearchQuery("");
                  }}
                  className="text-[10px] tracking-widest uppercase bg-black text-white px-5 py-2.5 rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* ── VIEW MODE: ARCHITECTURAL LIST ── */}
        {viewMode === "list" && (
          <AnimatePresence mode="wait">
            {filteredProjects.length > 0 ? (
              <motion.div
                key={`list-${activeCategory}-${activeYear}-${searchQuery}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border border-[#e5e3dc] bg-white rounded-sm overflow-hidden shadow-xs"
              >
                {/* Table Header */}
                <div className="grid grid-cols-[60px_2.5fr_1fr_1.2fr_1fr_90px] px-6 py-3.5 bg-[#f6f5f0] border-b border-[#e5e3dc] text-[8.5px] tracking-[0.25em] text-[#777] uppercase font-mono font-semibold select-none">
                  <span>#</span>
                  <span>Project Title</span>
                  <span>Category</span>
                  <span>Location</span>
                  <span>Year</span>
                  <span className="text-center">Status</span>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-[#f0eee8]">
                  {filteredProjects.map((p, index) => {
                    const originalIndex = allProjects.indexOf(p);
                    return (
                      <motion.div
                        key={p.num}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.03 }}
                        onClick={() => handleOpenProject(p, originalIndex)}
                        className="grid grid-cols-[60px_2.5fr_1fr_1.2fr_1fr_90px] px-6 py-4 items-center hover:bg-[#f7f6f1] transition-colors duration-200 cursor-pointer group"
                      >
                        <span className="text-[10px] font-mono text-[#999] group-hover:text-black">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="flex items-center gap-3">
                          {/* Mini Thumbnail */}
                          <div className="w-9 h-7 bg-[#eae8e1] rounded-xs overflow-hidden shrink-0 hidden sm:block">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.heroImage}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-1.1 transition-transform duration-300"
                            />
                          </div>
                          <div>
                            <span className="font-syne text-[14.5px] font-bold text-black group-hover:underline underline-offset-4 decoration-1">
                              {p.name}
                            </span>
                            <span className="text-[9.5px] text-[#888] block sm:hidden font-mono mt-0.5">
                              {p.category} · {p.year}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] tracking-wider text-[#666] font-mono uppercase">
                          {p.category}
                        </span>
                        <span className="text-[10.5px] text-[#666] font-mono flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#aaa]" />
                          {p.location.split(",")[0]}
                        </span>
                        <span className="text-[10.5px] text-[#666] font-mono">
                          {p.year}
                        </span>
                        <span className="flex justify-center">
                          <span
                            className={clsx(
                              "text-[8px] font-mono tracking-widest uppercase border px-2 py-0.5 min-w-[70px] text-center rounded-xs font-semibold",
                              p.status === "built" 
                                ? "border-emerald-600/40 text-emerald-800 bg-emerald-50/50" 
                                : p.status === "unbuilt"
                                ? "border-amber-600/40 text-amber-800 bg-amber-50/50"
                                : "border-[#ccc] text-[#666]"
                            )}
                          >
                            {p.status}
                          </span>
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <div className="py-20 text-center border border-dashed border-[#dcdcd4] rounded-lg p-12 bg-white">
                <p className="font-syne text-[15px] font-semibold text-black mb-1">
                  No projects match your filter criteria
                </p>
              </div>
            )}
          </AnimatePresence>
        )}
      </main>

      <Footer leftText="© 2026 Noyyal Studios · Portfolio & Architectural Archive" />

      {/* ── DETAIL SLIDE-OVER DRAWER & LIGHTBOX ── */}
      <AnimatePresence>
        {isOpen && selectedProject && (
          <>
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={handleCloseProject}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[150]"
            />

            {/* Slide-Over Container */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed top-14 right-0 w-full lg:w-[85vw] xl:w-[75vw] h-[calc(100vh-56px)] bg-[#f6f5f0] border-l border-[#d8d6ce] z-[160] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Drawer Top Navigation Header */}
              <div className="px-6 py-4 bg-white border-b border-[#e5e3dc] flex items-center justify-between select-none shrink-0">
                {/* Left Controls: Close & Project Serial */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleCloseProject}
                    className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase bg-[#f0eee8] hover:bg-black hover:text-white text-[#444] px-3.5 py-1.5 rounded-full transition-all cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Close (ESC)</span>
                  </button>
                </div>

                {/* Center Title */}
                <div className="text-center truncate px-4 hidden md:block">
                  <span className="font-syne text-[14px] font-bold text-black tracking-tight">
                    {selectedProject.name}
                  </span>
                  <span className="text-[9.5px] font-mono text-[#888] ml-3 uppercase">
                    [{selectedProject.category}]
                  </span>
                </div>

                {/* Right Controls: Prev / Next Navigation */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevProject}
                    className="p-2 bg-[#f0eee8] hover:bg-black hover:text-white rounded-full transition-all text-black cursor-pointer"
                    title="Previous Project (Left Arrow)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-mono text-[#777]">
                    {selectedIdx + 1} / {allProjects.length}
                  </span>
                  <button
                    onClick={handleNextProject}
                    className="p-2 bg-[#f0eee8] hover:bg-black hover:text-white rounded-full transition-all text-black cursor-pointer"
                    title="Next Project (Right Arrow)"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Drawer Body Scroll Area */}
              <div className="flex-grow overflow-y-auto flex flex-col lg:flex-row">
                {/* Left Side: Visual Media Gallery */}
                <div className="w-full lg:w-[60%] border-r border-[#e5e3dc] p-6 lg:p-10 flex flex-col gap-6 bg-[#f0eee8]/50">
                  {/* Hero Main Image with Fade Animation */}
                  <div className="w-full aspect-[16/10] bg-black/5 rounded-sm overflow-hidden relative shadow-md group">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={selectedProject.gallery[activeGalleryIdx] || selectedProject.heroImage}
                        src={selectedProject.gallery[activeGalleryIdx] || selectedProject.heroImage}
                        alt={selectedProject.name}
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="w-full h-full object-cover"
                      />
                    </AnimatePresence>
                    <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-[9px] font-mono px-2.5 py-1 rounded-xs pointer-events-none">
                      Photo {activeGalleryIdx + 1} of {selectedProject.gallery.length}
                    </div>
                  </div>

                  {/* Thumbnail Selector Grid */}
                  <div>
                    <div className="text-[9px] tracking-[0.25em] text-[#888] uppercase font-mono mb-2.5 font-semibold">
                      Architectural Views & Details
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {selectedProject.gallery.map((imgUrl, gIdx) => (
                        <button
                          key={gIdx}
                          onClick={() => setActiveGalleryIdx(gIdx)}
                          className={clsx(
                            "aspect-[4/3] rounded-xs overflow-hidden border-2 transition-all relative cursor-pointer",
                            activeGalleryIdx === gIdx
                              ? "border-black scale-102 shadow-sm"
                              : "border-transparent opacity-60 hover:opacity-100"
                          )}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imgUrl}
                            alt={`${selectedProject.name} thumbnail ${gIdx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side: Detailed Project Specs & Narrative */}
                <div className="w-full lg:w-[40%] p-6 lg:p-10 flex flex-col justify-between bg-white">
                  <div className="space-y-8">
                    {/* Header */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9.5px] font-mono tracking-widest uppercase bg-[#eceae3] px-2.5 py-0.5 rounded-xs text-black font-semibold">
                          {selectedProject.category}
                        </span>
                      </div>

                      <h2 className="font-syne text-[clamp(24px,2.5vw,36px)] font-bold text-black leading-tight tracking-tight">
                        {selectedProject.name}
                      </h2>
                    </div>

                    {/* Metadata Table */}
                    <div className="border border-[#e5e3dc] rounded-sm overflow-hidden text-[11px] font-mono">
                      <div className="grid grid-cols-3 border-b border-[#e5e3dc] px-4 py-2.5 bg-[#faf9f6]">
                        <span className="text-[#888] uppercase text-[9px] tracking-wider flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-[#777]" /> Location
                        </span>
                        <span className="col-span-2 text-black font-semibold">
                          {selectedProject.location}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 border-b border-[#e5e3dc] px-4 py-2.5 bg-white">
                        <span className="text-[#888] uppercase text-[9px] tracking-wider flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-[#777]" /> Year
                        </span>
                        <span className="col-span-2 text-black font-semibold">
                          {selectedProject.year}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 border-b border-[#e5e3dc] px-4 py-2.5 bg-[#faf9f6]">
                        <span className="text-[#888] uppercase text-[9px] tracking-wider flex items-center gap-1.5">
                          <Maximize2 className="w-3 h-3 text-[#777]" /> Built Area
                        </span>
                        <span className="col-span-2 text-black font-semibold">
                          {selectedProject.area}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 border-b border-[#e5e3dc] px-4 py-2.5 bg-white">
                        <span className="text-[#888] uppercase text-[9px] tracking-wider flex items-center gap-1.5">
                          <Layers className="w-3 h-3 text-[#777]" /> Program
                        </span>
                        <span className="col-span-2 text-black font-semibold">
                          {selectedProject.program}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 px-4 py-2.5 bg-[#faf9f6]">
                        <span className="text-[#888] uppercase text-[9px] tracking-wider flex items-center gap-1.5">
                          <Tag className="w-3 h-3 text-[#777]" /> Status
                        </span>
                        <span className="col-span-2 capitalize font-semibold text-emerald-800">
                          {selectedProject.status}
                        </span>
                      </div>
                    </div>

                    {/* Architectural Description */}
                    <div>
                      <div className="text-[9px] tracking-[0.25em] text-[#888] uppercase font-mono mb-2 font-semibold">
                        Architectural Concept & Narrative
                      </div>
                      <p className="font-playfair text-[15px] leading-relaxed text-[#333] border-l-2 border-black pl-4 py-1">
                        {selectedProject.desc}
                      </p>
                    </div>


                  </div>


                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen flex items-center justify-center text-[10px] tracking-widest text-[#888] uppercase font-mono animate-pulse bg-[#faf9f6]">
          Loading Noyyal Architectural Catalogue...
        </div>
      }
    >
      <ProjectsContent />
    </Suspense>
  );
}

