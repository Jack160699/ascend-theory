"use client";

import { SectionContinuity } from "@/components/SectionContinuity";
import { useAssessmentModal } from "@/contexts/assessment-modal";
import {
  useIsMobileConversion,
  useRevealViewport,
} from "@/contexts/mobile-conversion";
import {
  DURATION_REVEAL,
  TAP_SPRING,
  getFadeUpReveal,
  getHeaderStaggerParent,
  txReveal,
} from "@/lib/motion";
import { leadLeft, shellStandard } from "@/lib/editorial-layout";
import { FINAL_SECTION_CTA_LABEL } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useMemo } from "react";

export function FinalDecisionCTA() {
  const { openAssessment } = useAssessmentModal();
  const viewport = useRevealViewport();
  const isMobile = useIsMobileConversion();
  const headerStagger = useMemo(
    () => getHeaderStaggerParent(isMobile),
    [isMobile],
  );
  const fadeMain = useMemo(() => getFadeUpReveal(isMobile), [isMobile]);

  return (
    <section
      id="final-decision-cta"
      data-conversion-zone="final"
      className="ascend-section-world relative scroll-mt-28 overflow-hidden border-t border-[color:var(--ascend-border)] bg-ascend-canvas py-8 sm:py-16 lg:py-20"
      aria-labelledby="final-decision-cta-heading"
    >
      <SectionContinuity />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-ascend-surface/80 via-ascend-canvas to-ascend-surface/80" />
        <div className="absolute left-1/2 top-[10%] h-[min(42vh,20rem)] w-[min(100%,44rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(95,115,134,0.08),transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,5,6,0.5)_78%)]" />
      </div>

      <div className={shellStandard}>
        <motion.div
          className={cn(leadLeft, "max-w-[min(44rem,100%)] lg:pr-8")}
          variants={headerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <motion.h2
            id="final-decision-cta-heading"
            variants={fadeMain}
            className="ascend-type-section-sm ascend-headline sm:ascend-type-section"
          >
            The next version of you is built by standards — not motivation.
          </motion.h2>
          <motion.p
            variants={fadeMain}
            className="ascend-prose-calm mt-5 max-w-[36rem] text-pretty text-zinc-500 sm:mt-6"
          >
            Most people stay in negotiation with themselves for years. A
            different environment changes that faster.
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-8 sm:mt-10"
          initial={{ opacity: 0, y: isMobile ? 10 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={txReveal(DURATION_REVEAL, isMobile ? 0.12 : 0.2)}
        >
          <motion.button
            type="button"
            onClick={() => openAssessment()}
            className={cn(
              "ascend-button-primary inline-flex min-h-11 w-full max-w-sm items-center justify-center rounded-full bg-white px-7 text-[13px] font-medium tracking-[-0.01em] text-zinc-950 sm:min-h-12 sm:w-auto sm:px-8 sm:text-sm",
            )}
            whileHover={{ scale: 1.012 }}
            whileTap={{ scale: 0.988 }}
            transition={TAP_SPRING}
          >
            {FINAL_SECTION_CTA_LABEL}
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
