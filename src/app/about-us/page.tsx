import Image from "next/image";

const story = "Rooted in history, inspired by the future, Noyyal dreams of a world where design flows as naturally as a river—shaping spaces that everyone can enjoy, everywhere. We’re a cheeky but serious mission to make the world better—powered by teamwork, fuelled by creativity, seasoned with patience, and sprinkled with joyful surprises that keep things exciting.";

export default function AboutUsPage() {
  return (
    <main className="mx-auto w-full max-w-[1060px] px-5 py-10 text-black sm:px-8 md:py-16">
      <section className="grid gap-7 border-y border-black py-7 md:grid-cols-[230px_1fr]">
        <div className="flex flex-col justify-between"><div className="relative mx-auto h-28 w-28 rounded-full border-[3px] border-black"><i className="absolute left-1/2 top-[-6px] h-3 w-3 -translate-x-1/2 rounded-full bg-black" /><i className="absolute bottom-[-6px] left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-black" /></div><p className="mt-7 font-mono text-[10px] leading-[1.55]">{story}</p></div>
        <div className="relative min-h-[330px] border-l border-dashed border-black pl-7"><p className="max-w-[250px] font-mono text-[10px] leading-[1.55]">A trans-disciplinary firm, weekdays dawn into research, shuffled to dusk and night dreamers, and weekends searching ourselves amongst the nature.</p><svg viewBox="0 0 500 350" className="absolute right-0 top-8 h-[75%] w-[75%]" aria-hidden="true"><path d="M20 310C92 177 149 58 191 72c35 12 4 93 50 97 60 4 132-143 224-230" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" /><path d="M75 310c64-89 111-140 144-122 31 17-4 84 43 92 52 9 109-108 186-190" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" /></svg><p className="absolute bottom-0 left-7 right-0 border-t border-dashed border-black pt-5 font-mono text-[10px] leading-[1.5]">We track out different principles and switch between the speculative and realism, diving to explore new tangible and intangible spheres. Come along and interact with us.</p></div>
      </section>

      <section className="mt-14 grid gap-5 md:grid-cols-[.85fr_.7fr_1.45fr_1.45fr_.7fr_.85fr] md:items-center">
        <article className="text-center font-mono md:text-right"><h2 className="text-[11px] font-bold tracking-[.12em]">Dinosour<br />Founder</h2><p className="mt-7 text-[8px] leading-[1.5]">A trail-walking dinosaur with fossils of curiosity and footprints of risk. Growing quietly beneath the canopy, where architecture, culture, and food become stories. Taking baby steps through research and design, one sketch at a time.</p></article>
        <div className="relative h-64"><Image src="/images/about-founder-dinosour.png" alt="Dinosour, Noyyal Studios founder" fill sizes="180px" className="object-contain mix-blend-multiply" /></div>
        <article className="font-mono text-[9px] font-semibold leading-[1.55]">A trail-hiking, risk-taking dinosaur, living under the radar, passionate about architectural philosophy, culture, and great food. Taking baby steps through research and design, one sketch at a time. Living below the radar, where silence sharpens observation. Always in incognito mode—letting the work leave the loudest tracks.</article>
        <article className="font-mono text-right text-[9px] font-semibold leading-[1.55]">I bloom under moonlight and wander through daylight dreams. A moonwalker of thoughts, chasing questions more than answers. The sea is my language, and every journey a new chapter. Curiosity is my compass; edutainment is my playground. Like the waves, my research never stops—it simply finds another shore.</article>
        <div className="relative h-64"><Image src="/images/about-founder-moon.png" alt="Moon, Noyyal Studios co-founder" fill sizes="180px" className="object-contain mix-blend-multiply" /></div>
        <article className="text-center font-mono md:text-left"><h2 className="text-[11px] font-bold tracking-[.12em]">Moon<br />Co-Founder</h2></article>
        <div className="col-span-full mx-auto w-[68%] border border-black md:-mt-56 md:h-56 md:w-[64%]" aria-hidden="true" />
      </section>
      <p className="mt-2 font-mono text-[10px] tracking-[.12em] text-[#ed1c2e] md:ml-[18%]">Forever in incognito, forever curious.</p>

      <section className="mt-14 border-t border-black pt-7"><p className="font-mono text-[10px] tracking-[.15em]">CONTACT</p><div className="mt-7 grid gap-8 md:grid-cols-[1fr_1.2fr]"><h2 className="font-mono text-sm font-bold tracking-[.08em]">LET&apos;S TALK-CONNECT WITH US!</h2><dl className="grid grid-cols-[65px_1fr] gap-y-2 font-mono text-[9px]"><dt>_email</dt><dd>for enquiries and careers &nbsp; admin@noyyalstudios.com</dd><dt>_address</dt><dd>Erode, India</dd><dt>_phone</dt><dd>+91 9786855130</dd></dl></div></section>
    </main>
  );
}
