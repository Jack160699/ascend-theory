"use client";

import { SectionContinuity } from "@/components/SectionContinuity";
import {
  useIsMobileConversion,
  useRevealViewport,
} from "@/contexts/mobile-conversion";
import {
  getCardRevealMobile,
  getFadeUpReveal,
  getGridStaggerParent,
  getHeaderStaggerParent,
} from "@/lib/motion";
import { leadLeft, shellStandard } from "@/lib/editorial-layout";
import { cn } from "@/lib/utils";
import { motion, type Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ClipboardPenLine, MessageCircle, ScanLine } from "lucide-react";
import { useMemo } from "react";

const steps: readonly {
  step: string;
  title: string;
  line: string;
  icon: LucideIcon;
}[] = [
  {
    step: "01",
    title: "Apply privately",
    line: "Short context. We read it before we reply.",
    icon: ClipboardPenLine,
  },
  {
    step: "02",
    title: "We review manually",
    line: "Fit and pace — not volume.",
    icon: ScanLine,
  },
  {
    step: "03",
    title: "We continue on WhatsApp",
    line: "Direct thread. Clear next steps.",
    icon: MessageCircle,
  },
];

function StepBlock({
  step,
  title,
  line,
  icon: Icon,
  cardVariants,
}: (typeof steps)[number] & { cardVariants: Variants }) {
  return (
    <motion.article
      variants={cardVariants}
      className="group relative flex min-w-0 flex-col gap-2 rounded-xl border border-[color:var(--ascend-border)] bg-ascend-elevated/95 p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.025)_inset] backdrop-blur-md sm:gap-2.5 sm:rounded-[1.05rem] sm:p-3.5 lg:p-4"
    >
      <div className="flex items-center gap-2.5">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-600">
          {step}
        </span>
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-[color:var(--ascend-border)] bg-ascend-surface/90 text-zinc-500 transition-colors duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:border-[color:rgba(95,115,134,0.28)] group-hover:text-zinc-300 sm:size-8">
          <Icon className="size-[15px]" strokeWidth={1.35} />
        </div>
      </div>
      <div className="min-w-0">
        <h3 className="text-[12px] font-semibold leading-snug tracking-[-0.012em] text-[rgb(249,249,247)] sm:text-[13px]">
          {title}
        </h3>
        <p className="mt-0.5 text-[10px] leading-snug text-zinc-600 sm:mt-1 sm:text-[11px] sm:leading-relaxed">
          {line}
        </p>
      </div>
    </motion.article>
  );
}

export function Journey() {
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
      id="journey"
      data-conversion-zone="journey"
      className="ascend-section-world relative scroll-mt-28 overflow-hidden border-t border-[color:var(--ascend-border)] bg-ascend-canvas py-8 sm:py-12 lg:py-16"
      aria-labelledby="journey-heading"
    >
      <SectionContinuity />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-ascend-surface/60 via-ascend-canvas to-ascend-surface/60" />
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
            How entry works
          </motion.p>
          <motion.h2
            id="journey-heading"
            variants={fadeMain}
            className="ascend-type-section-sm ascend-headline"
          >
            Three steps. No theater.
          </motion.h2>
        </motion.div>

        <motion.div
          className={cn(
            "mt-5 grid w-full max-w-5xl gap-2 sm:mt-6 sm:gap-3",
            "grid-cols-1 lg:grid-cols-3 lg:gap-4",
          )}
          variants={gridStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          {steps.map((s) => (
            <StepBlock key={s.step} {...s} cardVariants={cardVariants} />
          ))}
        </motion.div>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-ascend-surface/35 to-transparent sm:h-16"
        aria-hidden
      />
    </section>
  );
}
