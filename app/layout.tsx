import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AscendFilmGrain } from "@/components/AscendFilmGrain";
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
    "Private transformation architecture for serious professionals — identity-grade mentorship, disciplined execution systems, and manually reviewed allocation.",
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
        <div className="flex min-h-full flex-1 flex-col">{children}</div>
        <Footer />
        <CookieNotice />
        <AscendFilmGrain />
      </body>
    </html>
  );
}
