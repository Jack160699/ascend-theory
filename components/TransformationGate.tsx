"use client";

import { useIsMobileConversion } from "@/contexts/mobile-conversion";
import {
  DURATION_OPACITY,
  DURATION_OVERLAY,
  DURATION_OVERLAY_SLOW,
  DURATION_REVEAL,
  EASE_CINEMATIC,
  TAP_SPRING,
  txReveal,
} from "@/lib/motion";
import { useAssessmentModal } from "@/contexts/assessment-modal";
import { PRIMARY_CTA_LABEL } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

const STORAGE_KEY = "ascend:transformation-gate:v1";

const PHILOSOPHY_LINES = [
  "Structure decides speed.",
  "Identity follows repetition.",
  "Discipline compounds quietly.",
  "Change starts with standards.",
] as const;

function readDismissed(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeDismissed() {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
}

function scrollToHash(hash: string) {
  const id = hash.replace(/^#/, "");
  requestAnimationFrame(() => {
    if (!id) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

export function TransformationGate() {
  const { openAssessment } = useAssessmentModal();
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobileConversion();
  const titleId = useId();
  const descId = useId();
  const primaryRef = useRef<HTMLButtonElement>(null);
  const pendingHashRef = useRef<string>("");
  const quoteTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Must match SSR first paint — sessionStorage is read after mount. */
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<"main" | "transit">("main");
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    if (readDismissed()) return;
    const id = requestAnimationFrame(() => {
      setActive(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!active) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [active]);

  useEffect(() => {
    if (!active || phase !== "main") return;
    const t = window.setTimeout(() => primaryRef.current?.focus(), 320);
    return () => clearTimeout(t);
  }, [active, phase]);

  const clearQuoteTimer = useCallback(() => {
    if (quoteTimer.current) {
      clearInterval(quoteTimer.current);
      quoteTimer.current = null;
    }
  }, []);

  const finalize = useCallback(() => {
    writeDismissed();
    document.body.style.overflow = "";
    scrollToHash(pendingHashRef.current);
    pendingHashRef.current = "";
  }, []);

  const startClose = useCallback(
    (hash: string) => {
      if (!active || phase !== "main") return;
      pendingHashRef.current = hash;
      setPhase("transit");
      setQuoteIndex(0);
      clearQuoteTimer();
      const step = reduceMotion ? 700 : isMobile ? 320 : 450;
      quoteTimer.current = setInterval(() => {
        setQuoteIndex((i) => (i + 1) % PHILOSOPHY_LINES.length);
      }, step);
      const dwell = reduceMotion ? 500 : isMobile ? 1100 : 1530;
      window.setTimeout(() => {
        clearQuoteTimer();
        setActive(false);
      }, dwell);
    },
    [active, phase, reduceMotion, clearQuoteTimer, isMobile],
  );

  useEffect(() => {
    return () => clearQuoteTimer();
  }, [clearQuoteTimer]);

  useEffect(() => {
    if (!active || phase !== "main") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") startClose("");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, phase, startClose]);

  return (
    <AnimatePresence
      onExitComplete={() => {
        setPhase("main");
        finalize();
      }}
    >
      {active ? (
        <motion.div
          key="transformation-gate"
          className="fixed inset-0 z-[280] flex flex-col bg-[#030303]"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: reduceMotion ? 0.22 : DURATION_OVERLAY_SLOW,
            ease: EASE_CINEMATIC,
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden
          >
            <motion.div
              className="absolute -left-[26%] top-[12%] h-[min(22rem,52vh)] w-[min(22rem,80vw)] rounded-full bg-white/[0.04] blur-[90px] sm:-left-[20%] sm:h-[min(28rem,70vh)] sm:w-[min(28rem,85vw)] sm:blur-[120px]"
              animate={
                reduceMotion
                  ? undefined
                  : { x: [0, 18, 0], y: [0, 12, 0], opacity: [0.5, 0.75, 0.5] }
              }
              transition={{
                duration: 22,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -right-[24%] bottom-[6%] h-[min(20rem,50vh)] w-[min(20rem,72vw)] rounded-full bg-zinc-500/[0.055] blur-[88px] sm:-right-[15%] sm:h-[min(26rem,65vh)] sm:w-[min(26rem,80vw)] sm:blur-[110px]"
              animate={
                reduceMotion
                  ? undefined
                  : {
                      x: [0, -14, 0],
                      y: [0, -10, 0],
                      opacity: [0.45, 0.7, 0.45],
                    }
              }
              transition={{
                duration: 26,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.35]"
              style={{
                background:
                  "radial-gradient(ellipse 80% 55% at 50% 18%, rgba(255,255,255,0.07), transparent 62%)",
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.055]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                mixBlendMode: "overlay",
              }}
            />
            <div
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.72)_78%)]"
              aria-hidden
            />
          </div>

          <button
            type="button"
            onClick={() => startClose("")}
            className="absolute right-4 top-4 z-20 flex size-11 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] text-zinc-400 backdrop-blur-md transition-colors hover:border-white/[0.16] hover:text-zinc-200 sm:right-6 sm:top-6"
            aria-label="Close and enter site"
          >
            <X className="size-[18px]" strokeWidth={1.25} />
          </button>

          <p className="pointer-events-none absolute bottom-[max(6rem,calc(env(safe-area-inset-bottom)+5.2rem))] left-4 z-20 max-w-[min(17rem,calc(100vw-2rem))] text-pretty text-[10px] leading-relaxed text-zinc-500/40 sm:bottom-[5.5rem] sm:left-6 sm:text-[11px] sm:leading-relaxed">
            For people ready to work — not for idle browsing.
          </p>

          <div className="relative z-10 flex flex-1 flex-col items-center justify-center overflow-y-auto px-5 py-[max(4.5rem,calc(env(safe-area-inset-top)+3.5rem))] sm:px-10 sm:py-20">
            <AnimatePresence mode="wait">
              {phase === "transit" ? (
                <motion.div
                  key="transit"
                  className="flex max-w-md flex-col items-center text-center"
                  initial={{ opacity: 0, y: isMobile ? 6 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: isMobile ? -5 : -8 }}
                  transition={txReveal(DURATION_OPACITY * (isMobile ? 0.88 : 1))}
                >
                  <motion.div
                    className="mb-10 h-px w-24 overflow-hidden rounded-full bg-white/[0.12]"
                    aria-hidden
                  >
                    <motion.div
                      className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      animate={{ x: ["-100%", "220%"] }}
                      transition={{
                        duration: 1.35,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  </motion.div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={PHILOSOPHY_LINES[quoteIndex]}
                      initial={{ opacity: 0, y: isMobile ? 4 : 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: isMobile ? -3 : -4 }}
                      transition={txReveal(DURATION_OVERLAY * (isMobile ? 0.9 : 1))}
                      className="text-balance font-sans text-lg font-medium leading-snug tracking-tight text-zinc-300 sm:text-xl"
                    >
                      {PHILOSOPHY_LINES[quoteIndex]}
                    </motion.p>
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="main"
                  className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-[1.35rem] border border-white/[0.08] bg-white/[0.03] px-5 py-10 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-xl sm:px-10 sm:py-14"
                  initial={{ opacity: 0, y: isMobile ? 14 : 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={txReveal(DURATION_REVEAL * (isMobile ? 0.88 : 1))}
                >
                  <motion.p
                    className="mb-8 text-[10px] font-medium uppercase tracking-[0.32em] text-zinc-600 sm:text-[11px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={txReveal(DURATION_OPACITY, 0.1)}
                  >
                    Ascend Theory
                  </motion.p>

                  <h1
                    id={titleId}
                    className="text-balance font-sans text-[clamp(1.7rem,8.5vw,2.15rem)] font-semibold leading-[1.14] tracking-[-0.03em] text-white sm:text-3xl sm:leading-[1.15] lg:text-[2.15rem] lg:leading-[1.12]"
                  >
                    You already know what to do.
                    <span className="mt-4 block text-zinc-300">
                      Ascend is the private structure that makes it stick.
                    </span>
                  </h1>

                  <div
                    id={descId}
                    className="mt-8 max-w-xl space-y-3 text-pretty text-[14px] leading-[1.78] text-zinc-500 sm:mt-10 sm:text-[15px] sm:leading-relaxed"
                  >
                    <p>
                      Discipline, physique, voice, accountability — one system,
                      not a course stack.
                    </p>
                    <p>For people who are done negotiating with their own bar.</p>
                  </div>

                  <motion.div
                    className="mt-9 flex w-full max-w-md flex-col gap-3 sm:mt-12 sm:flex-row sm:justify-center"
                    initial={{ opacity: 0, y: isMobile ? 10 : 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={txReveal(DURATION_REVEAL, isMobile ? 0.12 : 0.18)}
                  >
                    <motion.button
                      ref={primaryRef}
                      type="button"
                      onClick={() => {
                        writeDismissed();
                        clearQuoteTimer();
                        setPhase("main");
                        setActive(false);
                        document.body.style.overflow = "";
                        openAssessment();
                      }}
                      className={cn(
                        "inline-flex min-h-[3.1rem] w-full items-center justify-center rounded-full bg-white px-6 text-sm font-medium tracking-tight text-zinc-950",
                        "shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_20px_60px_-20px_rgba(255,255,255,0.22)]",
                        "transition-shadow duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_24px_72px_-18px_rgba(255,255,255,0.3)]",
                      )}
                      whileHover={{ scale: 1.012 }}
                      whileTap={{ scale: 0.988 }}
                      transition={TAP_SPRING}
                    >
                      {PRIMARY_CTA_LABEL}
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => startClose("#about")}
                      className={cn(
                        "inline-flex min-h-[3.1rem] w-full items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.04] px-6 text-sm font-medium tracking-tight text-zinc-200 backdrop-blur-md",
                        "transition-[border-color,background-color] duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] hover:border-white/[0.22] hover:bg-white/[0.07]",
                      )}
                      whileHover={{ scale: 1.012 }}
                      whileTap={{ scale: 0.988 }}
                      transition={TAP_SPRING}
                    >
                      How we think
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            className="pointer-events-none relative z-10 border-t border-white/[0.06] bg-black/40 px-6 py-[max(0.9rem,env(safe-area-inset-bottom))] text-center text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-600 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={txReveal(DURATION_OPACITY, 0.3)}
          >
            Selective entry · human review · leave anytime
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
