import { Cormorant_Garamond } from "next/font/google";
import type { ReactNode } from "react";

const journalSerif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-journal-serif",
  display: "swap",
});

export default function JournalLayout({ children }: { children: ReactNode }) {
  return <div className={journalSerif.variable}>{children}</div>;
}
