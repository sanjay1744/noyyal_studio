"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { gsap } from "gsap";

export default function Navigation() {
  const pathname = usePathname();

  useEffect(() => {
    const isIntroComplete = typeof window !== "undefined" && 
                             (window as unknown as Record<string, unknown>).introComplete;
    if (!isIntroComplete) {
      // Set initial states for elements that will be animated by the centralized GSAP timeline
      gsap.set("#navbar-logo-svg", { opacity: 0 });
      gsap.set(".nav-fade-in", { opacity: 0 });
    }
  }, []);

  const links = [
    { name: "Index", href: "/" },
    { name: "Projects", href: "/projects" },
    { name: "Research", href: "/research" },
    { name: "Studio", href: "/studio" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full h-14 flex items-center justify-between px-8 border-b border-light-gray bg-white z-[500]">
      <Link href="/" className="nav-logo flex items-center gap-3 text-black no-underline">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          id="navbar-logo-svg"
          src="/n3.png"
          alt="Noyyal Studios Logo"
          className="w-8 h-8 object-contain select-none pointer-events-none"
        />
        <span className="font-syne text-[13px] font-bold tracking-[0.18em] uppercase nav-fade-in">
          Noyyal Studios
        </span>
      </Link>

      <ul className="flex gap-9 list-none m-0 p-0 nav-fade-in">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={clsx(
                  "text-[9.5px] tracking-[0.22em] uppercase transition-colors duration-200 no-underline",
                  isActive ? "text-black font-semibold" : "text-gray hover:text-black"
                )}
              >
                {link.name}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="text-[9px] tracking-[0.2em] text-gray uppercase hidden sm:block nav-fade-in">
        Chennai, India
      </div>
    </nav>
  );
}
