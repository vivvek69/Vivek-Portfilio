import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Shippori Mincho B1 (SIL OFL), self-hosted Latin subset. The Google version is
// split into ~160 CJK slices, which made builds fragile; kanji accents fall back
// to the system mincho font.
const mincho = localFont({
  variable: "--font-mincho",
  display: "swap",
  src: [
    { path: "./fonts/shippori-mincho-b1-latin-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/shippori-mincho-b1-latin-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/shippori-mincho-b1-latin-800.woff2", weight: "800", style: "normal" },
  ],
  fallback: ["Yu Mincho", "Hiragino Mincho ProN", "Noto Serif JP", "Times New Roman", "serif"],
});

export const metadata: Metadata = {
  title: "Pasunuti Vivek — AI Engineer",
  description:
    "Cinematic portfolio of Pasunuti Vivek, AI Engineer at Sigmanix Tech Solutions — agentic AI, LLM applications, RAG systems, and backend engineering.",
  authors: [{ name: "Pasunuti Vivek" }],
  openGraph: {
    title: "Pasunuti Vivek — AI Engineer",
    description: "Agentic AI · Generative AI · LLM Applications · Backend Engineering",
    images: ["/assets/profile/vivek-photo.jpg"],
    type: "profile",
  },
};

export const viewport: Viewport = {
  themeColor: "#050403",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${mincho.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
