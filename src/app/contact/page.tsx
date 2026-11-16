"use client";

import { useEffect, useState } from "react";
import { Courier_Prime } from "next/font/google";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { clsx } from "clsx";
import Footer from "@/components/ui/Footer";
import LiveClock from "@/components/ui/LiveClock";

const aboutMono = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-about-mono",
  display: "swap",
});

const RED = "#ed1c2e";
const EMAIL = "admin@noyyalstudios.com";

const TOPICS = ["A residence", "A commercial space", "An interior", "Research", "Careers", "Just saying hi"];

const details = [
  { k: "_email", v: EMAIL, href: `mailto:${EMAIL}`, copy: true },
  { k: "_phone", v: "+91 9786855130", href: "tel:+919786855130" },
  { k: "_address", v: "Erode, Tamil Nadu, India" },
  { k: "_response", v: "within 3 working days" },
];

// Types a string out one character at a time (instant when reduced motion is on).
function useTypewriter(text: string, speed = 80) {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setCount((c) => Math.min(c + 1, text.length)), speed);
    return () => clearInterval(id);
  }, [text, speed, reduce]);
  return reduce ? text : text.slice(0, count);
}

function useToday() {
  const [today, setToday] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const update = () => setToday(fmt.format(new Date()).toUpperCase());
    update();
  }, []);
  return today;
}

// Registration cross used at the sheet corners
function Cross({ className }: { className: string }) {
  return (
    <span className={clsx("pointer-events-none absolute h-5 w-5", className)} aria-hidden="true">
      <i className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-black" />
      <i className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-black" />
      <i className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black" />
    </span>
  );
}

// Schematic "site plan": the Noyyal running east to meet the Kaveri, with the studio marked at Erode.
function SitePlan() {
  const reduce = useReducedMotion();
  const draw = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { pathLength: 0 },
          whileInView: { pathLength: 1 },
          viewport: { once: true },
          transition: { duration: 2.2, delay, ease: "easeInOut" as const },
        };

  return (
    <figure className="relative border border-dashed border-black/50">
      <svg viewBox="0 0 400 240" className="block h-auto w-full" role="img" aria-label="Schematic map: the Noyyal river flowing east to the Kaveri, with Noyyal Studios marked at Erode">
        <defs>
          <pattern id="plan-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="400" height="240" fill="url(#plan-grid)" />

        {/* Kaveri */}
        <motion.path
          d="M318 0 C330 50 300 90 326 128 S364 196 352 240"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          {...draw(0)}
        />
        {/* Noyyal */}
        <motion.path
          d="M8 176 C52 150 82 196 128 172 S206 120 246 142 S300 176 334 150"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          {...draw(0.4)}
        />

        {/* towns along the river */}
        {[
          { x: 40, y: 166, label: "COIMBATORE", dy: -10 },
          { x: 150, y: 160, label: "TIRUPPUR", dy: 20 },
        ].map((t) => (
          <g key={t.label}>
            <circle cx={t.x} cy={t.y} r="3" fill="currentColor" />
            <text x={t.x} y={t.y + t.dy} fontSize="9" letterSpacing="1.5" textAnchor="middle" fill="currentColor" fillOpacity="0.6">
              {t.label}
            </text>
          </g>
        ))}

        <text x="206" y="118" fontSize="10" fontStyle="italic" letterSpacing="2" fill="currentColor" fillOpacity="0.7" transform="rotate(-12 206 118)">
          noyyal
        </text>
        <text x="352" y="42" fontSize="10" fontStyle="italic" letterSpacing="2" fill="currentColor" fillOpacity="0.7" transform="rotate(72 352 42)">
          kaveri
        </text>

        {/* studio marker */}
        <g transform="translate(300 84)">
          <circle r="16" fill="none" stroke={RED} strokeWidth="1" className="motion-safe:animate-ping" style={{ transformOrigin: "center", transformBox: "fill-box" }} />
          <circle r="7" fill="none" stroke={RED} strokeWidth="1.5" />
          <path d="M-14 0H14M0 -14V14" stroke={RED} strokeWidth="1" />
          <text x="-14" y="-22" fontSize="10" fontWeight="700" letterSpacing="1.5" textAnchor="end" fill={RED}>
            NOYYAL STUDIOS
          </text>
          <text x="-14" y="-10" fontSize="8" letterSpacing="1" textAnchor="end" fill="currentColor" fillOpacity="0.6">
            ERODE · 11.34°N 77.72°E
          </text>
        </g>

        {/* north arrow */}
        <g transform="translate(34 40)" fill="currentColor">
          <circle r="16" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M0 -12 L6 8 L0 3 L-6 8 Z" />
          <text y="-20" fontSize="9" textAnchor="middle" fontWeight="700">N</text>
        </g>
      </svg>
      <figcaption className="flex justify-between border-t border-dashed border-black/50 px-3 py-2 text-[10px] tracking-[0.18em] text-black/60">
        <span>SITE PLAN</span>
        <span>N.T.S.</span>
      </figcaption>
    </figure>
  );
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const headline = useTypewriter("LET'S TALK.");
  const today = useToday();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus("error");
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to submit enquiry.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setStatus("error");
      const errMsg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMessage(errMsg);
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — the mailto link still works */
    }
  };

  const busy = status === "submitting";
  const inlineInput =
    "mx-1 inline-block border-0 border-b border-dashed border-black/50 bg-transparent px-1 pb-0.5 text-[15px] font-bold text-black outline-none transition-colors placeholder:font-normal placeholder:text-black/30 focus:border-solid focus:border-black cursor-none disabled:opacity-50";

  return (
    <div className={`${aboutMono.variable} about-mono flex min-h-screen w-full flex-col bg-transparent text-black`}>
      <main className="mx-auto w-full max-w-[1240px] flex-grow px-5 py-12 sm:px-10 md:py-16">
        {/* ═════════ DRAWING SHEET ═════════ */}
        <div className="relative">
          {/* sheet grid references */}
          <div className="pointer-events-none absolute -top-7 inset-x-0 hidden justify-around text-[10px] tracking-[0.2em] text-black/40 lg:flex" aria-hidden="true">
            {[1, 2, 3, 4, 5, 6].map((n) => <span key={n}>{n}</span>)}
          </div>
          <div className="pointer-events-none absolute -left-7 inset-y-0 hidden flex-col justify-around text-[10px] tracking-[0.2em] text-black/40 lg:flex" aria-hidden="true">
            {["A", "B", "C", "D"].map((n) => <span key={n}>{n}</span>)}
          </div>

          <div className="relative border border-black bg-[#f4f3ef]/60 backdrop-blur-[1px]">
            <Cross className="-left-2.5 -top-2.5" />
            <Cross className="-right-2.5 -top-2.5" />
            <Cross className="-bottom-2.5 -left-2.5" />
            <Cross className="-bottom-2.5 -right-2.5" />

            {/* header strip */}
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-black px-6 py-4 md:px-10">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/n3.png" alt="Noyyal Studios" className="h-9 w-9 border border-black/30 object-contain mix-blend-multiply" />
                <span className="text-[12px] tracking-[0.25em]">CONTACT</span>
              </div>
              <div className="flex items-center gap-6 text-[11px] tracking-[0.18em] text-black/60">
                <span className="hidden sm:inline">SHEET CT-01</span>
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full motion-safe:animate-pulse" style={{ background: RED }} />
                  ERODE <LiveClock className="text-black" /> IST
                </span>
              </div>
            </header>

            <div className="grid lg:grid-cols-[1fr_1.15fr]">
              {/* ═════════ LEFT ═════════ */}
              <section className="flex flex-col gap-10 border-b border-black p-6 md:p-10 lg:border-b-0 lg:border-r">
                <div>
                  <h1 className="text-[clamp(40px,6vw,78px)] font-bold leading-[0.95] tracking-[-0.01em]">
                    {headline}
                    <span className="ml-1 inline-block w-[0.5ch] motion-safe:animate-pulse" style={{ color: RED }}>
                      _
                    </span>
                  </h1>
                  <p className="mt-4 text-[clamp(14px,1.5vw,18px)] tracking-[0.12em]">&mdash; CONNECT WITH US!</p>
                  <p className="mt-6 max-w-[440px] text-[13px] leading-[1.85] text-black/70">
                    A home on a slope, a shop that breathes, a question about light&nbsp;&mdash; every project starts as
                    a conversation. Write to us like you&apos;d write a letter.
                  </p>
                </div>

                <SitePlan />

                <dl className="border-t border-dashed border-black/50">
                  {details.map((d) => (
                    <div key={d.k} className="grid grid-cols-[100px_1fr_auto] items-baseline gap-3 border-b border-dashed border-black/50 py-3.5 text-[13px]">
                      <dt className="text-black/55">{d.k}</dt>
                      <dd>
                        {d.href ? (
                          <a href={d.href} className="cursor-none no-underline decoration-dashed underline-offset-4 hover:underline">
                            {d.v}
                          </a>
                        ) : (
                          d.v
                        )}
                      </dd>
                      {d.copy ? (
                        <button
                          type="button"
                          onClick={copyEmail}
                          className="cursor-none border border-black/40 px-2 py-0.5 text-[10px] tracking-[0.15em] transition-colors hover:border-black hover:bg-black hover:text-[#f4f3ef]"
                        >
                          {copied ? "COPIED ✓" : "COPY"}
                        </button>
                      ) : (
                        <span />
                      )}
                    </div>
                  ))}
                </dl>
              </section>

              {/* ═════════ RIGHT: THE LETTER ═════════ */}
              <section className="relative overflow-hidden p-6 md:p-10">
                <div className="mb-8 flex items-center justify-between text-[11px] tracking-[0.25em] text-black/60">
                  <span>SEND AN ENQUIRY</span>
                  <span>{today}</span>
                </div>

                <form onSubmit={handleSubmit} className="relative flex flex-col">
                  <p className="text-[15px] leading-[2.4]">Dear Noyyal Studios,</p>

                  <p className="mt-3 text-[15px] leading-[2.6]">
                    My name is
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="your full name"
                      required
                      disabled={busy}
                      aria-label="Your name"
                      className={clsx(inlineInput, "w-[15ch] max-w-full")}
                    />
                    and you can write back to me at
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@email.com"
                      required
                      disabled={busy}
                      aria-label="Your email"
                      className={clsx(inlineInput, "w-[21ch] max-w-full")}
                    />
                    .
                  </p>

                  <p className="mt-5 text-[15px]">I&apos;d like to talk about&hellip;</p>
                  <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Subject">
                    {TOPICS.map((t) => {
                      const active = formData.subject === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          disabled={busy}
                          aria-pressed={active}
                          onClick={() => setFormData((p) => ({ ...p, subject: active ? "" : t }))}
                          className={clsx(
                            "cursor-none border px-3 py-1.5 text-[12px] tracking-[0.06em] transition-all duration-200",
                            active
                              ? "border-black bg-black text-[#f4f3ef]"
                              : "border-dashed border-black/50 hover:border-solid hover:border-black"
                          )}
                        >
                          {active ? "✓ " : ""}
                          {t.toLowerCase()}
                        </button>
                      );
                    })}
                  </div>

                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about the site, the people, the light you imagine…"
                    rows={6}
                    required
                    disabled={busy}
                    aria-label="Your message"
                    className="mt-6 w-full resize-none border-0 bg-transparent px-1 text-[15px] text-black outline-none placeholder:text-black/30 cursor-none disabled:opacity-50"
                    style={{
                      lineHeight: "32px",
                      backgroundImage:
                        "repeating-linear-gradient(to bottom, transparent 0, transparent 31px, rgba(0,0,0,0.18) 31px, rgba(0,0,0,0.18) 32px)",
                      backgroundAttachment: "local",
                    }}
                  />

                  <div className="mt-6 text-[15px] leading-[2]">
                    <p>Yours curiously,</p>
                    <p className="min-h-[1.6em] text-[24px] italic" style={{ color: formData.name ? "#111" : "rgba(0,0,0,0.25)" }}>
                      {formData.name || "— — — — —"}
                    </p>
                  </div>

                  <AnimatePresence>
                    {status === "error" && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-5 border border-dashed px-4 py-3 text-[12px] tracking-[0.06em]"
                        style={{ color: RED, borderColor: RED }}
                      >
                        ✕ {errorMessage}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                    <button
                      type="submit"
                      disabled={busy}
                      className={clsx(
                        "group cursor-none border border-black bg-black px-8 py-4 text-[12px] tracking-[0.28em] text-[#f4f3ef] transition-colors hover:bg-transparent hover:text-black",
                        busy && "pointer-events-none opacity-50"
                      )}
                    >
                      {busy ? "POSTING…" : "SEND LETTER"}
                      <span className="ml-3 inline-block transition-transform group-hover:translate-x-1">→</span>
                    </button>
                    <span className="text-[11px] tracking-[0.1em]" style={{ color: RED }}>
                      Forever in incognito, forever curious.
                    </span>
                  </div>

                  {/* "RECEIVED" rubber stamp on success */}
                  <AnimatePresence>
                    {status === "success" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 1.8, rotate: -4 }}
                        animate={{ opacity: 1, scale: 1, rotate: -12 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", stiffness: 380, damping: 18 }}
                        className="absolute left-1/2 top-[38%] z-10 -translate-x-1/2 border-[3px] bg-[#f4f3ef]/85 px-8 py-4 text-center"
                        style={{ color: RED, borderColor: RED }}
                        role="status"
                      >
                        <p className="text-[34px] font-bold tracking-[0.25em]">RECEIVED</p>
                        <p className="mt-1 text-[11px] tracking-[0.2em]">{today} · REPLY IN 3 WORKING DAYS</p>
                        <button
                          type="button"
                          onClick={() => setStatus("idle")}
                          className="mt-3 cursor-none text-[11px] tracking-[0.15em] underline underline-offset-4"
                        >
                          write another
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </section>
            </div>

            {/* ═════════ TITLE BLOCK ═════════ */}
            <div className="grid grid-cols-2 border-t border-black text-[11px] sm:grid-cols-3 lg:grid-cols-6">
              {[
                { k: "PROJECT", v: formData.subject || "Your next space" },
                { k: "CLIENT", v: formData.name || "You" },
                { k: "ARCHITECT", v: "Noyyal Studios" },
                { k: "SCALE", v: "1 : 1" },
                { k: "DATE", v: today || "—" },
                { k: "SHEET", v: "CT-01 / 01" },
              ].map((c, i) => (
                <div
                  key={c.k}
                  className={clsx(
                    "border-black/60 px-4 py-3",
                    i % 2 === 0 && "border-r",
                    "sm:border-r lg:last:border-r-0",
                    i < 4 && "border-b sm:border-b-0",
                    i < 3 && "sm:border-b lg:border-b-0"
                  )}
                >
                  <p className="text-[9px] tracking-[0.25em] text-black/50">{c.k}</p>
                  <p className="mt-1 truncate font-bold">{c.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
