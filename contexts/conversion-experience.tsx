"use client";

import {
  DURATION_OPACITY,
  DURATION_OVERLAY,
  DURATION_OVERLAY_SLOW,
  DURATION_REVEAL,
  txReveal,
} from "@/lib/motion";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export const URGENCY_MESSAGES = [
  "Current intake nearly full",
  "Limited onboarding slots this month",
  "Priority mentor allocation active",
  "Current transformation cohort closing soon",
  "Private applications under review",
  "Next onboarding window opens soon",
  "Current pricing reserved for early allocation",
  "Transformation applications closing this week",
] as const;

const MOBILE_PHILOSOPHY_LINES = [
  "Structure compounds quietly.",
  "Identity follows repeated standards.",
  "Discipline creates self-respect.",
] as const;

export type ConversionZone =
  | "hero"
  | "philosophy"
  | "tension"
  | "programs"
  | "journey"
  | "pricing"
  | "mentorship"
  | "assessment"
  | "final"
  | "proof";

const ZONE_ORDER: ConversionZone[] = [
  "hero",
  "philosophy",
  "tension",
  "programs",
  "journey",
  "pricing",
  "mentorship",
  "assessment",
  "final",
  "proof",
];

const CTA_BY_ZONE: Record<ConversionZone, string> = {
  hero: "Begin Your Transformation",
  philosophy: "Read The Ascend Philosophy",
  tension: "Structure Creates Identity",
  programs: "Select Your Transformation Depth",
  journey: "See The Ascent Sequence",
  pricing: "Reserved Mentor Allocation",
  mentorship: "Understand Mentorship Depth",
  assessment: "Begin Private Assessment",
  final: "Begin Private Assessment",
  proof: "Transformation Leaves Evidence",
};

type ConversionValue = {
  urgencyMessage: string;
  urgencyIndex: number;
  activeZone: ConversionZone;
  primaryCtaLabel: string;
  urgencyForTier: (offset: number) => string;
};

const ConversionContext = createContext<ConversionValue | null>(null);

function computeActiveZone(): ConversionZone {
  if (typeof window === "undefined") return "hero";
  const focalY = window.innerHeight * 0.34;
  let best: ConversionZone = "hero";
  let bestDist = Number.POSITIVE_INFINITY;
  for (const id of ZONE_ORDER) {
    const el = document.querySelector<HTMLElement>(
      `[data-conversion-zone="${id}"]`,
    );
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (r.bottom < 48 || r.top > window.innerHeight - 48) continue;
    const mid = (r.top + r.bottom) / 2;
    const dist = Math.abs(mid - focalY);
    if (dist < bestDist) {
      bestDist = dist;
      best = id;
    }
  }
  return best;
}

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

function StickyConversionBar({
  urgencyMessage,
  ctaLabel,
}: {
  urgencyMessage: string;
  ctaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const hero = document.querySelector<HTMLElement>(
        '[data-conversion-zone="hero"]',
      );
      if (!hero) {
        setOpen(window.scrollY > 280);
        return;
      }
      const heroBottom = hero.getBoundingClientRect().bottom;
      setOpen(heroBottom < window.innerHeight * 0.5);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => {
      setLineIndex((i) => (i + 1) % MOBILE_PHILOSOPHY_LINES.length);
    }, 5200);
    return () => window.clearInterval(id);
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[60] border-t border-white/[0.08] bg-zinc-950/82 px-3 py-2.5 shadow-[0_-24px_80px_-20px_rgba(0,0,0,0.78)] backdrop-blur-xl supports-[padding:max(0px)]:pb-[max(0.65rem,env(safe-area-inset-bottom))] sm:hidden"
            initial={{ y: 44, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={txReveal(DURATION_OVERLAY)}
          >
            <div className="mx-auto flex max-w-md items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-2.5 py-2 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]">
              <div className="min-w-0 flex-1 pl-1">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={MOBILE_PHILOSOPHY_LINES[lineIndex]}
                    className="truncate font-serif text-[11px] font-light italic leading-snug text-zinc-500"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={txReveal(DURATION_OPACITY)}
                  >
                    {MOBILE_PHILOSOPHY_LINES[lineIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
              <Link
                href="#pricing"
                className={cn(
                  "inline-flex h-10 min-h-10 shrink-0 items-center justify-center rounded-full bg-white px-4 text-center text-[11px] font-medium tracking-tight text-zinc-950",
                  "shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_10px_34px_-10px_rgba(255,255,255,0.2)]",
                )}
              >
                Begin Assessment
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="fixed inset-x-0 bottom-0 z-[60] hidden border-t border-white/[0.08] bg-zinc-950/80 px-4 py-3 shadow-[0_-24px_80px_-20px_rgba(0,0,0,0.75)] backdrop-blur-xl supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:block"
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 36, opacity: 0 }}
            transition={txReveal(DURATION_OVERLAY_SLOW)}
          >
            <div className="mx-auto flex max-w-6xl flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={urgencyMessage}
                  className="text-center text-[10px] font-medium uppercase leading-relaxed tracking-[0.2em] text-zinc-500 sm:max-w-[min(28rem,52vw)] sm:text-left sm:tracking-[0.24em]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={txReveal(DURATION_OPACITY)}
                >
                  {urgencyMessage}
                </motion.p>
              </AnimatePresence>
              <Link
                href="#pricing"
                className={cn(
                  "inline-flex h-11 min-h-11 shrink-0 items-center justify-center rounded-full bg-white px-5 text-center text-[11px] font-medium leading-snug tracking-tight text-zinc-950 sm:px-6 sm:text-xs",
                  "shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_-12px_rgba(255,255,255,0.2)] transition-shadow duration-[320ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_16px_48px_-10px_rgba(255,255,255,0.28)]",
                )}
              >
                <span className="max-w-[11rem] sm:max-w-none">{ctaLabel}</span>
              </Link>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function FloatingUrgencyPill({ message }: { message: string }) {
  return (
    <motion.div
      className="pointer-events-none fixed bottom-[5.75rem] right-4 z-[55] hidden max-w-[14rem] sm:block lg:bottom-10 lg:right-8"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={txReveal(DURATION_REVEAL, 1.2)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={txReveal(DURATION_OPACITY)}
          className={cn(
            "rounded-full border border-white/[0.1] bg-zinc-950/55 px-4 py-2.5 text-[10px] font-medium uppercase leading-snug tracking-[0.2em] text-zinc-500",
            "shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_12px_48px_-16px_rgba(0,0,0,0.65)] backdrop-blur-xl",
          )}
        >
          {message}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function ConversionChrome() {
  const { urgencyMessage, primaryCtaLabel } = useConversionExperience();
  return (
    <>
      <FloatingUrgencyPill message={urgencyMessage} />
      <StickyConversionBar
        urgencyMessage={urgencyMessage}
        ctaLabel={primaryCtaLabel}
      />
    </>
  );
}

export function ConversionExperienceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [urgencyIndex, setUrgencyIndex] = useState(0);
  const [activeZone, setActiveZone] = useState<ConversionZone>("hero");
  const raf = useRef<number | null>(null);

  const tickZone = useCallback(() => {
    if (raf.current != null) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      setActiveZone(computeActiveZone());
      raf.current = null;
    });
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setUrgencyIndex((i) => (i + 1) % URGENCY_MESSAGES.length);
    }, 8800);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    tickZone();
    window.addEventListener("scroll", tickZone, { passive: true });
    window.addEventListener("resize", tickZone);
    return () => {
      window.removeEventListener("scroll", tickZone);
      window.removeEventListener("resize", tickZone);
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, [tickZone]);

  const urgencyMessage =
    URGENCY_MESSAGES[urgencyIndex % URGENCY_MESSAGES.length];
  const primaryCtaLabel = CTA_BY_ZONE[activeZone];

  const urgencyForTier = useCallback(
    (offset: number) =>
      URGENCY_MESSAGES[(urgencyIndex + offset) % URGENCY_MESSAGES.length] ??
      URGENCY_MESSAGES[0],
    [urgencyIndex],
  );

  const value = useMemo<ConversionValue>(
    () => ({
      urgencyMessage,
      urgencyIndex,
      activeZone,
      primaryCtaLabel,
      urgencyForTier,
    }),
    [urgencyMessage, urgencyIndex, activeZone, primaryCtaLabel, urgencyForTier],
  );

  return (
    <ConversionContext.Provider value={value}>
      {children}
      <ConversionChrome />
    </ConversionContext.Provider>
  );
}
