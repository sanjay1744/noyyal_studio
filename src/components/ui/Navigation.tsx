"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

export default function Navigation() {
  const pathname = usePathname();

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
        <svg viewBox="0 0 100 100" className="w-8 h-8 select-none pointer-events-none">
          <rect x="3" y="3" width="94" height="94" fill="none" stroke="#0c0c0c" strokeWidth="3"/>
          <line x1="3" y1="97" x2="97" y2="3" stroke="#0c0c0c" strokeWidth="3"/>
          <path d="M10,75 C20,55 28,40 38,52 C48,64 52,72 62,58 C72,44 82,20 94,10" fill="none" stroke="#0c0c0c" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M3,85 C14,65 22,48 33,62 C44,76 48,84 58,68 C68,52 78,28 97,15" fill="none" stroke="#0c0c0c" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span className="font-syne text-[13px] font-bold tracking-[0.18em] uppercase">Noyyal Studios</span>
      </Link>

      <ul className="flex gap-9 list-none m-0 p-0">
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

      <div className="text-[9px] tracking-[0.2em] text-gray uppercase hidden sm:block">
        Chennai, India
      </div>
    </nav>
  );
}
