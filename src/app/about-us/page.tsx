"use client";

import Footer from "@/components/ui/Footer";

export default function AboutUsPage() {
  return (
    <div className="w-full min-h-screen flex flex-col bg-transparent text-[#111111] font-sans relative overflow-hidden select-none">
      {/* Grid vertical reference guide lines */}
      <div className="absolute inset-0 pointer-events-none z-0 hidden lg:grid grid-cols-12 max-w-[1440px] mx-auto px-8 border-x border-[#222222]/10">
        {Array.from({ length: 11 }).map((_, i) => (
          <div key={i} className="border-r border-[#222222]/10 h-full" />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-[1440px] mx-auto flex-grow flex flex-col px-4 sm:px-8 py-12">
        {/* Header Placeholder */}
        <header className="w-full border-b border-[#111111] pb-6 mb-8">
          <h1 className="text-4xl font-extrabold uppercase tracking-tight text-black">
            About Us
          </h1>
          <p className="text-sm font-mono text-gray mt-2">
            [Add page subtitle / introduction here]
          </p>
        </header>

        {/* Main Content Area */}
        <main className="w-full flex-grow border border-[#111111] bg-white p-8 lg:p-12 mb-8 min-h-[400px] flex items-center justify-center text-center">
          <div className="max-w-md space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wide text-black">
              About Us Page Content
            </h2>
            <p className="text-xs font-mono text-gray leading-relaxed">
              This page is ready for custom content implementation.
            </p>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
