"use client";

import { useDropProduct } from "@/components/drop/DropProductContext";
import { useCart } from "@/contexts/cart";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";

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

  const handleClick = useCallback(() => {
    if (pending) return;
    setPending(true);
    addProduct(product.slug);
    window.setTimeout(() => setPending(false), 400);
  }, [addProduct, pending, product.slug]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={cn(
        "drop-cta",
        variant === "ghost" && "drop-cta--ghost",
        className,
      )}
    >
      {pending ? "Added" : label}
    </button>
  );
}
