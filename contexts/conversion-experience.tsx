"use client";

import { useAssessmentModal } from "@/contexts/assessment-modal";
import { DURATION_OPACITY, TAP_SPRING, txReveal } from "@/lib/motion";
import { STICKY_MOBILE_CTA_LABEL } from "@/lib/whatsapp";
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

/** Empty = no ribbon / urgency strip (avoid repeating intake copy site-wide). */
const STATIC_NOTICE = "";

type ConversionValue = {
  urgencyMessage: string;
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
  "relative inline-flex h-11 max-h-11 w-full max-w-[min(100%,17.5rem)] items-center justify-center rounded-md px-5 text-center text-[11px] font-medium leading-none tracking-[0.02em] text-zinc-200",
  "border border-white/[0.09] bg-zinc-950/[0.55] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
  "backdrop-blur-md backdrop-saturate-125",
  "transition-[transform,opacity,background-color] duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)]",
  "active:scale-[0.995]",
);

function StickyConversionBar() {
  const { openAssessment, isOpen } = useAssessmentModal();
  const [showMobile, setShowMobile] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const threshold = window.innerHeight * 0.35;
      setShowMobile(y > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const visible = showMobile && !isOpen;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className={cn(
            "fixed inset-x-0 bottom-0 z-[60] sm:hidden",
            "pointer-events-none flex justify-center px-4 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-0.5",
          )}
          initial={{ opacity: 0, y: 7 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={txReveal(DURATION_OPACITY)}
        >
          <div className="pointer-events-auto w-full max-w-[17.5rem]">
            <motion.button
              type="button"
              onClick={() => openAssessment()}
              className={stickyCtaButtonClass}
              whileTap={{ scale: 0.995 }}
              transition={TAP_SPRING}
            >
              {STICKY_MOBILE_CTA_LABEL}
            </motion.button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function ConversionChrome() {
  return <StickyConversionBar />;
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
