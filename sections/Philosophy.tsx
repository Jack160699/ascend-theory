"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRef } from "react";

const viewport = { once: true, margin: "-80px" } as const;

const headerBlock = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.14, delayChildren: 0.06 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const rowParent = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const rowChild = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.78, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const principles: {
  n: string;
  title: string;
  body: string[];
  fragment: string;
}[] = [
  {
    n: "01",
    title: "Identity Before Motivation",
    body: [
      "Motivation fades quickly.",
      "Identity-driven systems create permanent standards.",
    ],
    fragment: "Standards over spikes.",
  },
  {
    n: "02",
    title: "Structure Creates Discipline",
    body: [
      "Consistency is rarely emotional.",
      "It is architectural.",
    ],
    fragment: "Architecture over mood.",
  },
  {
    n: "03",
    title: "Accountability Accelerates Growth",
    body: [
      "People evolve faster when execution becomes visible and measurable.",
    ],
    fragment: "Visibility compounds.",
  },
  {
    n: "04",
    title: "Transformation Is Environmental",
    body: [
      "Your standards rise when your environment no longer tolerates mediocrity.",
    ],
    fragment: "Environment shapes default.",
  },
];

function PrincipleRow({
  item,
  reversed,
}: {
  item: (typeof principles)[number];
  reversed: boolean;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const root = rootRef.current;
    const glow = glowRef.current;
    if (!root || !glow) return;
    const r = root.getBoundingClientRect();
    glow.style.setProperty(
      "--gx",
      `${((e.clientX - r.left) / r.width) * 100}%`,
    );
    glow.style.setProperty(
      "--gy",
      `${((e.clientY - r.top) / r.height) * 100}%`,
    );
  };

  const onLeave = () => {
    const glow = glowRef.current;
    if (!glow) return;
    glow.style.setProperty("--gx", "50%");
    glow.style.setProperty("--gy", "50%");
  };

  const textBlock = (
    <motion.div
      variants={rowChild}
      className={cn(
        "flex flex-col justify-center",
        reversed ? "lg:pl-4" : "lg:pr-4",
      )}
    >
      <div className="mb-4 flex items-baseline gap-4">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-600">
          {item.n}
        </span>
        <span
          className="h-px flex-1 max-w-[6rem] bg-gradient-to-r from-white/25 to-transparent"
          aria-hidden
        />
      </div>
      <h3 className="text-balance font-sans text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl lg:text-[2rem] lg:leading-[1.12]">
        {item.title}
      </h3>
      <div className="mt-6 space-y-3 text-pretty text-[15px] leading-[1.75] text-zinc-500 sm:text-base sm:leading-relaxed">
        {item.body.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </motion.div>
  );

  const visualBlock = (
    <motion.div variants={rowChild} className="relative min-h-[14rem]">
      <motion.article
        ref={rootRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="group relative h-full min-h-[14rem] overflow-hidden rounded-[1.25rem] border border-white/[0.08] bg-white/[0.025] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] backdrop-blur-xl sm:min-h-[16rem] sm:p-10"
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
      >
        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(520px circle at var(--gx, 50%) var(--gy, 50%), rgba(255,255,255,0.08), transparent 58%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-[1.25rem] opacity-50"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, transparent 42%, transparent 100%)",
          }}
          aria-hidden
        />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <p className="max-w-[12rem] font-mono text-[10px] font-medium uppercase leading-relaxed tracking-[0.22em] text-zinc-600">
            {item.fragment}
          </p>
          <motion.p
            className="text-right font-sans text-[clamp(2.5rem,8vw,4.5rem)] font-semibold leading-none tracking-[-0.04em] text-white/[0.06]"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 10 + parseInt(item.n, 10) * 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            aria-hidden
          >
            {item.n}
          </motion.p>
        </div>
      </motion.article>
    </motion.div>
  );

  return (
    <motion.div
      variants={rowParent}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16 lg:gap-x-20"
    >
      {reversed ? (
        <>
          {visualBlock}
          {textBlock}
        </>
      ) : (
        <>
          {textBlock}
          {visualBlock}
        </>
      )}
    </motion.div>
  );
}

export function Philosophy() {
  return (
    <section
      id="philosophy"
      data-conversion-zone="philosophy"
      className="relative scroll-mt-28 overflow-hidden border-t border-white/[0.04] bg-[#050505] py-20 sm:py-28 lg:py-36"
      aria-labelledby="philosophy-heading"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050505] to-black" />
        <motion.div
          className="absolute left-1/2 top-[15%] h-[22rem] w-[min(100%,48rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.055),transparent_70%)] blur-3xl"
          animate={{ opacity: [0.4, 0.65, 0.4], scale: [1, 1.03, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-[20%] bottom-[20%] h-[24rem] w-[24rem] rounded-full bg-zinc-600/[0.045] blur-[110px]"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_78%)]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            mixBlendMode: "overlay",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10 lg:px-12">
        <motion.div
          className="mx-auto max-w-4xl"
          variants={headerBlock}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <motion.p
            variants={fadeUp}
            className="mb-6 text-[11px] font-medium uppercase tracking-[0.32em] text-zinc-500"
          >
            The Ascend Philosophy
          </motion.p>
          <motion.h2
            id="philosophy-heading"
            variants={fadeUp}
            className="text-balance font-sans text-[clamp(1.85rem,5vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-white"
          >
            Transformation Is Not Built Through Motivation.
          </motion.h2>

          <motion.div
            variants={fadeUp}
            className="mx-auto mt-12 max-w-2xl space-y-6 border-l border-white/[0.1] pl-6 sm:pl-8"
          >
            <p className="text-pretty text-lg leading-relaxed text-zinc-400 sm:text-xl sm:leading-relaxed">
              Most people already know what they should do.
            </p>
            <p className="text-pretty text-[15px] leading-relaxed text-zinc-500 sm:text-base">
              The problem is not information.
            </p>
            <div className="space-y-2 text-[15px] leading-relaxed text-zinc-500 sm:text-base">
              <p className="font-medium text-zinc-400">The problem is:</p>
              <ul className="list-none space-y-2 pl-0">
                {[
                  "inconsistency",
                  "self-negotiation",
                  "lack of structure",
                  "weak accountability",
                  "fragmented identity",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span
                      className="mt-2.5 h-px w-8 shrink-0 bg-gradient-to-r from-white/30 to-transparent"
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="pt-2 text-[15px] font-medium leading-relaxed text-zinc-300 sm:text-base">
              Ascend Theory exists to solve that.
            </p>
          </motion.div>
        </motion.div>

        <motion.p
          className="mx-auto mt-16 max-w-2xl text-center font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-600 sm:mt-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={viewport}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Identity reconstruction — not conventional coaching
        </motion.p>

        <div className="mx-auto mt-14 max-w-5xl space-y-20 sm:mt-20 lg:space-y-28">
          {principles.map((p, i) => (
            <PrincipleRow key={p.n} item={p} reversed={i % 2 === 1} />
          ))}
        </div>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent"
        aria-hidden
      />
    </section>
  );
}
