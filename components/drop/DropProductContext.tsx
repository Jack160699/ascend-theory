"use client";

import type { Drop } from "@/lib/data/drops";
import { createContext, useContext, type ReactNode } from "react";

const DropProductContext = createContext<Drop | null>(null);

export function DropProductProvider({
  product,
  children,
}: {
  product: Drop;
  children: ReactNode;
}) {
  return (
    <DropProductContext.Provider value={product}>
      {children}
    </DropProductContext.Provider>
  );
}

export function useDropProduct(): Drop {
  const ctx = useContext(DropProductContext);
  if (!ctx) {
    throw new Error("useDropProduct requires DropProductProvider");
  }
  return ctx;
}
