"use client";

import Image from "next/image";
import { DropCartButton } from "./DropCartButton";
import { useDropProduct } from "./DropProductContext";

export function DropHero() {
  const product = useDropProduct();
  return (
    <section id="drop-hero" className="drop-hero" aria-labelledby="drop-product-title">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src={product.hero.image}
          alt={product.hero.alt}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="brand-vignette" />
        <div className="brand-depth-fade" />
      </div>

      <div className="drop-shell drop-hero__content">
        <p className="brand-eyebrow">{product.dropName}</p>
        <h1 id="drop-product-title" className="drop-hero__title mt-6">
          {product.productName}
        </h1>
        <p className="brand-body mt-6 max-w-md text-pretty">{product.tagline}</p>
        <div className="drop-hero__actions">
          <span className="drop-price">{product.price.display}</span>
          <DropCartButton />
        </div>
      </div>
    </section>
  );
}
