"use client";

import { SectionContinuity } from "@/components/SectionContinuity";
import {
  useIsMobileConversion,
  useRevealViewport,
} from "@/contexts/mobile-conversion";
import {
  getFadeUpReveal,
  getGridStaggerParent,
  getHeaderStaggerParent,
} from "@/lib/motion";
import { EDITORIAL_PLACEHOLDERS } from "@/lib/editorial-placeholders";
import { shellStandard } from "@/lib/editorial-layout";
import { motion } from "framer-motion";
import Image from "next/image";
import { useMemo } from "react";

const blocks: {
  title: string;
  line: string;
  src: string;
  alt: string;
}[] = [
  {
    title: "Identity before motivation",
    line: "Who you are shapes what you repeat.",
    src: EDITORIAL_PLACEHOLDERS.silhouette,
    alt: "Focused athlete in low light",
  },
  {
    title: "Structure creates discipline",
    line: "Clear rules beat good intentions.",
    src: EDITORIAL_PLACEHOLDERS.training,
    alt: "Training floor — disciplined work",
  },
  {
    title: "Accountability accelerates growth",
    line: "Someone else sees the slip before you do.",
    src: EDITORIAL_PLACEHOLDERS.focus,
    alt: "Strength training equipment",
  },
  {
    title: "Environment shapes standards",
    line: "The room you train in trains you back.",
    src: EDITORIAL_PLACEHOLDERS.presence,
    alt: "Controlled training environment",
  },
];

export function OneSystem() {
  const viewport = useRevealViewport();
  const isMobile = useIsMobileConversion();
  const headerStagger = useMemo(
    () => getHeaderStaggerParent(isMobile),
    [isMobile],
  );
  const fadeMain = useMemo(() => getFadeUpReveal(isMobile), [isMobile]);
  const gridStagger = useMemo(() => getGridStaggerParent(isMobile), [isMobile]);

  return (
    <section
      id="one-system"
      data-conversion-zone="one-system"
      className="ascend-section-world relative overflow-hidden border-t border-[color:var(--ascend-border)] bg-ascend-canvas py-7 sm:py-11 lg:py-14"
      aria-labelledby="one-system-heading"
    >
      <SectionContinuity />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ascend-surface/50 to-ascend-canvas" aria-hidden />

      <div className={shellStandard}>
        <motion.div
          className="max-w-xl"
          variants={headerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <motion.p
            variants={fadeMain}
            className="ascend-type-eyebrow mb-2 text-zinc-600 sm:mb-3"
          >
            One system
          </motion.p>
          <motion.h2
            id="one-system-heading"
            variants={fadeMain}
            className="ascend-type-section-sm ascend-headline"
          >
            Not a course catalog.
          </motion.h2>
          <motion.p
            variants={fadeMain}
            className="ascend-prose-calm mt-3 text-zinc-500 sm:mt-4"
          >
            One private lane — training, presence, and discipline together.
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-5 grid grid-cols-1 gap-2 sm:mt-6 sm:grid-cols-2 sm:gap-3"
          variants={gridStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          {blocks.map((b) => (
            <motion.article
              key={b.title}
              variants={fadeMain}
              className="group flex max-h-[240px] min-h-0 flex-col overflow-hidden rounded-xl border border-[color:var(--ascend-border)] bg-ascend-elevated/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:max-h-[220px] lg:max-h-[240px]"
            >
              <div className="relative aspect-[2/1] max-h-[120px] w-full shrink-0 sm:max-h-[112px]">
                <Image
                  src={b.src}
                  alt={b.alt}
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                  sizes="(max-width:640px) 100vw, 50vw"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ascend-elevated via-transparent to-transparent"
                  aria-hidden
                />
              </div>
              <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-3.5">
                <h3 className="text-[12px] font-semibold leading-snug text-[rgb(249,249,247)] sm:text-[13px]">
                  {b.title}
                </h3>
                <p className="mt-1 text-[11px] leading-snug text-zinc-500 sm:text-[12px]">
                  {b.line}
                </p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
