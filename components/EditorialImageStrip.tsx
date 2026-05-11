"use client";

import { AscendImage } from "@/components/AscendImage";
import { cn } from "@/lib/utils";

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
  caption,
  className,
  aspectClassName = "aspect-[2/1] min-h-[8.5rem] sm:aspect-[21/9] sm:min-h-0",
  priority = false,
}: EditorialImageStripProps) {
  return (
    <figure
      className={cn(
        "relative w-full overflow-hidden rounded-[1.05rem] border border-[color:var(--ascend-border)] bg-zinc-950 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset,0_0_0_1px_rgba(95,115,134,0.06)_inset]",
        className,
      )}
    >
      <div className={cn("relative w-full", aspectClassName)}>
        <AscendImage
          src={src}
          alt={alt}
          fill
          className="object-cover object-center"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 72rem"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ascend-canvas/90 via-ascend-surface/35 to-transparent max-sm:from-ascend-canvas/85"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 mix-blend-soft-light bg-[color:rgba(95,115,134,0.04)]"
          aria-hidden
        />
        {caption ? (
          <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-3 py-2 sm:px-5 sm:py-3">
            <p className="text-[9px] font-medium uppercase leading-relaxed tracking-[0.2em] text-zinc-600 sm:text-[10px] sm:tracking-[0.22em]">
              {caption}
            </p>
          </figcaption>
        ) : null}
      </div>
    </figure>
  );
}
