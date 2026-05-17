import { DROP_PRODUCT } from "@/lib/brand/drop-product";
import { DropFade } from "./DropFade";

export function DropDetails() {
  return (
    <DropFade>
      <section className="drop-section" aria-labelledby="drop-details-heading">
        <div className="drop-shell grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
          <div>
            <p className="brand-eyebrow">Details</p>
            <h2 id="drop-details-heading" className="brand-headline mt-6 max-w-[14ch]">
              Built with restraint.
            </h2>
          </div>
          <ul className="drop-details-list">
            {DROP_PRODUCT.details.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </DropFade>
  );
}
