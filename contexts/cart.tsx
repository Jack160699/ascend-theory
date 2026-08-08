"use client";

import { getCartProductFromLine, getDefaultCartProduct } from "@/lib/cart/catalog";
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

/**
 * Production addProduct MUST pass exact variant identity.
 * String (slug-only) input is removed to prevent invalid production cart entries.
 */
type AddProductInput = {
  slug: string;
  sku?: string;
  variantId?: string;
  size?: string;
  color?: string;
  quantity?: number;
  // Display snapshot — for DB-backed products that may not be in static CATALOG
  title?: string;
  image?: string;
  priceDisplay?: string;
  currency?: string;
  pricePaise?: number;
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
  setQuantity: (variantKey: string, quantity: number) => void;
  removeLine: (variantKey: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Line identity: variantId is primary, SKU is fallback for legacy/dev compatibility.
 * Never use slug as mutation identity (multiple variants share a slug).
 */
function getLineIdentity(l: Partial<CartLine>): string {
  if (l.variantId) return l.variantId;
  if (l.sku) return l.sku;
  return `${l.slug}-${l.size || "one-size"}-${l.color || "default"}`;
}

function matchesKey(l: CartLine, key: string): boolean {
  return (
    getLineIdentity(l) === key ||
    (l.variantId != null && l.variantId === key) ||
    (l.sku != null && l.sku === key)
  );
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
        const product = getCartProductFromLine(line);
        if (!product) return null;
        return { line, product };
      })
      .filter((row): row is ResolvedLine => row !== null);
  }, [lines]);

  const itemCount = useMemo(
    () => resolvedLines.reduce((n, { line }) => n + line.quantity, 0),
    [resolvedLines],
  );

  const subtotal = useMemo(() => {
    // Prefer pricePaise snapshot; fall back to cartSubtotal using CartProduct
    let total = 0;
    for (const { line, product } of resolvedLines) {
      if (line.pricePaise != null) {
        total += (line.pricePaise / 100) * line.quantity;
      } else {
        total += product.price * line.quantity;
      }
    }
    return total;
  }, [resolvedLines]);

  const currency = resolvedLines[0]?.line.currency ?? resolvedLines[0]?.product.currency ?? "INR";

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const addProduct = useCallback((input: AddProductInput) => {
    const lineObj: CartLine = {
      slug: input.slug,
      sku: input.sku,
      variantId: input.variantId,
      size: input.size,
      color: input.color,
      quantity: input.quantity || 1,
      // Carry display snapshot for DB-only products
      title: input.title,
      image: input.image,
      priceDisplay: input.priceDisplay,
      currency: input.currency,
      pricePaise: input.pricePaise,
    };

    const targetKey = getLineIdentity(lineObj);

    setLines((prev) => {
      const existingIndex = prev.findIndex((l) => getLineIdentity(l) === targetKey);
      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        const product = getCartProductFromLine(existing);
        const addQty = lineObj.quantity || 1;
        const nextQty = product
          ? clampQuantity(product, existing.quantity + addQty)
          : existing.quantity + addQty;

        const copy = [...prev];
        copy[existingIndex] = { ...existing, quantity: nextQty };
        return copy;
      }
      return [...prev, lineObj];
    });

    const product = getCartProductFromLine(lineObj);
    if (product) {
      event("AddToCart", {
        content_name: product.name,
        content_ids: [lineObj.variantId || lineObj.sku || product.slug],
        content_type: "product",
        value: product.price,
        currency: product.currency,
      });
    }

    setDrawerOpen(true);
  }, []);

  /**
   * Dev-only default product add. Uses memory store default variant.
   * In production, Add to Cart always requires explicit variant selection.
   */
  const addDefaultProduct = useCallback(() => {
    const def = getDefaultCartProduct();
    addProduct({
      slug: def.slug,
      title: def.name,
      image: def.image,
      priceDisplay: def.priceDisplay,
      currency: def.currency,
      pricePaise: Math.round(def.price * 100),
      quantity: 1,
    });
  }, [addProduct]);

  /**
   * Set quantity by variantId (primary) or SKU (fallback).
   * qty < 1 removes the line.
   */
  const setQuantity = useCallback((variantKey: string, quantity: number) => {
    setLines((prev) => {
      if (quantity < 1) {
        return prev.filter((l) => !matchesKey(l, variantKey));
      }
      return prev.map((l) => {
        if (!matchesKey(l, variantKey)) return l;
        const product = getCartProductFromLine(l);
        const qty = product ? clampQuantity(product, quantity) : quantity;
        return { ...l, quantity: qty };
      });
    });
  }, []);

  /**
   * Remove line by variantId (primary) or SKU (fallback).
   */
  const removeLine = useCallback((variantKey: string) => {
    setLines((prev) => prev.filter((l) => !matchesKey(l, variantKey)));
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
