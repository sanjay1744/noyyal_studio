"use client";

import { useEffect, useState } from "react";
import { getResearch, ResearchArticle } from "@/config/sanity";
import Footer from "@/components/ui/Footer";

export default function ResearchPage() {
  const [articles, setArticles] = useState<ResearchArticle[]>([]);

  useEffect(() => {
    getResearch().then((data) => {
      setArticles(data);
    });
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col bg-white">
      {/* ── HERO SECTION ── */}
      <section className="p-12 px-8 md:px-12 border-b border-light-gray select-none">
        <h1 className="font-syne text-[clamp(36px,4.5vw,64px)] font-extrabold leading-[0.9] tracking-tighter mb-6 mt-6">
          Research &<br />Inquiry
        </h1>
        <p className="text-[11px] tracking-wide text-gray max-w-[480px] leading-[1.8] m-0">
          Noyyal Studios maintains an active research practice examining how architecture responds to climate, memory, and lived experience in South India.
        </p>
      </section>

      {/* ── RESEARCH GRID ── */}
      <section className="flex-grow grid grid-cols-1 md:grid-cols-2">
        {articles.map((article) => (
          <div
            key={article.num}
            className="p-10 border-b border-light-gray md:border-r md:last:border-r-0 odd:border-r border-light-gray transition-colors duration-300 hover:bg-[#eeede8] flex flex-col justify-between group"
          >
            <div className="flex flex-col gap-4">
              <div className="text-[9px] tracking-widest text-gray font-mono">
                {article.num} · {article.status}
              </div>
              <h2 className="font-syne text-[20px] font-bold text-black tracking-tight leading-snug">
                {article.title}
              </h2>
              <p className="text-[11px] text-gray leading-[1.8] m-0">
                {article.body}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-8">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[8px] tracking-widest uppercase border border-light-gray px-2 py-0.5 text-gray bg-white select-none"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </section>

      <Footer rightText="Research inquiries: studio@noyyal.studio" />
    </div>
  );
}
