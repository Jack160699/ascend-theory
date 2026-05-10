import { cn } from "@/lib/utils";

type SectionContinuityProps = {
  /** Incoming blend from the previous section (dark lift into this canvas). */
  top?: boolean;
  /** Outgoing blend toward the next section (soft fall into depth). */
  bottom?: boolean;
  className?: string;
};

/**
 * Purely decorative layers for cinematic scroll continuity between sections.
 * Keeps lighting and depth language consistent site-wide.
 */
export function SectionContinuity({
  top = true,
  bottom = true,
  className,
}: SectionContinuityProps) {
  return (
    <>
      {top ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 z-[2] h-[min(7rem,15dvh)] sm:h-[min(7.5rem,15dvh)]",
            "bg-gradient-to-b from-black/48 via-black/12 to-transparent",
            className,
          )}
          aria-hidden
        />
      ) : null}
      {bottom ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[min(8rem,16dvh)] sm:h-[min(8.5rem,17dvh)]",
            "bg-gradient-to-t from-black/44 via-black/11 to-transparent",
            className,
          )}
          aria-hidden
        />
      ) : null}
    </>
  );
}
