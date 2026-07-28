import type { Metadata } from "next";
import { Syne, DM_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/ui/Navigation";
import CustomCursor from "@/components/ui/CustomCursor";
import InkCanvas from "@/components/ui/InkCanvas";
import SmoothScroll from "@/components/ui/SmoothScroll";
import IntroWrapper from "@/components/ui/IntroWrapper";

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
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmMono.variable} ${playfair.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col bg-white text-black text-xs font-sans">
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
