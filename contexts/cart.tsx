"use client";

import { getCartProduct, getDefaultCartProduct } from "@/lib/cart/catalog";
import { cartSubtotal } from "@/lib/cart/format";
import { clearCart, readCart, writeCart } from "@/lib/cart/storage";
import type { CartLine, CartProduct } from "@/lib/cart/types";
import { event } from "@/lib/fpixel";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ResolvedLine = { line: CartLine; product: CartProduct };

type CartContextValue = {
  hydrated: boolean;
  lines: CartLine[];
  resolvedLines: ResolvedLine[];
  itemCount: number;
  subtotal: number;
  currency: string;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addDefaultProduct: () => void;
  setQuantity: (slug: string, quantity: number) => void;
  removeLine: (slug: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function clampQuantity(product: CartProduct, qty: number): number {
  return Math.min(Math.max(1, qty), product.maxQuantity);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const stored = readCart();
    const id = window.requestAnimationFrame(() => {
      setLines(stored);
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeCart(lines);
  }, [lines, hydrated]);

  const persist = useCallback((next: CartLine[]) => {
    setLines(next);
  }, []);

  const resolvedLines = useMemo((): ResolvedLine[] => {
    return lines
      .map((line) => {
        const product = getCartProduct(line.slug);
        if (!product) return null;
        return { line, product };
      })
      .filter((row): row is ResolvedLine => row !== null);
  }, [lines]);

  const itemCount = useMemo(
    () => resolvedLines.reduce((n, { line }) => n + line.quantity, 0),
    [resolvedLines],
  );

  const subtotal = useMemo(
    () => cartSubtotal(lines, getCartProduct),
    [lines],
  );

  const currency = resolvedLines[0]?.product.currency ?? "USD";

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const addDefaultProduct = useCallback(() => {
    const product = getDefaultCartProduct();
    setLines((prev) => {
      const existing = prev.find((l) => l.slug === product.slug);
      const nextQty = existing
        ? clampQuantity(product, existing.quantity + 1)
        : 1;
      const next = existing
        ? prev.map((l) =>
            l.slug === product.slug ? { ...l, quantity: nextQty } : l,
          )
        : [...prev, { slug: product.slug, quantity: 1 }];

      return next;
    });

    event("AddToCart", {
      content_name: product.name,
      content_ids: [product.slug],
      content_type: "product",
      value: product.price,
      currency: product.currency,
    });

    setDrawerOpen(true);
  }, []);

  const setQuantity = useCallback((slug: string, quantity: number) => {
    const product = getCartProduct(slug);
    if (!product) return;
    if (quantity < 1) {
      setLines((prev) => prev.filter((l) => l.slug !== slug));
      return;
    }
    const qty = clampQuantity(product, quantity);
    setLines((prev) =>
      prev.map((l) => (l.slug === slug ? { ...l, quantity: qty } : l)),
    );
  }, []);

  const removeLine = useCallback((slug: string) => {
    setLines((prev) => prev.filter((l) => l.slug !== slug));
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    clearCart();
  }, []);

  const value = useMemo(
    (): CartContextValue => ({
      hydrated,
      lines,
      resolvedLines,
      itemCount,
      subtotal,
      currency,
      drawerOpen,
      openDrawer,
      closeDrawer,
      addDefaultProduct,
      setQuantity,
      removeLine,
      clear,
    }),
    [
      hydrated,
      lines,
      resolvedLines,
      itemCount,
      subtotal,
      currency,
      drawerOpen,
      openDrawer,
      closeDrawer,
      addDefaultProduct,
      setQuantity,
      removeLine,
      clear,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
