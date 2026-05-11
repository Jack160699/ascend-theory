"use client";

import { SectionContinuity } from "@/components/SectionContinuity";
import {
  useIsMobileConversion,
  useRevealViewport,
} from "@/contexts/mobile-conversion";
import {
  SURFACE_SPRING,
  getCardRevealMobile,
  getFadeUpReveal,
  getGridStaggerParent,
  getHeaderStaggerParent,
} from "@/lib/motion";
import { leadLeft, shellStandard } from "@/lib/editorial-layout";
import { cn } from "@/lib/utils";
import { motion, type Variants } from "framer-motion";
import { useMemo } from "react";

const cards: { title: string; line: string }[] = [
  { title: "Inconsistent discipline", line: "Rules bend when the week gets loud." },
  { title: "No accountability", line: "No one who holds the standard with you." },
  { title: "Identity drift", line: "Private habits stop matching who you say you are." },
];

function StallCard({
  title,
  line,
  cardVariants,
  isMobile,
}: (typeof cards)[number] & { cardVariants: Variants; isMobile: boolean }) {
  return (
    <motion.article
      variants={cardVariants}
      whileHover={
        isMobile
          ? undefined
          : { y: -2, transition: SURFACE_SPRING }
      }
      className="flex flex-col rounded-xl border border-[color:var(--ascend-border)] bg-ascend-elevated/95 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-4"
    >
      <h3 className="text-[13px] font-semibold leading-snug text-[rgb(249,249,247)] sm:text-[14px]">
        {title}
      </h3>
      <p className="mt-1.5 text-[11px] leading-snug text-zinc-500 sm:text-[12px]">
        {line}
      </p>
    </motion.article>
  );
}

export function Philosophy() {
  const viewport = useRevealViewport();
  const isMobile = useIsMobileConversion();
  const headerStagger = useMemo(
    () => getHeaderStaggerParent(isMobile),
    [isMobile],
  );
  const fadeMain = useMemo(() => getFadeUpReveal(isMobile), [isMobile]);
  const gridStagger = useMemo(() => getGridStaggerParent(isMobile), [isMobile]);
  const cardVariants = useMemo(
    () => getCardRevealMobile(isMobile),
    [isMobile],
  );

  return (
    <section
      id="philosophy"
      data-conversion-zone="philosophy"
      className="ascend-section-world relative scroll-mt-28 overflow-hidden border-t border-[color:var(--ascend-border)] bg-ascend-surface py-7 sm:py-11 lg:py-14"
      aria-labelledby="philosophy-heading"
    >
      <SectionContinuity top={false} />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-ascend-canvas via-ascend-surface to-ascend-canvas" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,5,6,0.45)_78%)]" />
      </div>

      <div className={shellStandard}>
        <motion.div
          className={leadLeft}
          variants={headerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <motion.p
            variants={fadeMain}
            className="ascend-type-eyebrow mb-2 text-zinc-600 sm:mb-3"
          >
            Why people stall
          </motion.p>
          <motion.h2
            id="philosophy-heading"
            variants={fadeMain}
            className="ascend-type-section-sm ascend-headline"
          >
            You do not need more motivation.
          </motion.h2>
          <motion.p
            variants={fadeMain}
            className="ascend-prose-calm mt-3 max-w-[34rem] text-pretty text-zinc-500 sm:mt-4"
          >
            You need standards that still hold when life gets loud.
          </motion.p>
        </motion.div>

        <motion.div
          className={cn(
            "mt-5 grid max-w-3xl grid-cols-1 gap-2 sm:mt-6 sm:grid-cols-3 sm:gap-3",
          )}
          variants={gridStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          {cards.map((c) => (
            <StallCard
              key={c.title}
              {...c}
              cardVariants={cardVariants}
              isMobile={isMobile}
            />
          ))}
        </motion.div>

        <motion.p
          variants={fadeMain}
          className="mt-5 max-w-[34rem] text-[14px] font-medium leading-snug text-zinc-400 sm:mt-6 sm:text-[15px]"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          Ascend exists to close that gap.
        </motion.p>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-ascend-canvas/45 to-transparent sm:h-14"
        aria-hidden
      />
    </section>
  );
}
