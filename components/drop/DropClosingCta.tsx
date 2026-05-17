"use client";

import { DropCartButton } from "./DropCartButton";
import { DropFade } from "./DropFade";
import { useDropProduct } from "./DropProductContext";

export function DropClosingCta() {
  const product = useDropProduct();
  return (
    <DropFade>
      <section
        className="drop-section border-t border-white/[0.07] pb-[max(6rem,calc(5rem+env(safe-area-inset-bottom)))]"
        aria-label="Purchase"
      >
        <div className="drop-shell flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="brand-eyebrow">{product.dropName}</p>
            <p className="brand-headline mt-4">{product.productName}</p>
            <p className="drop-price mt-3">{product.price.display}</p>
          </div>
          <DropCartButton />
        </div>
      </section>
    </DropFade>
  );
}
