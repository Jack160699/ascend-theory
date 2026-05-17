"use client";

import { useCart } from "@/contexts/cart";
import { cn } from "@/lib/utils";

type CartNavButtonProps = {
  className?: string;
};

export function CartNavButton({ className }: CartNavButtonProps) {
  const { itemCount, openDrawer, hydrated } = useCart();

  return (
    <button
      type="button"
      className={cn("cart-nav-btn", className)}
      onClick={openDrawer}
      aria-label={
        itemCount > 0 ? `Open cart, ${itemCount} items` : "Open cart"
      }
    >
      <span className="cart-nav-btn__label">Cart</span>
      {hydrated && itemCount > 0 ? (
        <span className="cart-nav-btn__count" aria-hidden>
          {itemCount}
        </span>
      ) : null}
    </button>
  );
}
