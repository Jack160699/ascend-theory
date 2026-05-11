"use client";

import { AscendImage } from "@/components/AscendImage";
import { useAssessmentModal } from "@/contexts/assessment-modal";
import {
  useIsMobileConversion,
  useRevealViewport,
} from "@/contexts/mobile-conversion";
import { CINEMATIC_ASSETS } from "@/lib/cinematic-assets";
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
      id="assessment"
      data-conversion-zone="final"
      className="ascend-section-world relative scroll-mt-28 overflow-hidden border-t border-[color:var(--ascend-border)] py-10 sm:py-16 lg:py-20"
      aria-labelledby="final-decision-cta-heading"
    >
      <div className="absolute inset-0" aria-hidden>
        <AscendImage
          src={CINEMATIC_ASSETS.lifestyleRooftopStanding}
          alt=""
          fill
          className="object-cover object-[center_32%] sm:object-[center_28%]"
          sizes="100vw"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/55 sm:bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-ascend-canvas via-black/40 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,transparent_0%,rgba(5,5,6,0.65)_70%)]" />
      </div>

      <div className={cn(shellStandard, "relative z-10")}>
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
            className="ascend-type-section-sm ascend-headline text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] sm:ascend-type-section"
          >
            The next version of you is built intentionally.
          </motion.h2>
          <motion.p
            variants={fadeMain}
            className="ascend-prose-calm mt-4 max-w-[36rem] text-pretty text-zinc-300/95 sm:mt-5 sm:text-zinc-400/95"
          >
            Most people stay inside familiar standards. A smaller group decides
            differently.
          </motion.p>
          <motion.p
            variants={fadeMain}
            className="mt-4 text-[12px] font-medium leading-snug text-zinc-400 sm:mt-5 sm:text-[13px]"
          >
            Private applications are reviewed personally.
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-7 sm:mt-9"
          initial={{ opacity: 0, y: isMobile ? 10 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={txReveal(DURATION_REVEAL, isMobile ? 0.12 : 0.2)}
        >
          <motion.button
            type="button"
            onClick={() => openAssessment()}
            className={cn(
              "ascend-button-primary inline-flex min-h-11 w-full max-w-sm items-center justify-center rounded-full bg-white px-7 text-[13px] font-medium tracking-[-0.01em] text-zinc-950 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_18px_48px_-12px_rgba(0,0,0,0.45)] sm:min-h-12 sm:w-auto sm:px-8 sm:text-sm",
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
