"use client";

interface FooterProps {
  leftText?: string;
  rightText?: string;
}

export default function Footer({
  leftText = "© 2026 Noyyal Studios. All rights reserved.",
  rightText = "Chennai, Tamil Nadu — India",
}: FooterProps) {
  return (
    <footer className="w-full py-7 px-12 border-t border-light-gray flex items-center justify-between bg-white text-gray text-[9px] tracking-[0.15em] uppercase mt-auto z-10">
      <div>{leftText}</div>
      <div>{rightText}</div>
    </footer>
  );
}
