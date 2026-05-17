import { DROP_PRODUCT } from "@/lib/brand/drop-product";
import Image from "next/image";
import { DropCartButton } from "./DropCartButton";

export function DropHero() {
  return (
    <section id="drop-hero" className="drop-hero" aria-labelledby="drop-product-title">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src={DROP_PRODUCT.hero.image}
          alt={DROP_PRODUCT.hero.alt}
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
        <p className="brand-eyebrow">{DROP_PRODUCT.dropName}</p>
        <h1 id="drop-product-title" className="drop-hero__title mt-6">
          {DROP_PRODUCT.productName}
        </h1>
        <p className="brand-body mt-6 max-w-md text-pretty">{DROP_PRODUCT.tagline}</p>
        <div className="drop-hero__actions">
          <span className="drop-price">{DROP_PRODUCT.price.display}</span>
          <DropCartButton />
        </div>
      </div>
    </section>
  );
}
