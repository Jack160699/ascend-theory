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

  const availableVariants = useMemo(() => {
    return (product.variants || []).filter(
      (v) => v.isActive && v.availabilityStatus === "available"
    );
  }, [product.variants]);

  // Derive unique sizes & colors
  const availableSizes = useMemo(() => {
    const set = new Set<string>();
    availableVariants.forEach((v) => set.add(v.size));
    return Array.from(set);
  }, [availableVariants]);

  const availableColors = useMemo(() => {
    const set = new Set<string>();
    availableVariants.forEach((v) => set.add(v.colorDisplay || v.color));
    return Array.from(set);
  }, [availableVariants]);

  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] || "M");
  const [selectedColor, setSelectedColor] = useState<string>(availableColors[0] || "black");

  // Find exact active+available variant
  const selectedVariant = useMemo((): PublicProductVariant | undefined => {
    return availableVariants.find((v) => {
      const matchSize = v.size.toUpperCase() === selectedSize.toUpperCase();
      const matchColor =
        v.color.toLowerCase() === selectedColor.toLowerCase() ||
        (v.colorDisplay && v.colorDisplay.toLowerCase() === selectedColor.toLowerCase());
      return matchSize && matchColor;
    }) || availableVariants[0];
  }, [availableVariants, selectedSize, selectedColor]);

  const handleClick = useCallback(() => {
    if (pending || !selectedVariant) return;
    setPending(true);
    addProduct({
      slug: product.slug,
      sku: selectedVariant.sku,
      variantId: selectedVariant.id,
      size: selectedVariant.size,
      color: selectedVariant.color,
      quantity: 1,
    });
    window.setTimeout(() => setPending(false), 400);
  }, [addProduct, pending, product.slug, selectedVariant]);

  return (
    <div className="flex flex-col gap-3">
      {availableSizes.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase text-white/50">Size:</span>
          <div className="flex gap-1.5">
            {["S", "M", "L", "XL"].map((sz) => {
              const isAvailable = availableVariants.some((v) => v.size.toUpperCase() === sz);
              const isSelected = selectedSize.toUpperCase() === sz;
              return (
                <button
                  key={sz}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => setSelectedSize(sz)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-mono rounded border transition",
                    isSelected
                      ? "bg-white text-black border-white font-medium"
                      : isAvailable
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
        {pending ? "Added" : !selectedVariant ? "Unavailable" : label}
      </button>
    </div>
  );
}
