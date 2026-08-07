"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowUpRight, Menu, X } from "lucide-react";

// Sub-item definition structure for ZHA-style mega dropdown
interface DropdownSubItem {
  title: string;
  desc: string;
  href: string;
  image: string;
  caption: string;
}

interface DropdownCategory {
  key: "about" | "projects" | "research";
  label: string;
  href: string;
  items: DropdownSubItem[];
}

const DROPDOWN_DATA: Record<"about" | "projects" | "research", DropdownCategory> = {
  about: {
    key: "about",
    label: "About Us",
    href: "/about-us",
    items: [
      {
        title: "Our Story",
        desc: "Rooted in history, inspired by the future — design flowing as naturally as a river.",
        href: "/about-us",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        caption: "PHOTOGRAPH BY IALIRIAN GHINITOIU • NOYYAL ARCHITECTURE",
      },
      {
        title: "Who We Are",
        desc: "A trans-disciplinary firm shifting between speculation and realism in South India.",
        href: "/about-us#who-we-are",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
        caption: "PHOTOGRAPH BY SANJAY NOYYAL • CHENNAI ATELIER",
      },
      {
        title: "Design Philosophy",
        desc: "Calm, occasionally chaotic, always adapting. Every project is a conversation with land and light.",
        href: "/about-us#philosophy",
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
        caption: "DRAWING BY NOYYAL RESEARCH LAB • FORM STUDY",
      },
      {
        title: "Studio & Practice",
        desc: "Residential architecture and parallel spatial research programs.",
        href: "/about-us",
        image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
        caption: "PHOTOGRAPH BY ARCHITECTURAL PRESS • ATELIER",
      },
    ],
  },
  projects: {
    key: "projects",
    label: "Projects",
    href: "/projects",
    items: [
      {
        title: "Residences",
        desc: "Houses on laterite slopes, river bend sanctuaries, and hill country retreats.",
        href: "/projects?category=Residences",
        image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
        caption: "PROJECT NS-001 • HOUSE ON THE SLOPE",
      },
      {
        title: "Commercial",
        desc: "Craft & cultural centers, vault lightwells, and basalt guild headquarters.",
        href: "/projects?category=Commercial",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
        caption: "PROJECT NS-004 • NOYYAL CULTURAL CENTER",
      },
      {
        title: "Interior Architecture",
        desc: "Monolithic micro-cement penthouses and reclaimed Malabar teak ateliers.",
        href: "/projects?category=Interior",
        image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
        caption: "PROJECT NS-006 • MICRO-CEMENT PENTHOUSE",
      },
      {
        title: "Unbuilt & Speculative",
        desc: "Terra cotta monolith studies and floating timber rainwater canopies.",
        href: "/projects?category=Unbuilt",
        image: "https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=1200&q=80",
        caption: "PROJECT NS-008 • TERRA COTTA PAVILION",
      },
    ],
  },
  research: {
    key: "research",
    label: "Research",
    href: "/research",
    items: [
      {
        title: "Vernacular Cooling",
        desc: "Passive cooling strategies in Tamil Nadu's traditional courtyard domestic space.",
        href: "/research",
        image: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80",
        caption: "RESEARCH RS-01 • DRAVIDIAN DOMESTIC COOLING",
      },
      {
        title: "Threshold as Architectural Event",
        desc: "Phenomenological entry sequences from kolam-marked threshold to verandah.",
        href: "/research",
        image: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=1200&q=80",
        caption: "RESEARCH RS-02 • ENTRY SEQUENCES & RITUAL",
      },
      {
        title: "Light, Shadow & Brick",
        desc: "Material study tracing how exposed brick mediates climate in South India.",
        href: "/research",
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
        caption: "RESEARCH RS-03 • BRICK MASONRY & LIGHTWELLS",
      },
      {
        title: "Spatial Autobiography",
        desc: "Mapping how rooms accumulate personal and collective memory over generations.",
        href: "/research",
        image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
        caption: "RESEARCH RS-04 • SPATIAL MEMORY ATELIER",
      },
    ],
  },
};

export default function Navigation() {
  const pathname = usePathname();

  // Hover state management for ZHA Mega Dropdown
  const [activeTab, setActiveTab] = useState<"about" | "projects" | "research" | null>(null);
  const [activeSubIndex, setActiveSubIndex] = useState<number>(0);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  // Timeout ref for buttery smooth mouse enter/leave transition hysteresis
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const isIntroComplete =
      typeof window !== "undefined" &&
      (window as unknown as Record<string, unknown>).introComplete;
    if (!isIntroComplete) {
      gsap.set("#navbar-logo-svg", { opacity: 0 });
      gsap.set(".nav-fade-in", { opacity: 0 });
    }
  }, []);

  // Close dropdown on route changes
  useEffect(() => {
    setActiveTab(null);
    setIsMobileOpen(false);
  }, [pathname]);

  const handleMouseEnter = (key: "about" | "projects" | "research") => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveTab(key);
    setActiveSubIndex(0);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveTab(null);
    }, 180);
  };

  const currentCategory = activeTab ? DROPDOWN_DATA[activeTab] : null;
  const currentSubItem = currentCategory ? currentCategory.items[activeSubIndex] : null;

  return (
    <header
      className="fixed top-0 left-0 w-full z-[500] font-mono select-none"
      onMouseLeave={handleMouseLeave}
    >
      {/* ── TOP NAV BAR ── */}
      <nav className="w-full h-14 bg-white/95 backdrop-blur-md border-b border-light-gray flex items-center justify-between px-6 md:px-10 relative z-20">
        {/* LOGO */}
        <Link href="/" className="nav-logo flex items-center gap-3 text-black no-underline group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            id="navbar-logo-svg"
            src="/n3.png"
            alt="Noyyal Studios Logo"
            className="w-7 h-7 object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <span className="font-syne text-[12px] font-bold tracking-[0.2em] uppercase text-black nav-fade-in">
            Noyyal Studios
          </span>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0 nav-fade-in ml-auto">

          {/* PROJECTS DROPDOWN TRIGGER */}
          <li
            onMouseEnter={() => handleMouseEnter("projects")}
            className="relative"
          >
            <Link
              href="/projects"
              className={clsx(
                "text-[10px] tracking-[0.22em] uppercase transition-colors duration-200 no-underline py-4 flex items-center gap-1.5",
                pathname.startsWith("/projects") || activeTab === "projects"
                  ? "text-black font-semibold"
                  : "text-gray hover:text-black"
              )}
            >
              Projects
              <ChevronDown
                className={clsx(
                  "w-3 h-3 transition-transform duration-300",
                  activeTab === "projects" ? "rotate-180 text-black" : "text-gray"
                )}
              />
            </Link>
          </li>

          {/* ABOUT US DROPDOWN TRIGGER */}
          <li
            onMouseEnter={() => handleMouseEnter("about")}
            className="relative"
          >
            <Link
              href="/about-us"
              className={clsx(
                "text-[10px] tracking-[0.22em] uppercase transition-colors duration-200 no-underline py-4 flex items-center gap-1.5",
                pathname.startsWith("/about") || activeTab === "about"
                  ? "text-black font-semibold"
                  : "text-gray hover:text-black"
              )}
            >
              About Us
              <ChevronDown
                className={clsx(
                  "w-3 h-3 transition-transform duration-300",
                  activeTab === "about" ? "rotate-180 text-black" : "text-gray"
                )}
              />
            </Link>
          </li>

          {/* RESEARCH DROPDOWN TRIGGER */}
          <li
            onMouseEnter={() => handleMouseEnter("research")}
            className="relative"
          >
            <Link
              href="/research"
              className={clsx(
                "text-[10px] tracking-[0.22em] uppercase transition-colors duration-200 no-underline py-4 flex items-center gap-1.5",
                pathname.startsWith("/research") || activeTab === "research"
                  ? "text-black font-semibold"
                  : "text-gray hover:text-black"
              )}
            >
              Research
              <ChevronDown
                className={clsx(
                  "w-3 h-3 transition-transform duration-300",
                  activeTab === "research" ? "rotate-180 text-black" : "text-gray"
                )}
              />
            </Link>
          </li>



          <li>
            <Link
              href="/contact"
              className={clsx(
                "text-[10px] tracking-[0.22em] uppercase transition-colors duration-200 no-underline py-4 block",
                pathname === "/contact" ? "text-black font-semibold" : "text-gray hover:text-black"
              )}
              onMouseEnter={() => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                setActiveTab(null);
              }}
            >
              Contact
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-4">

          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden text-black p-2 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* ── ZHA BUTTERY SMOOTH MEGA DROPDOWN PANEL ── */}
      <AnimatePresence>
        {activeTab && currentCategory && (
          <motion.div
            key="mega-dropdown-panel"
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.16, 1, 0.3, 1], // Smooth custom cubic bezier curve
            }}
            onMouseEnter={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
            }}
            onMouseLeave={handleMouseLeave}
            className="w-full bg-white border-b border-light-gray shadow-xl overflow-hidden hidden md:block"
          >
            <div className="max-w-[1400px] mx-auto p-8 px-10 grid grid-cols-12 gap-8 items-stretch">
              {/* LEFT COLUMN: CATEGORIES / SUB-LINKS LIST */}
              <div className="col-span-5 flex flex-col justify-between pr-6 border-r border-light-gray/60">
                <div>
                  <div className="text-[9px] tracking-[0.3em] uppercase text-gray mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-black rounded-full" />
                    <span>{currentCategory.label} Directory</span>
                  </div>

                  <div className="space-y-1">
                    {currentCategory.items.map((item, idx) => {
                      const isHovered = activeSubIndex === idx;
                      return (
                        <Link
                          key={item.title}
                          href={item.href}
                          onMouseEnter={() => setActiveSubIndex(idx)}
                          className={clsx(
                            "group flex items-start justify-between p-3.5 rounded-sm transition-all duration-200 no-underline",
                            isHovered
                              ? "bg-[#FAFAFA] text-black translate-x-1"
                              : "text-gray hover:text-black"
                          )}
                        >
                          <div className="flex flex-col gap-1 pr-4">
                            <span className="text-[13px] font-semibold uppercase tracking-wider flex items-center gap-2">
                              {item.title}
                            </span>
                            <span className="text-[10.5px] leading-relaxed text-gray group-hover:text-mid line-clamp-2">
                              {item.desc}
                            </span>
                          </div>
                          <ArrowUpRight
                            className={clsx(
                              "w-4 h-4 shrink-0 transition-transform duration-200 mt-0.5",
                              isHovered
                                ? "text-black translate-x-0.5 -translate-y-0.5 opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-6 border-t border-light-gray/50 flex items-center justify-between text-[9px] text-gray uppercase tracking-widest">
                  <span>Noyyal Architectural Collection</span>
                  <Link
                    href={currentCategory.href}
                    className="text-black font-semibold hover:underline no-underline"
                  >
                    View All {currentCategory.label} →
                  </Link>
                </div>
              </div>

              {/* RIGHT COLUMN: DYNAMIC PREVIEW IMAGE & CAPTION OVERLAY */}
              <div className="col-span-7 pl-4 flex flex-col justify-between">
                <div className="relative w-full h-[280px] overflow-hidden bg-black/5 border border-light-gray rounded-sm">
                  <AnimatePresence mode="wait">
                    {currentSubItem && (
                      <motion.div
                        key={currentSubItem.image}
                        initial={{ opacity: 0, scale: 1.03 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="absolute inset-0"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={currentSubItem.image}
                          alt={currentSubItem.title}
                          className="w-full h-full object-cover select-none"
                        />
                        {/* Gradient overlay for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                        {/* Photographer / Artwork Tag */}
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-[9.5px] uppercase tracking-[0.2em] font-mono bg-black/60 backdrop-blur-md px-3 py-2 border border-white/10">
                          <span className="truncate">{currentSubItem.caption}</span>
                          <span className="text-gray-300 font-bold shrink-0 ml-2">
                            0{activeSubIndex + 1} / 0{currentCategory.items.length}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Sub-item description quick info */}
                {currentSubItem && (
                  <div className="mt-3 flex items-center justify-between text-[10px] text-gray uppercase tracking-widest font-mono">
                    <span className="text-black font-bold truncate">
                      {currentSubItem.title}
                    </span>
                    <span>Click link to explore section</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MOBILE ACCORDION MENU OVERLAY ── */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden w-full bg-white border-b border-light-gray overflow-hidden z-40"
          >
            <div className="p-6 space-y-4 font-mono text-[12px] uppercase tracking-wider">
              <Link href="/about-us" className="block py-2 text-black border-b border-light-gray/50">
                About Us
              </Link>
              <Link href="/projects" className="block py-2 text-black border-b border-light-gray/50">
                Projects
              </Link>
              <Link href="/research" className="block py-2 text-black border-b border-light-gray/50">
                Research
              </Link>

              <Link href="/contact" className="block py-2 text-black">
                Contact
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
