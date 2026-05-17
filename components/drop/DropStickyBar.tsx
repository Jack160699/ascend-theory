"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { DropCartButton } from "./DropCartButton";
import { useDropProduct } from "./DropProductContext";

export function DropStickyBar() {
  const product = useDropProduct();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("drop-hero");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry?.isIntersecting),
      { threshold: 0, rootMargin: "-1px 0px 0px 0px" },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <aside
      className={cn("drop-sticky", visible && "drop-sticky--visible")}
      aria-label="Purchase"
      aria-hidden={!visible}
    >
      <div className="drop-sticky__inner">
        <div className="drop-sticky__meta">
          <p className="drop-sticky__name">{product.name}</p>
          <p className="drop-sticky__drop">{product.dropName}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm font-medium text-white/75 sm:inline">
            {product.price.display}
          </span>
          <DropCartButton />
        </div>
        </div>
    </aside>
  );
}
