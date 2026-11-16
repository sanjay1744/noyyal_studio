import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Courier_Prime } from "next/font/google";
import LiveClock from "@/components/ui/LiveClock";
import Footer from "@/components/ui/Footer";
import { Reveal, RiverLine } from "@/components/about/Reveal";

const aboutMono = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-about-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "About — Noyyal Studios",
  description:
    "A trans-disciplinary architecture and research studio from Erode, India — designing like the Noyyal flows.",
};

/* ───────────────────────── copy ───────────────────────── */
const storyA =
  "Rooted in history, inspired by the future, Noyyal dreams of a world where design flows as naturally as a river shaping spaces that everyone can enjoy, everywhere.";
const storyB =
  "We’re on a cheeky but serious mission to make the world better — powered by teamwork, fueled by creativity, seasoned with patience, and sprinkled with joyful surprises that keep things exciting.";
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

const principles = [
  { n: "01", title: "Mostly calm", body: "Seasoned with patience. We don’t fight the terrain — we bind with it." },
  { n: "02", title: "Occasionally chaotic", body: "Fueled by creativity and sprinkled with joyful surprises that keep things exciting." },
  { n: "03", title: "Always adapting", body: "Every project is a conversation — with land, with light, with stubborn walls." },
];

const rhythm = [
  { time: "Dawn", label: "Research", note: "Weekdays begin in the archive and on site." },
  { time: "Dusk", label: "Shuffle", note: "Ideas get tested, broken and rebuilt." },
  { time: "Night", label: "Dreamers", note: "Speculation, sketches, stubborn questions." },
  { time: "Weekend", label: "Nature", note: "Searching ourselves amongst the landscape." },
];

const founders = [
  { n: "N°01", name: "Dinosour", role: "Founder", img: "/images/about-founder-dinosour.webp", bio: dinoBio },
  { n: "N°02", name: "Moon", role: "Co-Founder", img: "/images/about-founder-moon.webp", bio: moonBio },
];

const marquee = ["Mostly calm", "Occasionally chaotic", "Always adapting", "Forever curious", "Rooted in history", "Inspired by the future"];

/* ───────────────────────── bits ───────────────────────── */
const mono = "about-mono";

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className={`${mono} flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-mid`}>
      <span className="text-[#ed1c2e]">({index})</span>
      <span className="h-px w-8 bg-black/40" />
      <span>{title}</span>
    </div>
  );
}

// Architectural crop marks in the four corners of a box.
function CropMarks({ className = "border-black" }: { className?: string }) {
  const c = `pointer-events-none absolute h-3 w-3 ${className}`;
  return (
    <>
      <i className={`${c} -left-px -top-px border-l border-t`} />
      <i className={`${c} -right-px -top-px border-r border-t`} />
      <i className={`${c} -bottom-px -left-px border-b border-l`} />
      <i className={`${c} -bottom-px -right-px border-b border-r`} />
    </>
  );
}

function Ribbon({ className = "" }: { className?: string }) {
  // /n3.png is the two logo curves cropped by a square frame; the base and end cap close the ribbon.
  return (
    <div className={`relative ${className}`} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/n3.png" alt="" className="absolute inset-0 h-full w-full object-fill mix-blend-multiply" />
      <i className="absolute bottom-0 left-[0.9%] h-[1.05%] w-[12.4%] bg-black" />
      <i className="absolute right-0 top-0 h-[22.4%] w-[1.05%] bg-black" />
    </div>
  );
}

function Orbit({ className = "" }: { className?: string }) {
  return (
    <div className={`about-spin rounded-full border-2 border-black ${className}`} aria-hidden="true">
      <i className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" />
      <i className="absolute bottom-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-[#ed1c2e]" />
    </div>
  );
}

function Section({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-12 ${className}`}>{children}</section>;
}

/* ───────────────────────── page ───────────────────────── */
export default function AboutUsPage() {
  return (
    <div className={`${aboutMono.variable} w-full overflow-hidden text-black`}>
      {/* ═══════════════ HERO ═══════════════ */}
      <Section className="pt-12 md:pt-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col justify-between lg:col-span-7">
            <Reveal>
              <SectionLabel index="00" title="About the studio" />
            </Reveal>

            <h1 className="mt-10 text-[clamp(52px,8.4vw,132px)] font-extrabold leading-[0.88] tracking-[-0.045em]">
              <Reveal delay={0.05}>
                <span className="block">We design</span>
              </Reveal>
              <Reveal delay={0.15}>
                <span className="block">like a river</span>
              </Reveal>
              <Reveal delay={0.25}>
                <span className="block">
                  <span className="font-light italic text-[#ed1c2e]">flows</span>
                  <span className="text-gray">.</span>
                </span>
              </Reveal>
            </h1>

            <Reveal delay={0.35} className="mt-10 max-w-[480px]">
              <p className={`${mono} text-[14px] leading-[1.8] text-mid`}>{firm}</p>
            </Reveal>
          </div>

          <Reveal delay={0.2} className="lg:col-span-5">
            <div className="relative border border-dashed border-black/50 bg-[var(--background)]/70 p-8 backdrop-blur-[1px] sm:p-10">
              <CropMarks />
              <div className={`${mono} mb-6 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-mid`}>
                <span>Fig. 01 — Who we are</span>
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ed1c2e] opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ed1c2e]" />
                  </span>
                  <LiveClock /> IST
                </span>
              </div>
              <div className="relative mx-auto aspect-square w-full max-w-[380px]">
                <Ribbon className="h-full w-full" />
                <Orbit className="absolute -left-4 -top-4 h-20 w-20 sm:h-24 sm:w-24" />
              </div>
              <div className={`${mono} mt-6 flex items-end justify-between text-[10px] uppercase tracking-[0.2em] text-mid`}>
                <span>11.34° N / 77.72° E</span>
                <span className="font-bold text-black">Noyyal Studios</span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* meta strip */}
        <Reveal delay={0.1} className="mt-16 md:mt-24">
          <dl className={`${mono} grid grid-cols-2 border-y border-black md:grid-cols-4`}>
            {[
              { k: "Discipline", v: "Trans-disciplinary" },
              { k: "Base", v: "Erode, India" },
              { k: "Practice", v: "Design + Research" },
              { k: "Mode", v: "Forever incognito" },
            ].map((m, i) => (
              <div
                key={m.k}
                className={`px-4 py-5 sm:px-6 ${i % 2 === 1 ? "border-l" : ""} ${i >= 2 ? "border-t md:border-t-0" : ""} ${i === 2 ? "md:border-l" : ""} border-dashed border-black/40`}
              >
                <dt className="text-[10px] uppercase tracking-[0.22em] text-gray">{m.k}</dt>
                <dd className="mt-2 text-[14px] font-bold">{m.v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Section>

      {/* ═══════════════ MARQUEE ═══════════════ */}
      <div className="mt-20 -rotate-1 bg-black py-4 text-[var(--background)] md:mt-28">
        <div className="about-marquee flex w-max">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
              {marquee.map((w) => (
                <span key={w} className="flex items-center text-[clamp(22px,3vw,40px)] font-extrabold uppercase tracking-[-0.02em]">
                  <span className="px-6">{w}</span>
                  <span className="text-[#ed1c2e]">✳</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════ STORY ═══════════════ */}
      <Section className="pt-24 md:pt-36">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-28">
              <Reveal>
                <SectionLabel index="01" title="Our story" />
              </Reveal>
            </div>
          </div>
          <div className="lg:col-span-9">
            <Reveal>
              <p className="text-[clamp(26px,3.4vw,48px)] font-semibold leading-[1.15] tracking-[-0.025em]">
                <span className="text-gray">Rooted in history, inspired by the future — </span>
                Noyyal dreams of a world where design flows as naturally as a{" "}
                <span className="relative whitespace-nowrap">
                  river
                  <svg viewBox="0 0 100 12" className="absolute -bottom-2 left-0 h-3 w-full text-[#ed1c2e]" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M0 6 Q 12 0, 25 6 T 50 6 T 75 6 T 100 6" fill="none" stroke="currentColor" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                  </svg>
                </span>
                , shaping spaces that everyone can enjoy, everywhere.
              </p>
              <span className="sr-only">{storyA}</span>
            </Reveal>

            <RiverLine className="my-14 h-16 w-full text-black/70 md:my-20 md:h-24" />

            <div className={`${mono} grid grid-cols-1 gap-10 text-[14.5px] leading-[1.85] text-mid md:grid-cols-2 md:gap-14`}>
              <Reveal>
                <p>
                  <span className="float-left mr-3 mt-1 text-[56px] font-bold leading-[0.8] text-black">W</span>
                  {storyB.slice(1)}
                </p>
              </Reveal>
              <Reveal delay={0.12}>
                <p className="border-l border-dashed border-black/50 pl-6 md:pl-8">{storyC}</p>
              </Reveal>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════ PRINCIPLES ═══════════════ */}
      <Section className="pt-24 md:pt-36">
        <Reveal>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <SectionLabel index="02" title="How we flow" />
              <h2 className="mt-6 text-[clamp(34px,4.6vw,68px)] font-extrabold leading-[0.95] tracking-[-0.04em]">
                Three moods <br className="hidden md:block" />
                <span className="font-light italic text-gray">of a river.</span>
              </h2>
            </div>
            <p className={`${mono} max-w-[340px] text-[13px] leading-[1.8] text-mid`}>
              Calm, chaos, change. We let every site set the pace — and move with it.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 border-l border-t border-black md:grid-cols-3">
          {principles.map((p, i) => (
            <Reveal key={p.n} delay={i * 0.1} className="border-b border-r border-black">
              <article className="group relative flex h-full min-h-[230px] flex-col justify-between overflow-hidden p-6 transition-colors sm:p-8 duration-500 hover:bg-black hover:text-[var(--background)] md:min-h-[360px] lg:p-10">
                <div className="flex items-start justify-between">
                  <span className={`${mono} text-[12px] tracking-[0.2em] text-[#ed1c2e]`}>{p.n}</span>
                  <span className="text-[22px] transition-transform duration-500 group-hover:rotate-45">↗</span>
                </div>
                <span
                  className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 select-none text-[120px] font-extrabold md:text-[160px] leading-none text-black/[0.04] transition-colors duration-500 group-hover:text-white/[0.06]"
                  aria-hidden="true"
                >
                  {p.n}
                </span>
                <div className="relative">
                  <h3 className="text-[clamp(26px,2.4vw,34px)] font-bold leading-[1.05] tracking-[-0.03em]">{p.title}</h3>
                  <p className={`${mono} mt-4 text-[13px] leading-[1.75] opacity-70`}>{p.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ═══════════════ RHYTHM ═══════════════ */}
      <Section className="pt-24 md:pt-36">
        <div className="relative border border-dashed border-black/50 p-6 sm:p-10 lg:p-14">
          <CropMarks />
          <Reveal>
            <SectionLabel index="03" title="Studio rhythm" />
            <h2 className="mt-6 max-w-[760px] text-[clamp(30px,3.6vw,52px)] font-extrabold leading-[1] tracking-[-0.035em]">
              From dawn research <span className="font-light italic text-gray">to weekend wandering.</span>
            </h2>
          </Reveal>

          <ol className="relative mt-12 grid grid-cols-1 gap-9 md:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:gap-6">
            <span className="absolute left-0 right-0 top-[7px] hidden border-t border-dashed border-black/60 lg:block" aria-hidden="true" />
            <span className="absolute bottom-6 left-[7px] top-2 border-l border-dashed border-black/60 md:hidden" aria-hidden="true" />
            {rhythm.map((r, i) => (
              <li key={r.time}>
                <Reveal delay={i * 0.12} className="relative pl-10 md:pl-0">
                  <span
                    className={`absolute left-0 top-1 z-10 block h-4 w-4 md:relative md:top-0 rounded-full border-2 border-black ${i === 2 ? "bg-black" : i === 3 ? "bg-[#ed1c2e] border-[#ed1c2e]" : "bg-[var(--background)]"}`}
                  />
                  <p className={`${mono} text-[11px] uppercase tracking-[0.25em] text-gray md:mt-6`}>{r.time}</p>
                  <p className="mt-1 text-[26px] font-bold md:mt-2 md:text-[28px] tracking-[-0.03em]">{r.label}</p>
                  <p className={`${mono} mt-3 max-w-[240px] text-[13px] leading-[1.7] text-mid`}>{r.note}</p>
                </Reveal>
              </li>
            ))}
          </ol>

          {/* speculative ↔ realism */}
          <Reveal className="mt-16 border-t border-dashed border-black/50 pt-10">
            <div className={`${mono} flex items-center justify-between text-[11px] uppercase tracking-[0.25em]`}>
              <span>Speculative</span>
              <span>Realism</span>
            </div>
            <div className="relative mt-4 h-px w-full bg-black">
              <span className="about-swing absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ed1c2e] shadow-[0_0_0_6px_rgba(237,28,46,0.15)]" />
            </div>
            <p className={`${mono} mt-8 max-w-[720px] text-[14px] leading-[1.85] text-mid`}>{tracks}</p>
          </Reveal>
        </div>
      </Section>

      {/* ═══════════════ TEAM ═══════════════ */}
      <Section className="pt-24 md:pt-36">
        <Reveal>
          <SectionLabel index="04" title="The people" />
          <h2 className="mt-6 text-[clamp(34px,4.6vw,68px)] font-extrabold leading-[0.95] tracking-[-0.04em]">
            Two minds, <span className="font-light italic text-gray">one current.</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
          {founders.map((f, i) => (
            <Reveal key={f.name} delay={i * 0.15}>
              <article className="group relative h-full border border-black bg-[var(--background)] transition-transform duration-500 hover:-translate-y-1.5">
                <span className="absolute inset-0 -z-10 translate-x-2 translate-y-2 border border-dashed border-black/50 transition-transform duration-500 group-hover:translate-x-4 group-hover:translate-y-4 sm:translate-x-3 sm:translate-y-3" aria-hidden="true" />
                <div className="relative aspect-[4/3] overflow-hidden border-b border-black bg-[var(--light-gray)]/40">
                  <div className="absolute inset-0 bg-[radial-gradient(rgba(12,12,12,0.18)_1px,transparent_1px)] [background-size:14px_14px]" aria-hidden="true" />
                  <Image
                    src={f.img}
                    alt={`${f.name}, Noyyal Studios ${f.role.toLowerCase()}`}
                    fill
                    sizes="(min-width: 768px) 45vw, 90vw"
                    className="object-contain p-6 mix-blend-multiply transition-transform duration-700 group-hover:scale-[1.05]"
                  />
                  <span className={`${mono} absolute left-5 top-5 bg-black px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--background)]`}>
                    {f.n}
                  </span>
                  <span className={`${mono} absolute bottom-5 right-5 border border-[#ed1c2e] px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-[#ed1c2e]`}>
                    {f.role}
                  </span>
                </div>
                <div className="p-7 lg:p-9">
                  <h3 className="text-[clamp(30px,3vw,44px)] font-extrabold tracking-[-0.04em]">{f.name}</h3>
                  <p className={`${mono} mt-4 text-[13.5px] leading-[1.85] text-mid`}>{f.bio}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-20 text-center">
          <p className="text-[clamp(26px,3.6vw,52px)] font-light italic tracking-[-0.03em] text-[#ed1c2e]">
            “Forever in incognito, forever curious.”
          </p>
        </Reveal>
      </Section>

      {/* ═══════════════ CONTACT ═══════════════ */}
      <Section className="pb-24 pt-24 md:pb-32 md:pt-36">
        <Reveal>
          <div className="relative overflow-hidden bg-black px-6 py-10 text-[var(--background)] sm:p-12 lg:p-16">
            <div className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:48px_48px]" aria-hidden="true" />
            <Orbit className="absolute -right-14 -top-14 h-36 w-36 border-white/30! opacity-50 sm:-right-10 sm:-top-10 sm:h-48 sm:w-48 md:h-72 md:w-72" />

            <div className="relative">
              <div className={`${mono} flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-white/60`}>
                <span className="text-[#ed1c2e]">(05)</span>
                <span className="h-px w-8 bg-white/40" />
                <span>Contact</span>
              </div>

              <h2 className="mt-8 text-[clamp(40px,7vw,110px)] font-extrabold leading-[0.9] tracking-[-0.045em]">
                Let’s talk.
                <br />
                <span className="font-light italic text-white/50">Connect with us!</span>
              </h2>

              <a
                href="mailto:admin@noyyalstudios.com"
                className="group mt-12 inline-flex items-center gap-4 text-[clamp(18px,2.4vw,32px)] font-semibold tracking-[-0.02em]"
              >
                <span className="relative">
                  admin@noyyalstudios.com
                  <span className="absolute -bottom-1 left-0 h-[2px] w-full origin-left scale-x-100 bg-[#ed1c2e] transition-transform duration-500 group-hover:scale-x-0" />
                </span>
                <span className="transition-transform duration-500 group-hover:translate-x-2">→</span>
              </a>

              <dl className={`${mono} mt-12 grid grid-cols-1 gap-6 border-t border-white/20 pt-8 text-[13px] sm:grid-cols-3`}>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.25em] text-white/50">_email</dt>
                  <dd className="mt-2">For enquiries and careers</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.25em] text-white/50">_address</dt>
                  <dd className="mt-2">Erode, India</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.25em] text-white/50">_phone</dt>
                  <dd className="mt-2">
                    <a href="tel:+919786855130" className="hover:text-[#ed1c2e]">
                      +91 9786855130
                    </a>
                  </dd>
                </div>
              </dl>

              <Link
                href="/contact"
                className={`${mono} mt-12 inline-flex items-center gap-3 border border-white/60 px-6 py-3 text-[11px] uppercase tracking-[0.25em] transition-colors duration-300 hover:border-[#ed1c2e] hover:bg-[#ed1c2e]`}
              >
                Start a project <span>↗</span>
              </Link>
            </div>
          </div>
        </Reveal>
      </Section>

      <Footer rightText="Erode, Tamil Nadu — India" />
    </div>
  );
}
