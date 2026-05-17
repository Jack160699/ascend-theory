import { WEARABLE_COLLECTIONS } from "@/lib/data/wearables";
import { BRAND_ROUTES } from "@/lib/brand/routes";
import { brandMotionAttr } from "@/lib/brand/motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

import type { WearableCollection } from "@/lib/data/wearables";

function WearableEditorialRow({
  collection,
  reverse,
}: {
  collection: WearableCollection;
  reverse: boolean;
}) {
  return (
    <li
      className={cn(
        "brand-wearables-row group",
        reverse && "brand-wearables-row--reverse",
      )}
    >
      <article className="brand-wearables-row__inner">
        <Link
          href={BRAND_ROUTES.drop(collection.products[0]!.slug)}
          className="brand-wearables-row__media block"
        >
          <Image
            src={collection.image}
            alt={collection.products[0]?.name ?? collection.title}
            fill
            className="brand-wearables-row__image object-cover object-center"
            sizes="(max-width: 1023px) 100vw, 48vw"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent lg:bg-gradient-to-r lg:from-black/45 lg:via-transparent lg:to-transparent"
            aria-hidden
          />
        </Link>

        <div className="brand-wearables-row__copy">
          <p className="brand-eyebrow text-white/50">Collection</p>
          <h3 className="brand-headline mt-5 max-w-[12ch]">
            {collection.title}
          </h3>
          <p className="brand-body mt-6 max-w-md text-pretty">{collection.line}</p>
          <ul className="brand-wearables-row__products mt-6 space-y-2">
            {collection.products.map((product) => (
              <li key={product.slug}>
                <Link
                  href={BRAND_ROUTES.drop(product.slug)}
                  className="brand-wearables-row__product-link"
                >
                  <span>{product.name}</span>
                  <span className="brand-wearables-row__product-price">
                    {product.price.display}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </li>
  );
}

export function BrandWearables() {
  return (
    <section
      {...brandMotionAttr("wearables")}
      data-brand-section
      className="brand-section--compact brand-wearables-section border-t border-white/[0.06] py-0"
      aria-label="Wearable collections"
    >
      <div className="brand-shell relative z-10">
        <ul className="brand-wearables-list mt-0 sm:mt-4">
          {WEARABLE_COLLECTIONS.map((collection, i) => (
            <WearableEditorialRow
              key={collection.id}
              collection={collection}
              reverse={i % 2 === 1}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
