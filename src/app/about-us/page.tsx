import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { Courier_Prime } from "next/font/google";
import LiveClock from "@/components/ui/LiveClock";

const aboutMono = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-about-mono",
  display: "swap",
});

/* ───────────────────────── copy ───────────────────────── */
const storyA =
  "Rooted in history, inspired by the future, Noyyal dreams of a world where design flows as naturally as a river shaping spaces that everyone can enjoy, everywhere.";
const storyB =
  "We’re on a cheeky but serious mission to make the world better-powered by teamwork, fueled by creativity, seasoned with patience, and sprinkled with joyful surprises that keep things exciting.";
const storyC =
  "We design like the Noyyal flows – mostly calm, occasionally chaotic, always adapting. We don’t fight the terrain; we bind with it. Every project is a conversation: with land, with light, with stubborn walls.";
const firm =
  "A trans-disciplinary firm, weekdays dawn into research, shuffled to dusk and night dreamers, and weekends searching ourselves amongst the nature.";
const tracks =
  "We track out different principles and switching between the speculative and realism and diving to explore new tangible and intangible spheres. Come along and interact with us.";
const dinoBio =
  "A trail-hiking, risk-taking dinosaur, living under the radar, passionate about architectural philosophy, culture, and great food. Taking baby steps through research and design, one sketch at a time. Living below the radar, where silence sharpens observation. Always in incognito mode—letting the work leave the loudest tracks.";
const moonBio =
  "I bloom under moonlight and wander through daylight dreams. A moonwalker of thoughts, chasing questions more than answers. The sea is my language, and every journey a new chapter. Curiosity is my compass; edutainment is my playground. Like the waves, my research never stops—it simply finds another shore.";

/* ─────────────── design-frame helpers ───────────────
   The desktop layout is drawn on a fixed design canvas (490 units wide) and every
   element is placed in % of it, with text sized in cqw (% of the canvas width), so
   the whole composition scales with the screen and keeps its proportions. */
const CANVAS_W = 490;
const px = (n: number) => `${((n / CANVAS_W) * 100).toFixed(3)}%`; // widths / x offsets
const fs = (n: number) => `${((n / CANVAS_W) * 100).toFixed(3)}cqw`; // font sizes

type Frame = { x0: number; y0: number; h: number };
const at = (f: Frame, x: number, y: number): CSSProperties => ({
  left: px(x - f.x0),
  top: `${(((y - f.y0) / f.h) * 100).toFixed(3)}%`,
});
const vh = (f: Frame, n: number) => `${((n / f.h) * 100).toFixed(3)}%`;

const ABOUT: Frame = { x0: 100, y0: 15, h: 310 };
const TEAM: Frame = { x0: 100, y0: 365, h: 155 };
const CONTACT: Frame = { x0: 100, y0: 540, h: 150 };

function Abs({ style, className = "", children }: { style: CSSProperties; className?: string; children?: ReactNode }) {
  return (
    <div className={`absolute ${className}`} style={style}>
      {children}
    </div>
  );
}

function Ribbon({ className = "", style }: { className?: string; style?: CSSProperties }) {
  // /n3.png is the two logo curves cropped by a square frame; the base and the end cap are the frame
  // edges the curves run into, so they're drawn here to close the ribbon.
  return (
    <div className={`relative ${className}`} style={style} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/n3.png" alt="" className="absolute inset-0 h-full w-full object-fill mix-blend-multiply" />
      <i className="absolute bottom-0 left-[0.9%] h-[1.05%] w-[12.4%] bg-black" />
      <i className="absolute right-0 top-0 h-[22.4%] w-[1.05%] bg-black" />
    </div>
  );
}

function LogoMark({ className = "" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/n3.png" alt="Noyyal Studios" className={`border border-black/30 object-contain ${className}`} />
  );
}

const frameBox = "border border-dashed border-black/50 p-5 sm:p-8 lg:p-10";
const frame = "relative w-full [container-type:inline-size]";

export default function AboutUsPage() {
  return (
    <main className={`${aboutMono.variable} about-mono mx-auto w-full max-w-[1180px] space-y-10 px-5 py-12 text-black sm:px-8 md:py-16`}>
      {/* ═══════════════ ABOUT — desktop ═══════════════ */}
      <section className={`${frameBox} hidden lg:block`}>
        <div className={frame} style={{ aspectRatio: `${CANVAS_W} / ${ABOUT.h}` }}>
          {/* circle */}
          <Abs style={{ ...at(ABOUT, 163, 66), width: px(62), aspectRatio: "1" }}>
            <div className="relative h-full w-full rounded-full border-black" style={{ borderWidth: "0.32cqw" }}>
              <i className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" style={{ width: "1.1cqw", height: "1.1cqw" }} />
              <i className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rounded-full bg-black" style={{ width: "1.1cqw", height: "1.1cqw" }} />
            </div>
          </Abs>

          {/* story */}
          <Abs style={{ ...at(ABOUT, 103, 140), width: px(150), fontSize: fs(6.3), lineHeight: 1.55 }} className="space-y-[0.9cqw] text-justify">
            <p>{storyA}</p>
            <p>{storyB}</p>
            <p>{storyC}</p>
          </Abs>

          {/* guides */}
          <Abs style={{ ...at(ABOUT, 253, 18), height: vh(ABOUT, 307) }} className="border-l border-dashed border-black" />
          <Abs style={{ ...at(ABOUT, 527, 18), height: vh(ABOUT, 307) }} className="border-l border-dashed border-black" />
          <Abs style={{ ...at(ABOUT, 150, 135), width: px(377) }} className="border-t border-dashed border-black" />
          <Abs style={{ ...at(ABOUT, 283, 250), width: px(244) }} className="border-t border-dashed border-black" />

          <Abs style={{ ...at(ABOUT, 257, 78), fontSize: fs(5.6), letterSpacing: "0.15em" }} className="[writing-mode:vertical-rl]">
            ABOUT
          </Abs>

          {/* right column copy */}
          <Abs style={{ ...at(ABOUT, 360, 57), width: px(147), fontSize: fs(6.3), lineHeight: 1.6 }} className="text-justify">
            {firm}
          </Abs>
          <Abs style={{ ...at(ABOUT, 258, 268), width: px(262), fontSize: fs(6.3), lineHeight: 1.6 }} className="text-justify">
            {tracks}
          </Abs>

          {/* ribbon, clock, caption */}
          <Ribbon className="absolute" style={{ ...at(ABOUT, 356, 55), width: px(229), height: vh(ABOUT, 193) }} />
          <Abs style={{ ...at(ABOUT, 540, 234), fontSize: fs(5.6) }}>
            <LiveClock />
          </Abs>
          <Abs style={{ ...at(ABOUT, 470, 253), width: px(72), fontSize: fs(6), textAlign: "right" }} className="font-bold">
            Who we are
          </Abs>
        </div>
      </section>

      {/* ═══════════════ ABOUT — mobile / tablet ═══════════════ */}
      <section className={`${frameBox} lg:hidden`}>
        <div className="mx-auto mb-8 h-24 w-24 rounded-full border-[3px] border-black relative">
          <i className="absolute left-1/2 top-[-6px] h-3 w-3 -translate-x-1/2 rounded-full bg-black" />
          <i className="absolute bottom-[-6px] left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-black" />
        </div>
        <div className="space-y-4 text-[13px] leading-[1.8] text-justify">
          <p>{storyA}</p>
          <p>{storyB}</p>
          <p>{storyC}</p>
        </div>
        <div className="my-8 border-t border-dashed border-black" />
        <p className="text-[13px] leading-[1.8] text-justify">{firm}</p>
        <Ribbon className="mx-auto my-8 aspect-square w-[70%] max-w-[300px]" />
        <p className="text-right text-[12px] font-bold">
          <LiveClock /> &nbsp; Who we are
        </p>
        <div className="my-6 border-t border-dashed border-black" />
        <p className="text-[13px] leading-[1.8] text-justify">{tracks}</p>
      </section>

      {/* ═══════════════ TEAM — desktop ═══════════════ */}
      <section className={`${frameBox} hidden lg:block`}>
        <div className={frame} style={{ aspectRatio: `${CANVAS_W} / ${TEAM.h}` }}>
          {/* framed box */}
          <Abs
            style={{ ...at(TEAM, 177, 372), width: px(343), height: vh(TEAM, 135) }}
            className="border-black"
          >
            <div className="h-full w-full border-black" style={{ borderWidth: "0.4cqw", borderStyle: "solid" }} />
          </Abs>

          {/* titles */}
          <Abs style={{ ...at(TEAM, 137, 378), fontSize: fs(5.6), lineHeight: 1.35 }} className="font-bold">
            Dinosour
            <br />
            Founder
          </Abs>
          <Abs style={{ ...at(TEAM, 520, 392), width: px(46), fontSize: fs(5.6), lineHeight: 1.35, textAlign: "right" }} className="font-bold">
            Moon
            <br />
            Co-Founder
          </Abs>

          {/* bios */}
          <Abs style={{ ...at(TEAM, 207, 378), width: px(86), fontSize: fs(4.7), lineHeight: 1.65 }} className="text-left">
            {dinoBio}
          </Abs>
          <Abs style={{ ...at(TEAM, 398, 382), width: px(100), fontSize: fs(5.5), lineHeight: 1.6, textAlign: "right" }}>
            {moonBio}
          </Abs>

          {/* figures straddling the box edges */}
          <Abs style={{ ...at(TEAM, 128, 364), width: px(95), height: vh(TEAM, 143) }} className="pointer-events-none">
            <Image src="/images/about-founder-dinosour.png" alt="Dinosour, Noyyal Studios founder" fill sizes="200px" className="object-contain mix-blend-multiply" />
          </Abs>
          <Abs style={{ ...at(TEAM, 480, 364), width: px(95), height: vh(TEAM, 143) }} className="pointer-events-none">
            <Image src="/images/about-founder-moon.png" alt="Moon, Noyyal Studios co-founder" fill sizes="200px" className="object-contain mix-blend-multiply" />
          </Abs>

          {/* tagline */}
          <Abs style={{ ...at(TEAM, 180, 510), fontSize: fs(5.6), letterSpacing: "0.04em" }} className="text-[#ed1c2e]">
            Forever in incognito, forever curious.
          </Abs>
        </div>
      </section>

      {/* ═══════════════ TEAM — mobile / tablet ═══════════════ */}
      <section className={`${frameBox} lg:hidden`}>
        <div className="flex justify-center gap-4">
          <div className="relative h-52 w-36">
            <Image src="/images/about-founder-dinosour.png" alt="Dinosour, Noyyal Studios founder" fill sizes="150px" className="object-contain mix-blend-multiply" />
          </div>
          <div className="relative h-52 w-36">
            <Image src="/images/about-founder-moon.png" alt="Moon, Noyyal Studios co-founder" fill sizes="150px" className="object-contain mix-blend-multiply" />
          </div>
        </div>
        <div className="mt-6 space-y-6">
          <div>
            <h2 className="text-[14px] font-bold">Dinosour Founder</h2>
            <p className="mt-2 text-[12.5px] leading-[1.75]">{dinoBio}</p>
          </div>
          <div className="md:text-right">
            <h2 className="text-[14px] font-bold">Moon Co-Founder</h2>
            <p className="mt-2 text-[12.5px] leading-[1.75]">{moonBio}</p>
          </div>
          <p className="text-[11px] tracking-[0.08em] text-[#ed1c2e]">Forever in incognito, forever curious.</p>
        </div>
      </section>

      {/* ═══════════════ CONTACT ═══════════════ */}
      <section className={frameBox}>
        {/* desktop: placed on the same design canvas */}
        <div className={`${frame} hidden lg:block`} style={{ aspectRatio: `${CANVAS_W} / ${CONTACT.h}` }}>
          <Abs style={{ ...at(CONTACT, 103, 565), width: px(28) }}>
            <LogoMark className="h-auto w-full" />
          </Abs>
          <Abs style={{ ...at(CONTACT, 135, 590), fontSize: fs(5.8), letterSpacing: "0.1em" }}>CONTACT</Abs>
          <Abs style={{ ...at(CONTACT, 129, 618), fontSize: fs(6.2), letterSpacing: "0.08em" }} className="font-bold">
            LET&apos;S TALK-CONNECT WITH US!
          </Abs>
          {[
            { y: 641, k: "_email", v: "for enquiries and careers" },
            { y: 658, k: "_address", v: "Erode, India" },
            { y: 675, k: "_phone", v: "+91 9786855130" },
          ].map((r) => (
            <div key={r.k}>
              <Abs style={{ ...at(CONTACT, 129, r.y), fontSize: fs(5.8) }}>{r.k}</Abs>
              <Abs style={{ ...at(CONTACT, 160, r.y), fontSize: fs(5.8) }}>{r.v}</Abs>
            </div>
          ))}
          <Abs style={{ ...at(CONTACT, 280, 641), fontSize: fs(5.8) }}>
            <a href="mailto:admin@noyyalstudios.com" className="hover:underline">
              admin@noyyalstudios.com
            </a>
          </Abs>
        </div>

        {/* mobile / tablet */}
        <div className="lg:hidden">
          <div className="flex items-center gap-3">
            <LogoMark className="h-9 w-9" />
            <p className="text-[12px] tracking-[0.14em]">CONTACT</p>
          </div>
          <h2 className="mt-8 text-[14px] font-bold tracking-[0.08em]">LET&apos;S TALK-CONNECT WITH US!</h2>
          <dl className="mt-6 grid grid-cols-[84px_1fr] gap-y-3 text-[13px]">
            <dt>_email</dt>
            <dd>
              for enquiries and careers
              <br />
              <a href="mailto:admin@noyyalstudios.com" className="hover:underline">
                admin@noyyalstudios.com
              </a>
            </dd>
            <dt>_address</dt>
            <dd>Erode, India</dd>
            <dt>_phone</dt>
            <dd>
              <a href="tel:+919786855130" className="hover:underline">
                +91 9786855130
              </a>
            </dd>
          </dl>
        </div>
      </section>
    </main>
  );
}
