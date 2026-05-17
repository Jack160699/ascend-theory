"use client";

import { DropFade } from "./DropFade";
import { useDropProduct } from "./DropProductContext";

export function DropScarcity() {
  const product = useDropProduct();
  const { scarcity } = product;
  const pct = Math.round(
    (scarcity.stockRemaining / scarcity.totalAllocation) * 100,
  );

  return (
    <DropFade>
      <section className="drop-section border-t border-white/[0.07]" aria-labelledby="drop-scarcity-heading">
        <div className="drop-shell">
          <div className="drop-scarcity-grid">
            <div>
              <p className="brand-eyebrow">Allocation</p>
              <h2 id="drop-scarcity-heading" className="brand-headline mt-6">
                When it closes, it closes.
              </h2>
              <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
                {scarcity.labels.map((label) => (
                  <li
                    key={label}
                    className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/55"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="brand-prose-tight uppercase tracking-[0.22em] text-white/45">
                Remaining allocation
              </p>
              <p className="mt-3 text-[clamp(2rem,4vw,2.75rem)] font-medium tracking-[-0.03em] text-white/90">
                {scarcity.stockRemaining}
                <span className="text-lg text-white/35"> / {scarcity.totalAllocation}</span>
              </p>
              <div className="drop-stock-bar" role="presentation" aria-hidden>
                <div
                  className="drop-stock-bar__fill"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </DropFade>
  );
}
