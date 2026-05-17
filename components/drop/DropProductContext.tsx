"use client";

import type { DropProduct } from "@/lib/brand/drop-product";
import { createContext, useContext, type ReactNode } from "react";

const DropProductContext = createContext<DropProduct | null>(null);

export function DropProductProvider({
  product,
  children,
}: {
  product: DropProduct;
  children: ReactNode;
}) {
  return (
    <DropProductContext.Provider value={product}>
      {children}
    </DropProductContext.Provider>
  );
}

export function useDropProduct(): DropProduct {
  const ctx = useContext(DropProductContext);
  if (!ctx) {
    throw new Error("useDropProduct requires DropProductProvider");
  }
  return ctx;
}
