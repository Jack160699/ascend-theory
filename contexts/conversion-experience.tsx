"use client";

import { useAssessmentModal } from "@/contexts/assessment-modal";
import {
  DURATION_OPACITY,
  DURATION_OVERLAY_SLOW,
  TAP_SPRING,
  txReveal,
} from "@/lib/motion";
import { PRIMARY_CTA_LABEL } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STATIC_NOTICE = "We read applications in order.";

type ConversionValue = {
  urgencyMessage: string;
  primaryCtaLabel: string;
  urgencyForTier: (_offset: number) => string;
};

const ConversionContext = createContext<ConversionValue | null>(null);

export function useConversionExperience(): ConversionValue {
  const ctx = useContext(ConversionContext);
  if (!ctx) {
    throw new Error(
      "useConversionExperience requires ConversionExperienceProvider",
    );
  }
  return ctx;
}

export function useConversionExperienceOptional(): ConversionValue | null {
  return useContext(ConversionContext);
}

const stickyCtaButtonClass = cn(
  "ascend-button-primary relative inline-flex min-h-10 w-full items-center justify-center rounded-full bg-white px-5 text-center text-[12px] font-medium leading-snug tracking-tight text-zinc-950",
  "shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_10px_34px_-10px_rgba(255,255,255,0.18)]",
  "transition-[transform,box-shadow,opacity] duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)]",
  "hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_14px_40px_-10px_rgba(255,255,255,0.24)]",
  "active:scale-[0.987]",
);

const stickyCtaButtonDesktopClass = cn(
  stickyCtaButtonClass,
  "w-auto min-h-11 shrink-0 px-6 text-[11px] sm:min-h-11 sm:text-xs",
);

function StickyConversionBar({ ctaLabel }: { ctaLabel: string }) {
  const { openAssessment } = useAssessmentModal();
  const [showMobile, setShowMobile] = useState(false);
  const [showDesktop, setShowDesktop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const h = window.innerHeight;
      setShowMobile(y > Math.min(h * 0.72, 400));
      setShowDesktop(y > Math.max(h * 2.15, 920));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {showMobile ? (
          <motion.div
            className={cn(
              "fixed inset-x-0 bottom-0 z-[60] border-t border-white/[0.07] sm:hidden",
              "bg-zinc-950/78 shadow-[0_-12px_48px_-8px_rgba(0,0,0,0.55)] backdrop-blur-xl backdrop-saturate-150",
              "supports-[padding:max(0px)]:pb-[max(0.35rem,env(safe-area-inset-bottom))]",
            )}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={txReveal(DURATION_OPACITY)}
          >
            <div className="mx-auto max-w-lg px-3 pt-2">
              <motion.button
                type="button"
                onClick={() => openAssessment()}
                className={stickyCtaButtonClass}
                whileTap={{ scale: 0.988 }}
                transition={TAP_SPRING}
              >
                {ctaLabel}
              </motion.button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showDesktop ? (
          <motion.div
            className={cn(
              "fixed inset-x-0 bottom-0 z-[60] hidden border-t border-white/[0.07] sm:block",
              "bg-zinc-950/78 shadow-[0_-16px_56px_-10px_rgba(0,0,0,0.58)] backdrop-blur-xl backdrop-saturate-150",
              "supports-[padding:max(0px)]:pb-[max(0.5rem,env(safe-area-inset-bottom))]",
            )}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 28, opacity: 0 }}
            transition={txReveal(DURATION_OVERLAY_SLOW)}
          >
            <div className="mx-auto flex max-w-6xl items-center justify-end px-4 py-2.5 sm:px-8 lg:px-10">
              <motion.button
                type="button"
                onClick={() => openAssessment()}
                className={stickyCtaButtonDesktopClass}
                whileTap={{ scale: 0.988 }}
                transition={TAP_SPRING}
              >
                {ctaLabel}
              </motion.button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function ConversionChrome() {
  const { primaryCtaLabel } = useConversionExperience();
  return <StickyConversionBar ctaLabel={primaryCtaLabel} />;
}

export function ConversionExperienceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const urgencyForTier = useCallback(() => STATIC_NOTICE, []);

  const value = useMemo<ConversionValue>(
    () => ({
      urgencyMessage: STATIC_NOTICE,
      primaryCtaLabel: PRIMARY_CTA_LABEL,
      urgencyForTier,
    }),
    [urgencyForTier],
  );

  return (
    <ConversionContext.Provider value={value}>
      {children}
      <ConversionChrome />
    </ConversionContext.Provider>
  );
}
