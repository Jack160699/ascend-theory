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

const points = [
  "Inconsistent standards",
  "Isolated discipline",
  "No accountability loop",
] as const;

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
      className="ascend-section-world relative scroll-mt-28 overflow-hidden border-t border-[color:var(--ascend-border)] bg-ascend-surface py-8 sm:py-12 lg:py-16"
      aria-labelledby="philosophy-heading"
    >
      <SectionContinuity top={false} />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-ascend-canvas via-ascend-surface to-ascend-canvas" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,5,5,0.45)_78%)]" />
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
            className="ascend-type-eyebrow mb-2.5 text-zinc-600 sm:mb-3.5"
          >
            How we think
          </motion.p>
          <motion.h2
            id="philosophy-heading"
            variants={fadeMain}
            className="ascend-headline max-w-[min(40rem,100%)] text-balance font-sans text-[clamp(1.45rem,3.8vw,2.15rem)] font-semibold leading-[1.12] tracking-[-0.03em]"
          >
            Most people do not need more information.
          </motion.h2>
          <motion.p
            variants={fadeMain}
            className="ascend-prose-calm mt-4 max-w-[34rem] text-pretty text-zinc-500 sm:mt-5"
          >
            They need structure strong enough to survive real life.
          </motion.p>

          <ul className="mt-5 max-w-md space-y-2 border-l border-[color:rgba(95,115,134,0.32)] pl-3.5 sm:mt-6 sm:space-y-2.5 sm:pl-4">
            {points.map((p) => (
              <li
                key={p}
                className="text-[13px] leading-snug tracking-tight text-zinc-500 sm:text-[14px]"
              >
                {p}
              </li>
            ))}
          </ul>

          <motion.p
            variants={fadeMain}
            className="mt-5 max-w-[34rem] text-[14px] font-medium leading-snug text-zinc-400 sm:mt-6 sm:text-[15px]"
          >
            Ascend exists to close that gap.
          </motion.p>
        </motion.div>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-ascend-canvas/50 to-transparent sm:h-16"
        aria-hidden
      />
    </section>
  );
}
