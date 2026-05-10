"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useId, useRef, useState } from "react";

const IDLE_FRAGMENTS = [
  "Structure compounds quietly.",
  "Identity follows repetition.",
  "Discipline creates standards.",
] as const;

const INITIAL_GREETING =
  "Welcome to Ascend Theory.\n\nThis platform is designed for ambitious individuals seeking structured transformation through discipline, accountability, and identity-level growth.\n\nHow can I guide you?";

type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  bullets?: string[];
  coda?: string;
};

const QUICK_ACTIONS = [
  { id: "path", label: "Which path fits me?" },
  { id: "mentorship", label: "How does mentorship work?" },
  { id: "different", label: "What makes Ascend different?" },
  { id: "depth", label: "Explore transformation depth" },
] as const;

function responseForAction(actionId: (typeof QUICK_ACTIONS)[number]["id"]): Omit<
  Msg,
  "id" | "role"
> {
  switch (actionId) {
    case "path":
      return {
        content:
          "Transformation alignment depends on how you execute — not on how much change you deserve.",
        bullets: [
          "Accountability needs — how much external structure your season can honor",
          "Mentorship depth — proximity, calibration, and response priority",
          "Current execution consistency — honesty about drift vs. discipline",
          "Desired transformation intensity — pace without theatrics",
        ],
        coda:
          "Three architectural depths map to this: Foundation Access, High-Accountability Mentorship, and Private Transformation Architecture. Same philosophy — different integration density.",
      };
    case "mentorship":
      return {
        content:
          "Mentorship here is not motivation on demand. It is an execution environment: standards, feedback loops, and calibration that move at the speed of your life.",
        bullets: [
          "Rhythm — weekly structure and visible promises",
          "Proximity — how close the mentor sits to your decisions",
          "Calibration — adjustments when reality shifts",
          "Accountability — intensity matched to stakes, not ego",
        ],
        coda:
          "Depth scales with integration — not with packaging. When you are ready, the entry section walks allocation with context preserved.",
      };
    case "different":
      return {
        content:
          "Ascend is built for identity-grade seriousness — the kind of transformation that survives pressure, travel, and silence.",
        bullets: [
          "Philosophy-first — discipline, physique, communication, and identity as one system",
          "Architected accountability — not cheerleading",
          "Selective allocation — human review, not volume funnels",
          "Quiet standards — compounding without performance theater",
        ],
        coda:
          "If something here feels unusually still, that is intentional. Calm is part of the design.",
      };
    case "depth":
      return {
        content:
          "Transformation depth is the story of how closely mentorship integrates with your execution — not a trophy ladder.",
        bullets: [
          "Foundation Access — structured systems and group calibration",
          "High-Accountability Mentorship — closer loops and faster refinement",
          "Private Transformation Architecture — highest proximity and discretion",
        ],
        coda:
          "I can take you to the depth narrative on this page when you use the control below.",
      };
    default:
      return {
        content:
          "Carry your question with specificity — stakes, season, and what you are unwilling to negotiate anymore. That is where useful guidance begins.",
      };
  }
}

function genericResponse(input: string): Omit<Msg, "id" | "role"> {
  const t = input.trim().toLowerCase();
  if (!t) {
    return {
      content:
        "When you are ready, share what season you are in — not only goals, but what your execution has been proving lately.",
    };
  }
  if (t.includes("price") || t.includes("cost") || t.includes("pay")) {
    return {
      content:
        "Investment follows allocation and depth — not the reverse. The entry section frames tiers as mentorship integration, not packages.",
      coda: "Review depth first, then pricing — context stays cleaner that way.",
    };
  }
  if (t.includes("time") || t.includes("long")) {
    return {
      content:
        "Transformation respects physics: identity moves on the cadence of repeated standards, not announcements.",
      bullets: [
        "Early phase — clarity and structure",
        "Middle phase — consistency under friction",
        "Deep phase — identity holds without applause",
      ],
    };
  }
  return {
    content:
      "I hear you. Ascend works best when questions carry texture — what is misaligned, what you have tried, and what you refuse to repeat.",
    bullets: [
      "Name the constraint without dramatizing it",
      "Name the standard you want to be true in 90 days",
      "Name what you will protect on bad weeks",
    ],
    coda: "If one of the guided prompts fits better, use it — they are tuned to how people actually decide here.",
  };
}

function TypingIndicator() {
  return (
    <motion.div
      className="flex items-center gap-1.5 px-4 py-3"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.35 }}
      aria-hidden
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-zinc-500"
          animate={{ opacity: [0.35, 1, 0.35], y: [0, -3, 0] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.div>
  );
}

export function TransformationConcierge() {
  const baseId = useId();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [fragmentIndex, setFragmentIndex] = useState(0);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const greetingDoneRef = useRef(false);
  const typingTimerRef = useRef<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current != null) {
        window.clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!open && typingTimerRef.current != null) {
      window.clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
      setTyping(false);
    }
  }, [open]);

  useEffect(() => {
    if (!mounted || open) return;
    const id = window.setInterval(() => {
      setFragmentIndex((i) => (i + 1) % IDLE_FRAGMENTS.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, [mounted, open]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    listRef.current.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [open, messages, typing]);

  const pushAssistant = useCallback((body: Omit<Msg, "id" | "role">) => {
    const id = `${baseId}-a-${Date.now()}`;
    setMessages((m) => [...m, { id, role: "assistant", ...body }]);
  }, [baseId]);

  const pushUser = useCallback(
    (content: string) => {
      const id = `${baseId}-u-${Date.now()}`;
      setMessages((m) => [...m, { id, role: "user", content }]);
    },
    [baseId],
  );

  const runAssistantReply = useCallback(
    (body: Omit<Msg, "id" | "role">) => {
      if (typingTimerRef.current != null) {
        window.clearTimeout(typingTimerRef.current);
      }
      setTyping(true);
      typingTimerRef.current = window.setTimeout(() => {
        typingTimerRef.current = null;
        setTyping(false);
        pushAssistant(body);
      }, 900 + Math.random() * 400);
    },
    [pushAssistant],
  );

  const openPanel = useCallback(() => {
    setOpen(true);
    if (!greetingDoneRef.current) {
      greetingDoneRef.current = true;
      setMessages([
        {
          id: `${baseId}-greet`,
          role: "assistant",
          content: INITIAL_GREETING,
        },
      ]);
    }
  }, [baseId]);

  const onQuickAction = useCallback(
    (actionId: (typeof QUICK_ACTIONS)[number]["id"]) => {
      const label =
        QUICK_ACTIONS.find((a) => a.id === actionId)?.label ?? actionId;
      pushUser(label);
      if (actionId === "depth") {
        runAssistantReply(responseForAction("depth"));
        window.setTimeout(() => {
          document
            .getElementById("mentorship-depth")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 1400);
        return;
      }
      runAssistantReply(responseForAction(actionId));
    },
    [pushUser, runAssistantReply],
  );

  const onSubmitFreeText = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const t = input.trim();
      if (!t || typing) return;
      pushUser(t);
      setInput("");
      runAssistantReply(genericResponse(t));
    },
    [input, typing, pushUser, runAssistantReply],
  );

  return (
    <div
      className={cn(
        "fixed z-[170] flex flex-col items-end",
        "right-3 max-[380px]:right-2",
        "bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))]",
        "sm:right-5 lg:right-8",
      )}
    >
      <AnimatePresence mode="wait">
        {open ? (
          <motion.div
            id="concierge-panel"
            key="panel"
            role="dialog"
            aria-labelledby="concierge-title"
            aria-modal="true"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "mb-3 flex w-[min(100vw-1.5rem,22rem)] flex-col overflow-hidden rounded-2xl border border-white/[0.1]",
              "bg-zinc-950/[0.82] shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_28px_80px_-24px_rgba(0,0,0,0.85)] backdrop-blur-2xl",
              "sm:w-[min(100vw-2rem,24rem)]",
            )}
          >
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.07] via-transparent to-transparent opacity-50" />
            <div className="relative flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3.5">
              <div>
                <p
                  id="concierge-title"
                  className="text-[10px] font-medium uppercase tracking-[0.28em] text-zinc-500"
                >
                  Ascend Concierge
                </p>
                <p className="mt-0.5 text-[13px] font-medium text-zinc-200">
                  Transformation intelligence
                </p>
              </div>
              <motion.button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] text-zinc-400 transition-colors hover:border-white/[0.16] hover:text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Close concierge"
              >
                <span className="text-lg leading-none">×</span>
              </motion.button>
            </div>

            <div
              ref={listRef}
              className="relative max-h-[min(52dvh,22rem)] space-y-3 overflow-y-auto overscroll-contain px-3 py-4 sm:max-h-[min(56dvh,24rem)]"
            >
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: idx === messages.length - 1 ? 0.04 : 0,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={cn(
                    "rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                    msg.role === "user"
                      ? "ml-6 border border-white/[0.08] bg-white/[0.06] text-zinc-200"
                      : "mr-4 border border-white/[0.05] bg-black/40 text-zinc-400",
                  )}
                >
                  <p className="whitespace-pre-wrap text-pretty">{msg.content}</p>
                  {msg.bullets?.length ? (
                    <ul className="mt-3 space-y-2 border-t border-white/[0.06] pt-3 text-[12px] text-zinc-500">
                      {msg.bullets.map((b, bi) => (
                        <li key={`${msg.id}-b-${bi}`} className="flex gap-2">
                          <span className="mt-1.5 size-1 shrink-0 rounded-full bg-zinc-600" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {msg.coda ? (
                    <p className="mt-3 border-t border-white/[0.05] pt-3 text-[12px] italic leading-relaxed text-zinc-600">
                      {msg.coda}
                    </p>
                  ) : null}
                </motion.div>
              ))}
              <AnimatePresence>{typing ? <TypingIndicator /> : null}</AnimatePresence>
            </div>

            <div className="relative border-t border-white/[0.06] bg-black/30 px-3 py-3">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">
                Guided prompts
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_ACTIONS.map((a) => (
                  <motion.button
                    key={a.id}
                    type="button"
                    disabled={typing}
                    onClick={() => onQuickAction(a.id)}
                    className={cn(
                      "rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-left text-[11px] font-medium leading-snug text-zinc-400 transition-colors",
                      "hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-zinc-200",
                      "disabled:pointer-events-none disabled:opacity-40",
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {a.label}
                  </motion.button>
                ))}
              </div>
              <form onSubmit={onSubmitFreeText} className="mt-3 flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Share context…"
                  className="min-h-10 flex-1 rounded-xl border border-white/[0.1] bg-zinc-950/60 px-3 py-2 text-[13px] text-white outline-none placeholder:text-zinc-600 focus:border-white/[0.18]"
                  disabled={typing}
                />
                <motion.button
                  type="submit"
                  disabled={typing || !input.trim()}
                  className="shrink-0 rounded-xl border border-white/[0.12] bg-white/[0.08] px-3 py-2 text-[12px] font-medium text-zinc-200 transition-colors hover:bg-white/[0.12] disabled:opacity-40"
                  whileTap={{ scale: 0.97 }}
                >
                  Send
                </motion.button>
              </form>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => (open ? setOpen(false) : openPanel())}
        aria-expanded={open}
        aria-controls={open ? "concierge-panel" : undefined}
        id="concierge-launcher"
        className="group relative flex flex-col items-center gap-2 outline-none"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 420, damping: 28 }}
      >
        <span className="sr-only">
          {open ? "Close Ascend Concierge" : "Open Ascend Concierge — Need guidance?"}
        </span>
        <div className="relative">
          <motion.div
            className="absolute inset-[-10px] rounded-full bg-white/[0.12] blur-xl"
            animate={{ opacity: [0.25, 0.45, 0.28], scale: [1, 1.08, 1] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          />
          <motion.div
            className="relative flex size-[3.25rem] items-center justify-center rounded-full border border-white/[0.14] bg-gradient-to-br from-zinc-800/90 via-zinc-950 to-black shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset,0_12px_40px_-12px_rgba(0,0,0,0.8)] sm:size-14"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.div
              className="absolute inset-1 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.14),transparent_55%)]"
              aria-hidden
            />
            <span
              className="relative text-[11px] font-semibold tracking-[0.12em] text-zinc-100"
              aria-hidden
            >
              A
            </span>
          </motion.div>
        </div>
        {!open ? (
          <div className="max-w-[11rem] text-center">
            <p className="text-[11px] font-medium text-zinc-400">Need guidance?</p>
            {mounted ? (
              <AnimatePresence mode="wait">
                <motion.p
                  key={fragmentIndex}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="mt-1 line-clamp-2 font-serif text-[10px] font-light italic leading-snug text-zinc-600"
                >
                  {IDLE_FRAGMENTS[fragmentIndex]}
                </motion.p>
              </AnimatePresence>
            ) : (
              <p className="mt-1 h-8" />
            )}
          </div>
        ) : null}
      </motion.button>
    </div>
  );
}
