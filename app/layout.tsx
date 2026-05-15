import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AscendFilmGrain } from "@/components/AscendFilmGrain";
import { MetaPixel } from "@/components/analytics/MetaPixel";
import { CookieNotice } from "@/components/CookieNotice";
import { Footer } from "@/sections/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ascend Theory",
  description:
    "A private operating system for discipline and execution — selective admission.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-black text-white">
        {/* Meta Pixel: single global injection + route-bound PageViews (production or DEBUG). */}
        <MetaPixel />
        <div className="flex min-h-full flex-1 flex-col">{children}</div>
        <Footer />
        <CookieNotice />
        <AscendFilmGrain />
      </body>
    </html>
  );
}
