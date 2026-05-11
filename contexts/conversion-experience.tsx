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
  "relative inline-flex h-[52px] w-full max-w-md items-center justify-center rounded-full px-6 text-center text-[13px] font-medium leading-none tracking-tight text-zinc-950",
  "bg-white/[0.92] shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_10px_32px_-12px_rgba(0,0,0,0.45)]",
  "backdrop-blur-md backdrop-saturate-150",
  "transition-[transform,box-shadow,opacity] duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)]",
  "active:scale-[0.987]",
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
            "pointer-events-none flex justify-center px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1",
          )}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={txReveal(DURATION_OPACITY)}
        >
          <div className="pointer-events-auto w-full max-w-md">
            <motion.button
              type="button"
              onClick={() => openAssessment()}
              className={stickyCtaButtonClass}
              whileTap={{ scale: 0.988 }}
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
