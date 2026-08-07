"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    const isIntroComplete =
      typeof window !== "undefined" &&
      (window as unknown as Record<string, unknown>).introComplete;
    if (!isIntroComplete) {
      gsap.set("#navbar-logo-svg", { opacity: 0 });
      gsap.set(".nav-fade-in", { opacity: 0 });
    }
  }, []);

  // Close mobile menu on route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const navItems = [
    { label: "Projects", href: "/projects" },
    { label: "About Us", href: "/about-us" },
    { label: "Research", href: "/research" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-[500] font-mono select-none">
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
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={clsx(
                    "text-[10px] tracking-[0.22em] uppercase transition-colors duration-200 no-underline py-4 block",
                    isActive ? "text-black font-semibold" : "text-gray hover:text-black"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* MOBILE MENU TOGGLE */}
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
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block py-2 text-black border-b border-light-gray/50 last:border-b-0"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
