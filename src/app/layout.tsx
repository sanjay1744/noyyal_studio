import type { Metadata } from "next";
import { Inter, Syne, DM_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/ui/Navigation";
import CustomCursor from "@/components/ui/CustomCursor";
import InkCanvas from "@/components/ui/InkCanvas";
import SmoothScroll from "@/components/ui/SmoothScroll";
import IntroWrapper from "@/components/ui/IntroWrapper";
import BootLoader from "@/components/ui/BootLoader";
import { preload } from "react-dom";
import { MOCK_PROJECTS } from "@/config/sanity";
import { INTRO_VIDEO, MODEL_PATHS } from "@/lib/preloadAssets";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  style: ["normal", "italic"],
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-playfair",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Noyyal Studios — Architecture & Research Studio",
  description: "We design homes and research how architecture shapes human experience — rooted in the landscapes of South India.",
  keywords: ["Architecture Studio", "Research", "South India", "Residential Design", "Sustainable Design", "Chennai Architects"],
  authors: [{ name: "Noyyal Studios" }],
  openGraph: {
    title: "Noyyal Studios — Architecture & Research",
    description: "We design homes and research how architecture shapes human experience — rooted in the landscapes of South India.",
    type: "website",
    url: "https://noyyal.studio",
    siteName: "Noyyal Studios",
    locale: "en_IN",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Start the heavy downloads from the HTML itself, before any JS has loaded.
  // "fetch" + anonymous CORS matches the fetch() calls in preloadAssets.ts.
  preload(INTRO_VIDEO, { as: "fetch", crossOrigin: "anonymous", fetchPriority: "high" });
  MODEL_PATHS.forEach((url) => preload(url, { as: "fetch", crossOrigin: "anonymous" }));
  preload("/n3.png", { as: "image" });
  MOCK_PROJECTS.slice(0, 3).forEach((p) => p.heroImage && preload(p.heroImage, { as: "image" }));

  return (
    <html
      lang="en"
      className={`${inter.variable} ${syne.variable} ${dmMono.variable} ${playfair.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col text-black text-xs font-sans">
        <BootLoader />
        <SmoothScroll />
        <CustomCursor />
        <InkCanvas />
        <Navigation />
        <main className="flex-grow pt-14 flex flex-col">
          <IntroWrapper>{children}</IntroWrapper>
        </main>
      </body>
    </html>
  );
}
