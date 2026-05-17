"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { DropFade } from "./DropFade";
import { useDropProduct } from "./DropProductContext";

export function DropVisuals() {
  const product = useDropProduct();
  return (
    <section className="drop-section--tight" aria-label="Editorial gallery">
      <ul className="m-0 list-none p-0">
        {product.visuals.map((visual, index) => (
          <li key={visual.src}>
            <DropFade>
              <figure className="drop-visual">
                <div
                  className={cn(
                    "drop-visual__frame",
                    index === 1 && "drop-visual__frame--tall",
                  )}
                >
                  <Image
                    src={visual.src}
                    alt={visual.alt}
                    fill
                    className="object-cover object-center"
                    sizes="100vw"
                  />
                  <figcaption className="drop-visual__caption">
                    {visual.caption}
                  </figcaption>
                </div>
              </figure>
            </DropFade>
          </li>
        ))}
      </ul>
    </section>
  );
}
