"use client";

import { useDropProduct } from "@/components/drop/DropProductContext";
import { useCart } from "@/contexts/cart";
import { cn } from "@/lib/utils";
import { useCallback, useState, useMemo } from "react";
import type { PublicProductVariant } from "@/lib/wearables/types";

type DropCartButtonProps = {
  className?: string;
  variant?: "primary" | "ghost";
  label?: string;
};

export function DropCartButton({
  className,
  variant = "primary",
  label = "Add to Cart",
}: DropCartButtonProps) {
  const product = useDropProduct();
  const { addProduct } = useCart();
  const [pending, setPending] = useState(false);

  // All active+available variants for this product
  const availableVariants = useMemo(() => {
    return (product.variants || []).filter(
      (v) => v.isActive && v.availabilityStatus === "available"
    );
  }, [product.variants]);

  // Derive unique sizes from actual variants (not hardcoded list)
  const allSizes = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    availableVariants.forEach((v) => {
      if (!seen.has(v.size)) {
        seen.add(v.size);
        out.push(v.size);
      }
    });
    return out;
  }, [availableVariants]);

  // Derive unique colors from actual variants
  const allColors = useMemo(() => {
    const seen = new Set<string>();
    const out: { key: string; display: string }[] = [];
    availableVariants.forEach((v) => {
      const key = v.color;
      const display = v.colorDisplay || v.color;
      if (!seen.has(key)) {
        seen.add(key);
        out.push({ key, display });
      }
    });
    return out;
  }, [availableVariants]);

  const [selectedSize, setSelectedSize] = useState<string>(() => allSizes[0] ?? "");
  const [selectedColor, setSelectedColor] = useState<string>(() => allColors[0]?.key ?? "");

  // When available variants change (product refresh), reset selections to first available
  // Use a key-based approach: track whether allSizes/allColors have changed since last init
  const effectiveSizesKey = allSizes.join(",");
  const effectiveColorsKey = allColors.map((c) => c.key).join(",");
  const [lastSizesKey, setLastSizesKey] = useState(effectiveSizesKey);
  const [lastColorsKey, setLastColorsKey] = useState(effectiveColorsKey);

  // Reset selection state when available variants change using React's render-phase state update pattern
  // This avoids the react-hooks/set-state-in-effect rule and avoids an extra render cycle
  if (effectiveSizesKey !== lastSizesKey) {
    setLastSizesKey(effectiveSizesKey);
    if (allSizes.length > 0 && !allSizes.includes(selectedSize)) {
      setSelectedSize(allSizes[0] ?? "");
    }
  }
  if (effectiveColorsKey !== lastColorsKey) {
    setLastColorsKey(effectiveColorsKey);
    if (allColors.length > 0 && !allColors.some((c) => c.key === selectedColor)) {
      setSelectedColor(allColors[0]?.key ?? "");
    }
  }

  /**
   * Sizes available for currently selected color
   */
  const sizesForColor = useMemo(() => {
    if (!selectedColor) return allSizes;
    const set = new Set<string>();
    availableVariants.filter((v) => v.color === selectedColor).forEach((v) => set.add(v.size));
    return allSizes.filter((s) => set.has(s));
  }, [availableVariants, selectedColor, allSizes]);

  /**
   * Colors available for currently selected size
   */
  const colorsForSize = useMemo(() => {
    if (!selectedSize) return allColors;
    const set = new Set<string>();
    availableVariants.filter((v) => v.size === selectedSize).forEach((v) => set.add(v.color));
    return allColors.filter((c) => set.has(c.key));
  }, [availableVariants, selectedSize, allColors]);

  /**
   * EXACT variant match — no fallback to [0].
   * If selected size+color does not map to a real active+available variant → undefined → button disabled.
   */
  const selectedVariant = useMemo((): PublicProductVariant | undefined => {
    if (!selectedSize || !selectedColor) return undefined;
    return availableVariants.find(
      (v) =>
        v.size.toUpperCase() === selectedSize.toUpperCase() &&
        v.color.toLowerCase() === selectedColor.toLowerCase()
    );
  }, [availableVariants, selectedSize, selectedColor]);

  const handleClick = useCallback(() => {
    if (pending || !selectedVariant) return;
    setPending(true);

    // Compute display price from variant (paise → display string)
    const priceAmount = selectedVariant.pricePaise / 100;
    const currencyCode = product.price.currency || "INR";
    const priceDisplay = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(priceAmount);

    addProduct({
      slug: product.slug,
      variantId: selectedVariant.id,
      sku: selectedVariant.sku,
      size: selectedVariant.size,
      color: selectedVariant.color,
      quantity: 1,
      // Display snapshot for cart rendering (no static CATALOG lookup needed)
      title: product.name,
      image: product.hero.image,
      priceDisplay,
      currency: currencyCode,
      pricePaise: selectedVariant.pricePaise,
    });

    window.setTimeout(() => setPending(false), 400);
  }, [addProduct, pending, product, selectedVariant]);

  return (
    <div className="flex flex-col gap-3">
      {/* Color Selector */}
      {allColors.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase text-white/50">Color:</span>
          <div className="flex gap-1.5 flex-wrap">
            {allColors.map(({ key, display }) => {
              const isAvailable = colorsForSize.some((c) => c.key === key);
              const isSelected = selectedColor === key;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => setSelectedColor(key)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-mono rounded border transition",
                    isSelected
                      ? "bg-white text-black border-white font-medium"
                      : isAvailable
                      ? "bg-black/40 text-white border-white/20 hover:border-white/50"
                      : "bg-black/20 text-white/20 border-white/5 cursor-not-allowed line-through"
                  )}
                >
                  {display}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Selector — derived from actual variant data, not hardcoded list */}
      {allSizes.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase text-white/50">Size:</span>
          <div className="flex gap-1.5 flex-wrap">
            {allSizes.map((sz) => {
              const isAvailableForColor = sizesForColor.includes(sz);
              const isSelected = selectedSize === sz;
              return (
                <button
                  key={sz}
                  type="button"
                  disabled={!isAvailableForColor}
                  onClick={() => setSelectedSize(sz)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-mono rounded border transition",
                    isSelected
                      ? "bg-white text-black border-white font-medium"
                      : isAvailableForColor
                      ? "bg-black/40 text-white border-white/20 hover:border-white/50"
                      : "bg-black/20 text-white/20 border-white/5 cursor-not-allowed line-through"
                  )}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleClick}
        disabled={pending || !selectedVariant}
        className={cn(
          "drop-cta",
          variant === "ghost" && "drop-cta--ghost",
          className,
        )}
      >
        {pending ? "Added" : !selectedVariant ? "Select a variant" : label}
      </button>
    </div>
  );
}
