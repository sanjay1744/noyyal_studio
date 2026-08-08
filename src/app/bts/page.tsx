"use client";

import { motion } from "framer-motion";
import Footer from "@/components/ui/Footer";

export default function BTSPage() {
  return (
    <div className="w-full min-h-[calc(100vh-56px)] flex flex-col justify-between bg-[#080808] text-white relative overflow-hidden select-none">
      
      {/* ── PITCH BLACK ARCHITECTURAL GRID OVERLAY ── */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10 z-0"
        style={{
          backgroundImage: `
            radial-gradient(rgba(255, 255, 255, 0.15) 1.2px, transparent 1.2px),
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px, 24px 24px, 24px 24px",
        }}
      />

      {/* ── BOTTOM CONTACT INFO (Left) ── */}
      <div className="absolute bottom-16 left-6 md:bottom-20 md:left-12 z-40 flex flex-col gap-1 font-mono text-[10px] tracking-widest uppercase text-neutral-600">
        <a 
          href="mailto:admin@noyyalstudios.com" 
          className="hover:text-white transition-colors no-underline"
        >
          admin@noyyalstudios.com
        </a>
        <a 
          href="tel:+919786855130" 
          className="hover:text-white transition-colors no-underline"
        >
          +91 9786855130
        </a>
      </div>

      {/* ── UNLIT / DIM BASE CONTENT LAYER (Barely visible faint outline in pitch dark room) ── */}
      <div className="w-full min-h-[calc(100vh-56px)] flex flex-col justify-between z-10 pointer-events-none absolute inset-0 opacity-15">
        <main className="flex-grow flex flex-col items-center justify-end text-center px-6 pb-4 md:pb-8 pt-36 md:pt-44">
          <div className="max-w-4xl mb-3 md:mb-5">
            <h1 className="font-syne text-[20px] sm:text-[28px] md:text-[36px] font-bold text-neutral-500 tracking-tight leading-[1.35] m-0">
              Cooking in progress - <br />
              <span className="font-normal italic font-playfair text-neutral-600">
                it will be ready to serve you soon :)
              </span>
            </h1>
          </div>
        </main>

        <div className="w-full flex justify-center mt-auto pb-4 md:pb-8">
          <div className="w-full max-w-4xl flex justify-center items-end px-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/people.png"
              alt="Noyyal Studios Team Illustration"
              className="h-[22vh] md:h-[30vh] max-w-[90vw] md:max-w-3xl object-contain object-bottom filter invert brightness-50 opacity-40"
            />
          </div>
        </div>
      </div>

      {/* ── SWINGING LAMP FIXTURE & CONICAL SPOTLIGHT BEAM (Z-20) ── */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden flex flex-col items-center">
        {/* Parent Pendulum Container (Pivot at 50% 15vh) */}
        <motion.div
          animate={{
            rotate: [-36, 36, -36],
          }}
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "50% 15vh" }}
          className="w-full h-full origin-top flex flex-col items-center relative"
        >
          {/* Swinging Lamp Fixture */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/light.svg"
            alt="Dangling Light Fixture"
            className="h-[15vh] md:h-[18vh] w-auto filter invert brightness-200 drop-shadow-[0_0_20px_rgba(255,230,150,1)] opacity-100 absolute top-0 z-40 pointer-events-none"
          />

          {/* Soft Glow Bulb Tip */}
          <div 
            className="w-20 h-20 rounded-full bg-amber-200/50 blur-md absolute top-[13vh] md:top-[16vh] z-30 pointer-events-none"
          />

          {/* Conical Light Beam Spotlight Mask (Swaying Cone) */}
          <div 
            className="w-full h-full absolute top-0 left-0 z-20 pointer-events-none overflow-hidden"
            style={{
              clipPath: "polygon(50% 15vh, 20% 100%, 80% 100%)",
              background: "radial-gradient(ellipse at 50% 15vh, rgba(255,245,210,0.3) 0%, rgba(255,225,140,0.15) 50%, rgba(255,210,100,0.04) 85%)",
            }}
          >
            {/* Stationary Content inside Light Cone (Counter-Rotated around EXACT SAME PIVOT 50% 15vh) */}
            <motion.div
              animate={{
                rotate: [36, -36, 36],
              }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ transformOrigin: "50% 15vh" }}
              className="w-full h-full absolute top-0 left-0 flex flex-col justify-between"
            >
              {/* Fully Illuminated Headline Text */}
              <main className="flex-grow flex flex-col items-center justify-end text-center px-6 pb-4 md:pb-8 pt-36 md:pt-44">
                <div className="max-w-4xl mb-3 md:mb-5">
                  <h1 className="font-syne text-[20px] sm:text-[28px] md:text-[36px] font-bold text-white tracking-tight leading-[1.35] m-0 drop-shadow-[0_0_20px_rgba(255,255,255,1)]">
                    Cooking in progress - <br />
                    <span className="font-normal italic font-playfair text-amber-100">
                      it will be ready to serve you soon :)
                    </span>
                  </h1>
                </div>
              </main>

              {/* Fully Illuminated Team Illustration */}
              <div className="w-full flex justify-center mt-auto pb-4 md:pb-8">
                <div className="w-full max-w-4xl flex justify-center items-end px-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/people.png"
                    alt="Noyyal Studios Team Illustration"
                    className="h-[22vh] md:h-[30vh] max-w-[90vw] md:max-w-3xl object-contain object-bottom filter invert brightness-150 contrast-150 opacity-100 drop-shadow-[0_0_30px_rgba(255,230,150,0.6)]"
                  />
                </div>
              </div>
            </motion.div>
          </div>

        </motion.div>
      </div>

      {/* ── FOOTER ── */}
      <Footer leftText="© 2026 Noyyal Studios." rightText="Cooking in Progress" />
    </div>
  );
}
