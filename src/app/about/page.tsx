"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Footer from "@/components/ui/Footer";
import ArchitecturalAnatomyDiagram from "@/components/ui/ArchitecturalAnatomyDiagram";
import { ArrowUpRight, Compass, Layers, Sparkles, MapPin, Feather, Globe } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen flex flex-col bg-transparent text-[#111111] font-sans relative overflow-hidden select-none">

      {/* Grid vertical reference guide lines */}
      <div className="absolute inset-0 pointer-events-none z-0 hidden lg:grid grid-cols-12 max-w-[1440px] mx-auto px-8 border-x border-[#222222]/10">
        {Array.from({ length: 11 }).map((_, i) => (
          <div key={i} className="border-r border-[#222222]/10 h-full" />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-[1440px] mx-auto flex-grow flex flex-col px-4 sm:px-8 py-6">
        {/* ── EDITORIAL HEADER STRIP ── */}
        <div className="w-full border-b border-[#111111] pb-4 mb-6 flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] uppercase text-[#111111]">
          <div className="flex items-center gap-4">
            <span className="font-bold tracking-widest bg-[#111111] text-white px-2.5 py-1">
              NOYYAL STUDIOS
            </span>
            <span className="text-gray hidden sm:inline">SWISS EDITORIAL ARCHITECTURE</span>
          </div>

          <div className="flex items-center gap-6 text-gray">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-black" />
              CHENNAI & COIMBATORE
            </span>
            <span>•</span>
            <span className="text-black font-bold">11.0168° N, 76.9558° E</span>
          </div>
        </div>

        {/* ── SECTION 1: HERO STATEMENT & FEATURED ARCHITECTURE IMAGE ── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 border border-[#111111] bg-white mb-8">
          {/* Hero Statement Column */}
          <div className="lg:col-span-7 p-8 lg:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#111111] relative">
            <div>
              <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-gray mb-8 flex items-center gap-2">
                <span className="w-3 h-[1px] bg-[#111111]" />
                Hero Statement
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light leading-[1.35] text-[#111111] tracking-tight mb-8">
                &ldquo;A trans-disciplinary firm, weekdays dawn into research, shuffled to dusk and night dreamers, and weekends searching ourselves amongst the nature.&rdquo;
              </h1>
            </div>

            <div className="pt-8 border-t border-[#111111]/20 flex flex-wrap items-center justify-between font-mono text-[10px] text-gray uppercase tracking-widest gap-4">
              <span>EXPLORATION OF LAND & LIGHT</span>
              <span>EST. 2018</span>
            </div>

            {/* Corner Drafting Symbol */}
            <span className="absolute -bottom-2.5 -right-2.5 text-[#111111] text-sm font-mono select-none hidden lg:block">
              +
            </span>
          </div>

          {/* Featured Visual Banner */}
          <div className="lg:col-span-5 relative overflow-hidden min-h-[320px] bg-[#111111] group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
              alt="Noyyal Architecture Hero"
              className="w-full h-full object-cover grayscale opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white font-mono text-[9.5px] uppercase tracking-widest bg-black/60 backdrop-blur-md p-3 border border-white/10">
              <span>HOUSE ON THE SLOPE</span>
              <span className="text-gray-300">COIMBATORE</span>
            </div>
          </div>
        </section>

        {/* ── SECTION 2: ABOUT US STORY & INTERACTIVE ARCHITECTURAL ANATOMY ── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 border border-[#111111] bg-white mb-8 items-stretch">
          {/* Left Column: About Us Narrative */}
          <div className="lg:col-span-6 p-8 lg:p-14 border-b lg:border-b-0 lg:border-r border-[#111111] flex flex-col justify-between relative bg-white">
            <div>
              <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-gray mb-8 flex items-center justify-between border-b border-[#111111]/15 pb-4">
                <span>01 // About Us</span>
                <span>Philosophy & River Flow</span>
              </div>

              <div className="space-y-8 text-[#111111]">
                {/* Paragraph 1 */}
                <div className="space-y-2">
                  <div className="font-mono text-[9px] text-gray uppercase tracking-widest">
                    [ORIGIN]
                  </div>
                  <p className="text-base sm:text-lg leading-relaxed font-normal text-[#111111]">
                    Rooted in history, inspired by the future, Noyyal dreams of a world where design flows as naturally as a river, shaping spaces that everyone can enjoy, everywhere.
                  </p>
                </div>

                {/* Paragraph 2 */}
                <div className="space-y-2 pt-2 border-t border-[#111111]/10">
                  <div className="font-mono text-[9px] text-gray uppercase tracking-widest">
                    [MISSION]
                  </div>
                  <p className="text-base sm:text-lg leading-relaxed font-normal text-mid">
                    We&apos;re on a cheeky but serious mission to make the world better—powered by teamwork, fueled by creativity, seasoned with patience, and sprinkled with joyful surprises that keep things exciting.
                  </p>
                </div>

                {/* Paragraph 3 */}
                <div className="space-y-2 pt-2 border-t border-[#111111]/10">
                  <div className="font-mono text-[9px] text-gray uppercase tracking-widest">
                    [THE NOYYAL FLOW]
                  </div>
                  <p className="text-base sm:text-lg leading-relaxed font-normal text-[#111111]">
                    We design like the Noyyal flows—mostly calm, occasionally chaotic, always adapting. We don&apos;t fight the terrain; we bend with it. Every project is a conversation: with land, with light, and with stubborn walls.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-[#111111]/20 font-mono text-[10px] text-gray uppercase tracking-widest flex items-center justify-between">
              <span>NOYYAL RIVER TRIBUTARY INSPIRATION</span>
              <span>SOUTH INDIA</span>
            </div>

            {/* Corner Drafting Symbol */}
            <span className="absolute -top-2.5 -right-2.5 text-[#111111] text-sm font-mono select-none hidden lg:block">
              +
            </span>
          </div>

          {/* Right Column: Architectural Anatomy Interactive Diagram */}
          <div className="lg:col-span-6 p-8 lg:p-12 bg-[#FAFAFA] flex flex-col justify-center">
            <ArchitecturalAnatomyDiagram />
          </div>
        </section>

        {/* ── SECTION 3: WHO WE ARE & EDITORIAL PILLARS ── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 border border-[#111111] bg-white mb-8">
          {/* Section Header Column */}
          <div className="lg:col-span-4 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-[#111111] bg-[#FAFAFA] flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-gray mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#111111]" />
                02 // Identity
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-black mb-4">
                Who We Are
              </h2>
              <p className="font-mono text-xs text-gray leading-relaxed">
                Architecture as an ongoing inquiry into human experience, climate, and materials.
              </p>
            </div>

            <div className="mt-8 font-mono text-[10px] text-gray uppercase tracking-widest space-y-1">
              <div>PRACTICE TYPE: RESIDENTIAL & RESEARCH</div>
              <div>LOCATION: CHENNAI, TAMIL NADU</div>
            </div>
          </div>

          {/* Narrative & Call to Action Column */}
          <div className="lg:col-span-8 p-8 lg:p-14 flex flex-col justify-between bg-white">
            <div className="space-y-8 max-w-3xl">
              <p className="text-xl sm:text-2xl font-light leading-relaxed text-[#111111] tracking-tight">
                We trace different principles and constantly shift between speculation and realism, diving into both tangible and intangible ideas. We believe architecture is an exploration—of people, spaces, nature, and possibilities.
              </p>

              {/* Three Core Editorial Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 font-mono text-xs">
                <div className="p-4 border border-[#111111]/20 bg-[#FAFAFA]">
                  <div className="font-bold text-black mb-1">01. Speculation</div>
                  <div className="text-gray text-[11px] leading-relaxed">Diving into unbuilt conceptual forms and spatial futures.</div>
                </div>
                <div className="p-4 border border-[#111111]/20 bg-[#FAFAFA]">
                  <div className="font-bold text-black mb-1">02. Realism</div>
                  <div className="text-gray text-[11px] leading-relaxed">Honest granite, brick, and tactile timber construction.</div>
                </div>
                <div className="p-4 border border-[#111111]/20 bg-[#FAFAFA]">
                  <div className="font-bold text-black mb-1">03. People & Space</div>
                  <div className="text-gray text-[11px] leading-relaxed">Homes shaped by sun, wind, memory, and terrain.</div>
                </div>
              </div>

              {/* Interactive CTA Link Button */}
              <div className="pt-4 flex flex-wrap items-center gap-6">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-4 px-8 py-4 bg-[#111111] text-white text-xs font-mono uppercase tracking-[0.25em] hover:bg-[#333333] transition-all duration-300 shadow-md group no-underline"
                >
                  <span>Come along and interact with us</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>
                <Link
                  href="/projects"
                  className="font-mono text-xs uppercase tracking-widest text-black font-semibold hover:underline no-underline"
                >
                  Explore Built Works →
                </Link>
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-[#111111]/20 flex flex-wrap items-center justify-between font-mono text-[10px] text-gray uppercase tracking-widest gap-4">
              <span>SWISS EDITORIAL DESIGN SYSTEM</span>
              <span>NOYYAL STUDIOS © 2026</span>
            </div>
          </div>
        </section>

        {/* ── SWISS EDITORIAL MATRIX FOOTER TICKER ── */}
        <div className="w-full bg-[#111111] text-white p-4 font-mono text-[10px] uppercase tracking-[0.25em] flex items-center justify-between">
          <div className="flex items-center gap-8 overflow-hidden whitespace-nowrap">
            <span className="font-bold">NOYYAL STUDIOS</span>
            <span>•</span>
            <span>RESIDENTIAL ARCHITECTURE & RESEARCH</span>
            <span>•</span>
            <span>ROOTED IN HISTORY</span>
            <span>•</span>
            <span>INSPIRED BY THE FUTURE</span>
            <span>•</span>
            <span>CHENNAI & COIMBATORE</span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
