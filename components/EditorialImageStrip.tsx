"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

type EditorialImageStripProps = {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  aspectClassName?: string;
  priority?: boolean;
};

export function EditorialImageStrip({
  src,
  alt,
  caption = "Reference imagery · replace with Ascend assets",
  className,
  aspectClassName = "aspect-[2/1] min-h-[10.5rem] sm:aspect-[21/9] sm:min-h-0",
  priority = false,
}: EditorialImageStripProps) {
  return (
    <figure
      className={cn(
        "relative w-full overflow-hidden rounded-[1.05rem] border border-white/[0.08] bg-zinc-950 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset]",
        className,
      )}
    >
      <div className={cn("relative w-full", aspectClassName)}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover object-center"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 72rem"
          priority={priority}
          decoding="async"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/25"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-zinc-950/25 mix-blend-soft-light"
          aria-hidden
        />
        <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-3 py-2.5 sm:px-5 sm:py-3.5">
          <p className="text-[9px] font-medium uppercase leading-relaxed tracking-[0.2em] text-zinc-500 sm:text-[10px] sm:tracking-[0.22em]">
            {caption}
          </p>
        </figcaption>
      </div>
    </figure>
  );
}
