"use client";

import { SectionContinuity } from "@/components/SectionContinuity";
import {
  useIsMobileConversion,
  useRevealViewport,
} from "@/contexts/mobile-conversion";
import { getFadeUpReveal, getHeaderStaggerParent } from "@/lib/motion";
import { leadLeft, shellStandard } from "@/lib/editorial-layout";
import { motion } from "framer-motion";
import { useMemo } from "react";

const points: { title: string; line: string }[] = [
  { title: "Inconsistent discipline", line: "Rules bend when the week gets loud." },
  { title: "No accountability", line: "No one who holds the standard with you." },
  { title: "Identity drift", line: "Habits stop matching who you say you are." },
];

export function Philosophy() {
  const viewport = useRevealViewport();
  const isMobile = useIsMobileConversion();
  const headerStagger = useMemo(
    () => getHeaderStaggerParent(isMobile),
    [isMobile],
  );
  const fadeMain = useMemo(() => getFadeUpReveal(isMobile), [isMobile]);

  return (
    <section
      id="philosophy"
      data-conversion-zone="philosophy"
      className="ascend-section-world relative scroll-mt-28 overflow-hidden border-t border-[color:var(--ascend-border)] bg-ascend-surface py-6 sm:py-9 lg:py-11"
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
            className="ascend-type-eyebrow mb-1.5 text-zinc-600 sm:mb-2"
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
            className="ascend-prose-calm mt-2 max-w-[34rem] text-pretty text-zinc-500 sm:mt-3"
          >
            You need standards that still hold when life gets loud.
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-4 max-w-xl border-t border-white/[0.06] pt-4 sm:mt-5 sm:pt-5"
          variants={headerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <ul className="space-y-3 sm:space-y-3.5">
            {points.map((p, i) => (
              <motion.li
                key={p.title}
                variants={fadeMain}
                className="flex gap-3 border-l border-white/[0.08] pl-3 sm:pl-4"
              >
                <span className="font-mono text-[10px] font-medium text-zinc-600 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-[13px] font-medium leading-snug text-zinc-200">
                    {p.title}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-zinc-500 sm:text-[12px]">
                    {p.line}
                  </p>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.p
          variants={fadeMain}
          className="mt-4 max-w-[34rem] text-[13px] font-medium leading-snug text-zinc-400 sm:mt-5 sm:text-[14px]"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          Ascend exists to close that gap. One private system — presence,
          accountability, and lifestyle discipline — with training as one
          supporting layer, not a course catalog.
        </motion.p>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-ascend-canvas/45 to-transparent sm:h-12"
        aria-hidden
      />
    </section>
  );
}
