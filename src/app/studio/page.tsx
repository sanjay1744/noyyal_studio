"use client";

import Footer from "@/components/ui/Footer";

export default function StudioPage() {
  const principles = [
    {
      num: "01",
      title: "Site before form",
      body: "Every design begins with deep site reading — sun, wind, view, memory. Form follows this understanding, never precedes it."
    },
    {
      num: "02",
      title: "Material honesty",
      body: "We work with local materials and express them directly. Brick is brick. Concrete is concrete. Concealment is not sophistication."
    },
    {
      num: "03",
      title: "Slow design",
      body: "We take on fewer projects to invest more time in each. Architecture built to outlast its architect deserves that patience."
    },
    {
      num: "04",
      title: "Research-led practice",
      body: "Every built project is also a research opportunity. Questions from the studio inform the page; answers on the page inform the studio."
    }
  ];

  return (
    <div className="w-full min-h-screen flex flex-col bg-white">
      {/* ── HERO SECTION ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 p-12 px-8 md:px-12 border-b border-light-gray select-none">
        <h1 className="font-syne text-[clamp(40px,5vw,72px)] font-extrabold leading-[0.9] tracking-tighter mt-6">
          A studio that<br />
          <span className="font-normal italic font-playfair text-gray">asks questions.</span>
        </h1>
        <div className="font-playfair text-[17px] leading-[1.75] text-mid md:pt-8">
          Noyyal Studios is an architecture and research practice founded in Chennai. We work primarily on residential architecture and maintain a parallel research program examining how space, climate, and culture shape each other in South India.
          <br /><br />
          The studio takes its name from the Noyyal river — a tributary of the Kaveri — as a reminder that good architecture, like a river, is shaped by what it flows through.
        </div>
      </section>

      {/* ── INFO GRID ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 border-b border-light-gray select-none">
        <div className="p-10 border-b md:border-b-0 border-light-gray border-r last:border-r-0">
          <div className="text-[9px] tracking-[0.3em] text-gray uppercase mb-4">Location</div>
          <div className="text-[13px] leading-[1.7] text-mid">
            Chennai, Tamil Nadu<br />India
          </div>
        </div>
        <div className="p-10 border-b md:border-b-0 border-light-gray border-r last:border-r-0">
          <div className="text-[9px] tracking-[0.3em] text-gray uppercase mb-4">Founded</div>
          <div className="text-[13px] leading-[1.7] text-mid">
            2018<br />Principal Architect
          </div>
        </div>
        <div className="p-10 border-light-gray">
          <div className="text-[9px] tracking-[0.3em] text-gray uppercase mb-4">Practice</div>
          <div className="text-[13px] leading-[1.7] text-mid">
            Residential Architecture<br />Architectural Research<br />Design Consultancy
          </div>
        </div>
      </section>

      {/* ── PRINCIPLES SECTION ── */}
      <section className="p-12 px-8 md:px-12 border-b border-light-gray select-none">
        <div className="text-[9px] tracking-[0.3em] text-gray uppercase mb-10">How we work</div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
          {principles.map((principle) => (
            <div
              key={principle.num}
              className="py-7 border-t border-light-gray grid grid-cols-[40px_1fr] gap-5"
            >
              <div className="font-syne text-[11px] font-bold text-light-gray pt-0.5">
                {principle.num}
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-syne text-[15px] font-bold text-black tracking-tight leading-none m-0">
                  {principle.title}
                </h3>
                <p className="text-[11px] text-gray leading-[1.7] m-0">
                  {principle.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
