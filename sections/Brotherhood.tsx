"use client";

import { AscendImage } from "@/components/AscendImage";
import { SectionContinuity } from "@/components/SectionContinuity";
import {
  useIsMobileConversion,
  useRevealViewport,
} from "@/contexts/mobile-conversion";
import { CINEMATIC_ASSETS } from "@/lib/cinematic-assets";
import { CINEMATIC_IMAGE_CLASS } from "@/lib/cinematic-composition";
import {
  DURATION_REVEAL,
  getFadeUpReveal,
  getHeaderStaggerParent,
  txReveal,
} from "@/lib/motion";
import { cinematicSceneRootProps } from "@/lib/cinematic-v2/cinematic-layout";
import { leadLeft, shellStandard } from "@/lib/editorial-layout";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useMemo } from "react";

export function Brotherhood() {
  const viewport = useRevealViewport();
  const isMobile = useIsMobileConversion();
  const headerStagger = useMemo(
    () => getHeaderStaggerParent(isMobile),
    [isMobile],
  );
  const fadeMain = useMemo(() => getFadeUpReveal(isMobile), [isMobile]);

  return (
    <section
      id="brotherhood"
      {...cinematicSceneRootProps("brotherhood")}
      data-conversion-zone="brotherhood"
      className="ascend-section-world relative scroll-mt-28 overflow-hidden border-t border-[color:var(--ascend-border)] bg-ascend-canvas"
      aria-labelledby="brotherhood-heading"
    >
      <SectionContinuity />
      <div className="relative min-h-[min(72vh,36rem)] w-full sm:min-h-[min(78vh,40rem)]">
        <div className="absolute inset-0" data-cinematic-parallax="12">
          <AscendImage
            src={CINEMATIC_ASSETS.brotherhoodWalk}
            alt="Two members walking together — calm conversation, shared standard"
            fill
            className={CINEMATIC_IMAGE_CLASS.brotherhoodWalk}
            sizes="100vw"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/45 sm:bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-ascend-canvas via-black/36 to-black/32 sm:via-black/25 sm:to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-black/35" />
        </div>

        <div className={cn(shellStandard, "relative z-10 flex min-h-[min(72vh,36rem)] flex-col justify-end pb-10 pt-28 sm:min-h-[min(78vh,40rem)] sm:justify-center sm:pb-16 sm:pt-24")}>
          <motion.div
            className={cn(leadLeft, "max-w-[min(36rem,100%)]")}
            variants={headerStagger}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          >
            <motion.p
              variants={fadeMain}
              className="ascend-type-eyebrow mb-2 text-zinc-400 sm:mb-3"
            >
              Brotherhood
            </motion.p>
            <motion.h2
              id="brotherhood-heading"
              variants={fadeMain}
              className="ascend-type-section-sm ascend-headline text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]"
            >
              Growth beside someone who reads the room the same way.
            </motion.h2>
            <motion.p
              variants={fadeMain}
              className="ascend-prose-calm mt-3 max-w-[34rem] text-pretty text-zinc-300/95 sm:mt-4 sm:text-zinc-400/95"
            >
              Not a network. A small field of people choosing emotional
              intelligence, directness, and quiet ambition — without performance.
            </motion.p>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="relative z-10 border-t border-white/[0.06] bg-ascend-surface/95 backdrop-blur-sm"
        initial={{ opacity: 0, y: 7 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport}
        transition={txReveal(DURATION_REVEAL, 0.14)}
      >
        <div className={cn(shellStandard, "py-6 sm:py-8")}>
          <p className="max-w-2xl text-[12px] leading-relaxed text-zinc-500 sm:text-[13px]">
            No badges, no optics — standards first, then everything else.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
