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

type AddProductInput =
  | string
  | {
      slug: string;
      sku?: string;
      variantId?: string;
      size?: string;
      color?: string;
      quantity?: number;
    };

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
  addProduct: (input: AddProductInput) => void;
  setQuantity: (lineKeyOrSkuOrSlug: string, quantity: number) => void;
  removeLine: (lineKeyOrSkuOrSlug: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function getLineIdentity(l: Partial<CartLine>): string {
  if (l.variantId) return l.variantId;
  if (l.sku) return l.sku;
  return `${l.slug}-${l.size || "S"}-${l.color || "black"}`;
}

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

  const addProduct = useCallback((input: AddProductInput) => {
    const lineObj: CartLine =
      typeof input === "string"
        ? { slug: input, quantity: 1 }
        : {
            slug: input.slug,
            sku: input.sku,
            variantId: input.variantId,
            size: input.size,
            color: input.color,
            quantity: input.quantity || 1,
          };

    const targetKey = getLineIdentity(lineObj);
    const product = getCartProduct(lineObj.slug);

    setLines((prev) => {
      const existingIndex = prev.findIndex((l) => getLineIdentity(l) === targetKey);
      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        const nextQty = product
          ? clampQuantity(product, existing.quantity + (lineObj.quantity || 1))
          : existing.quantity + (lineObj.quantity || 1);

        const copy = [...prev];
        copy[existingIndex] = { ...existing, quantity: nextQty };
        return copy;
      }

      return [...prev, lineObj];
    });

    if (product) {
      event("AddToCart", {
        content_name: product.name,
        content_ids: [lineObj.sku || lineObj.variantId || product.slug],
        content_type: "product",
        value: product.price,
        currency: product.currency,
      });
    }

    setDrawerOpen(true);
  }, []);

  const addDefaultProduct = useCallback(() => {
    addProduct(getDefaultCartProduct().slug);
  }, [addProduct]);

  const setQuantity = useCallback((lineKeyOrSkuOrSlug: string, quantity: number) => {
    setLines((prev) => {
      if (quantity < 1) {
        return prev.filter((l) => getLineIdentity(l) !== lineKeyOrSkuOrSlug && l.slug !== lineKeyOrSkuOrSlug && l.sku !== lineKeyOrSkuOrSlug && l.variantId !== lineKeyOrSkuOrSlug);
      }
      return prev.map((l) => {
        const isMatch =
          getLineIdentity(l) === lineKeyOrSkuOrSlug ||
          l.slug === lineKeyOrSkuOrSlug ||
          l.sku === lineKeyOrSkuOrSlug ||
          l.variantId === lineKeyOrSkuOrSlug;

        if (!isMatch) return l;

        const product = getCartProduct(l.slug);
        const qty = product ? clampQuantity(product, quantity) : quantity;
        return { ...l, quantity: qty };
      });
    });
  }, []);

  const removeLine = useCallback((lineKeyOrSkuOrSlug: string) => {
    setLines((prev) =>
      prev.filter(
        (l) =>
          getLineIdentity(l) !== lineKeyOrSkuOrSlug &&
          l.slug !== lineKeyOrSkuOrSlug &&
          l.sku !== lineKeyOrSkuOrSlug &&
          l.variantId !== lineKeyOrSkuOrSlug
      )
    );
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
      addProduct,
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
      addProduct,
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
