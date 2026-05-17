"use client";

import { CartProvider } from "@/contexts/cart";
import type { ReactNode } from "react";
import { CartDrawer } from "./CartDrawer";

export function CommerceShell({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
    </CartProvider>
  );
}
