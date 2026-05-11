"use client";

import { SectionContinuity } from "@/components/SectionContinuity";
import {
  useIsMobileConversion,
  useRevealViewport,
} from "@/contexts/mobile-conversion";
import {
  DURATION_OPACITY,
  DURATION_REVEAL,
  SURFACE_SPRING,
  STAGGER_TABLE_ROW,
  getFadeUpChild,
  getFadeUpReveal,
  getHeaderStaggerParent,
  getListStaggerParent,
  txReveal,
} from "@/lib/motion";
import { EDITORIAL_PLACEHOLDERS } from "@/lib/editorial-placeholders";
import { leadLeft, shellWide } from "@/lib/editorial-layout";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import Image from "next/image";
import {
  CheckCheck,
  Play,
  Quote,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/** Aligned with `EDITORIAL_PLACEHOLDERS` — cinematic discipline / physique / presence. */
const img = {
  ba1Before: EDITORIAL_PLACEHOLDERS.training,
  ba1After: EDITORIAL_PLACEHOLDERS.silhouette,
  ba2Before: EDITORIAL_PLACEHOLDERS.focus,
  ba2After: EDITORIAL_PLACEHOLDERS.presence,
  mosaicA: EDITORIAL_PLACEHOLDERS.training,
  mosaicB: EDITORIAL_PLACEHOLDERS.silhouette,
  mosaicC: EDITORIAL_PLACEHOLDERS.focus,
  mosaicD: EDITORIAL_PLACEHOLDERS.presence,
  mosaicE: EDITORIAL_PLACEHOLDERS.silhouette,
  prog1: EDITORIAL_PLACEHOLDERS.silhouette,
  prog2: EDITORIAL_PLACEHOLDERS.training,
  prog3: EDITORIAL_PLACEHOLDERS.focus,
  vidPoster1: EDITORIAL_PLACEHOLDERS.training,
  vidPoster2: EDITORIAL_PLACEHOLDERS.silhouette,
  vidPoster3: EDITORIAL_PLACEHOLDERS.focus,
} as const;

/** Demo MP4 architecture (replace with hosted member films). */
const demoVideos = [
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
] as const;

const metrics = [
  { label: "Cohort execution consistency", value: "87%" },
  { label: "Avg. accountability streak", value: "12 wk" },
  { label: "Mentor allocation", value: "Capped" },
  { label: "Methodology adherence", value: "High" },
] as const;

const marqueeProof = [
  { title: "Physique", line: "Composition shift across structured blocks" },
  { title: "Discipline", line: "Non-negotiable morning architecture" },
  { title: "Presence", line: "Leadership voice under load" },
  { title: "Social", line: "Initiated conversations weekly" },
  { title: "Energy", line: "Sleep and training aligned" },
  { title: "Identity", line: "Standards stop being optional" },
  { title: "Confidence", line: "Calm under scrutiny" },
  { title: "Execution", line: "Systems over motivation" },
] as const;

const quotes = [
  {
    text: "I did not want hype — I wanted a room that would not negotiate with me. Six months in, training, sleep, and how I take space stopped feeling like an act.",
    tag: "Physique · discipline",
  },
  {
    text: "The shift was not louder confidence — it was quieter standards. Reps, feedback, and accountability until steadiness felt normal again.",
    tag: "Communication · presence",
  },
] as const;

const chats = [
  {
    time: "09:14",
    body: "First week done. Hit every session. Feels foreign to not negotiate with myself.",
  },
  {
    time: "Mon",
    body: "Had the hard conversation at work. Didn’t rush it. That’s new for me.",
  },
  {
    time: "Tue",
    body: "Confidence note: led the client call without over-preparing for once.",
  },
  {
    time: "Yesterday",
    body: "Weighed in, but more importantly — slept 7.5h four nights straight. Small but real.",
  },
  {
    time: "Today",
    body: "Discipline streak: 21 check-ins without missing. Environment finally matches intent.",
  },
] as const;

const mosaic = [
  {
    src: img.mosaicA,
    label: "Routine atmosphere",
    sub: "Reference · discipline",
  },
  {
    src: img.mosaicB,
    label: "Portrait · presence",
    sub: "Reference · professional",
  },
  {
    src: img.mosaicC,
    label: "Morning architecture",
    sub: "Reference · lifestyle",
  },
  {
    src: img.mosaicD,
    label: "Training intelligence",
    sub: "Reference · physique",
  },
  { src: img.mosaicE, label: "Outdoor cadence", sub: "Reference · identity" },
] as const;

const videoStories = [
  {
    title: "Presence under pressure",
    subtitle: "Voice, stakes, and composure — identity-grade reference cut.",
    poster: img.vidPoster1,
    src: demoVideos[0],
  },
  {
    title: "Discipline and physique",
    subtitle: "Training, sleep, execution — structured reference.",
    poster: img.vidPoster2,
    src: demoVideos[1],
  },
  {
    title: "Lifestyle and identity",
    subtitle: "Standards across domains — maturity-forward reference.",
    poster: img.vidPoster3,
    src: demoVideos[2],
  },
] as const;

function BeforeAfterCard({
  name,
  timeframe,
  beforeSrc,
  afterSrc,
  fadeChildVariants,
  isMobile,
}: {
  name: string;
  timeframe: string;
  beforeSrc: string;
  afterSrc: string;
  fadeChildVariants: Variants;
  isMobile: boolean;
}) {
  return (
    <motion.div
      variants={fadeChildVariants}
      whileHover={{ y: isMobile ? -1 : -2 }}
      transition={SURFACE_SPRING}
      className="group relative overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-white/[0.03] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] backdrop-blur-md sm:p-7 sm:backdrop-blur-xl"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-transparent opacity-40 transition-opacity duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:opacity-52" />
      <p className="relative z-10 text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
        {name}
      </p>
      <p className="relative z-10 mt-1 text-xs text-zinc-600">{timeframe}</p>
      <div className="relative z-10 mt-5 grid grid-cols-2 gap-3">
        <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-950/80">
          <div className="relative aspect-[4/5]">
            <Image
              src={beforeSrc}
              alt="Editorial reference frame one"
              fill
              className="object-cover transition-transform duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:scale-[1.008]"
              sizes="(max-width: 768px) 45vw, 280px"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>
          <p className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Reference I
          </p>
        </div>
        <div className="overflow-hidden rounded-xl border border-white/[0.1] bg-zinc-950/80 shadow-[0_0_48px_-12px_rgba(255,255,255,0.08)]">
          <div className="relative aspect-[4/5]">
            <Image
              src={afterSrc}
              alt="Editorial reference frame two"
              fill
              className="object-cover transition-transform duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:scale-[1.008]"
              sizes="(max-width: 768px) 45vw, 280px"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
          <p className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
            Reference II
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function MosaicTile({
  src,
  label,
  sub,
  fadeChildVariants,
  isMobile,
}: {
  src: string;
  label: string;
  sub: string;
  fadeChildVariants: Variants;
  isMobile: boolean;
}) {
  return (
    <motion.figure
      variants={fadeChildVariants}
      whileHover={{ y: isMobile ? -1 : -2, scale: isMobile ? 1.004 : 1.006 }}
      transition={SURFACE_SPRING}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950/40 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]"
    >
      <div className="relative aspect-[4/5] sm:aspect-[3/4]">
        <Image
          src={src}
          alt={`Reference: ${label}`}
          fill
          className="object-cover transition-transform duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:scale-[1.008]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />
        <figcaption className="absolute inset-x-0 bottom-0 z-10 p-4">
          <p className="text-sm font-medium tracking-tight text-white">
            {label}
          </p>
          <p className="mt-1 text-[11px] text-zinc-500">{sub}</p>
        </figcaption>
      </div>
    </motion.figure>
  );
}

function VideoStoryCard({
  title,
  subtitle,
  poster,
  src,
  index,
  fadeChildVariants,
  isMobile,
}: (typeof videoStories)[number] & {
  index: number;
  fadeChildVariants: Variants;
  isMobile: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hover, setHover] = useState(false);
  const [ready, setReady] = useState(false);
  const [tapPlay, setTapPlay] = useState(false);

  const active = hover || tapPlay;

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active) {
      const p = v.play();
      if (p) void p.catch(() => {});
    } else {
      v.pause();
    }
  }, [active]);

  const toggleTap = useCallback(() => {
    setTapPlay((t) => !t);
  }, []);

  return (
    <motion.div
      variants={fadeChildVariants}
      className="group relative overflow-hidden rounded-[1.25rem] border border-[color:var(--ascend-border)] bg-ascend-elevated/90 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset,0_32px_80px_-40px_rgba(0,0,0,0.55)] backdrop-blur-xl"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      whileHover={{ scale: isMobile ? 1.003 : 1.006 }}
      transition={SURFACE_SPRING}
    >
      <div className="pointer-events-none absolute -inset-px rounded-[1.25rem] opacity-0 blur-2xl transition-opacity duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:opacity-[0.82]">
        <div className="h-full w-full bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.15),transparent_65%)]" />
      </div>
      <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[2/1]">
        <video
          ref={videoRef}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-[opacity,filter] duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)]",
            ready ? "opacity-100" : "opacity-0",
            active ? "brightness-[1.05]" : "brightness-[0.88]",
          )}
          src={src}
          poster={poster}
          muted
          playsInline
          loop
          preload="metadata"
          onLoadedData={() => setReady(true)}
        />
        <div className="absolute inset-0">
          <Image
            src={poster}
            alt={`Video poster: ${title}`}
            fill
            className={cn(
              "object-cover transition-opacity duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)]",
              ready && active ? "opacity-0" : "opacity-100",
            )}
            sizes="(max-width: 768px) 100vw, 33vw"
            priority={index === 0}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
        <AnimatePresence>
          {!active ? (
            <motion.div
              key="play"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <motion.div
                className="flex size-16 items-center justify-center rounded-full border border-[color:var(--ascend-border)] bg-ascend-surface/95 text-zinc-100 shadow-[0_0_32px_-6px_var(--ascend-accent-glow)] backdrop-blur-md"
                animate={{
                  boxShadow: [
                    "0 0 40px -10px rgba(255,255,255,0.12)",
                    "0 0 56px -6px rgba(255,255,255,0.2)",
                    "0 0 40px -10px rgba(255,255,255,0.12)",
                  ],
                }}
                transition={{
                  duration: 3.4 + index * 0.15,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Play className="ml-1 size-7 fill-white/90 text-white/90" />
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
        <button
          type="button"
          onClick={toggleTap}
          className="absolute inset-0 z-10 sm:hidden"
          aria-label={tapPlay ? "Pause preview" : "Play preview"}
        />
      </div>
      <div className="relative z-10 border-t border-white/[0.06] bg-white/[0.02] px-5 py-4">
        <p className="text-sm font-medium tracking-tight text-white">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">{subtitle}</p>
        <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">
          Reference reel · replace with member story
        </p>
      </div>
    </motion.div>
  );
}

export function Testimonials() {
  const viewport = useRevealViewport();
  const isMobile = useIsMobileConversion();
  const headerStagger = useMemo(
    () => getHeaderStaggerParent(isMobile),
    [isMobile],
  );
  const fadeMain = useMemo(() => getFadeUpReveal(isMobile), [isMobile]);
  const listStagger = useMemo(() => getListStaggerParent(isMobile), [isMobile]);
  const fadeChild = useMemo(() => getFadeUpChild(isMobile), [isMobile]);
  const rowStagger = STAGGER_TABLE_ROW * (isMobile ? 0.62 : 1);
  return (
    <section
      id="testimonials"
      data-conversion-zone="proof"
      className="ascend-section-world relative scroll-mt-28 overflow-hidden border-t border-[color:var(--ascend-border)] bg-ascend-canvas py-10 sm:py-16 lg:py-24"
      aria-labelledby="proof-heading"
    >
      <SectionContinuity />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-ascend-surface/70 via-ascend-canvas to-ascend-surface/70" />
        <div className="absolute left-1/2 top-[5%] h-[22rem] w-[min(100%,56rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.055),transparent_72%)] blur-3xl" />
        <div className="absolute -right-[20%] bottom-[20%] h-[28rem] w-[28rem] rounded-full bg-emerald-950/[0.06] blur-[120px]" />
        <div className="absolute -left-[18%] top-[35%] h-[24rem] w-[24rem] rounded-full bg-zinc-600/[0.05] blur-[110px]" />
        <motion.div
          className="absolute right-[10%] top-[40%] h-72 w-72 rounded-full bg-white/[0.03] blur-[90px]"
          animate={{ opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_78%)]" />
      </div>

      <div className={shellWide}>
        <motion.div
          className={leadLeft}
          variants={headerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <motion.p
            variants={fadeMain}
            className="ascend-type-eyebrow mb-6 text-zinc-500 lg:mb-7"
          >
            Proof
          </motion.p>
          <motion.h2
            id="proof-heading"
            variants={fadeMain}
            className="ascend-type-section-sm ascend-headline"
          >
            Evidence is behavior — not captions.
          </motion.h2>
          <motion.p
            variants={fadeMain}
            className="ascend-prose-calm mt-9 max-w-[34rem] text-pretty text-zinc-500 sm:mt-10"
          >
            Reference media, cadence, and accountability UI — built so you can
            swap in real member assets when you are ready.
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-14 grid w-full max-w-4xl grid-cols-2 gap-3 sm:mt-16 sm:grid-cols-4 sm:gap-4"
          variants={listStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          {metrics.map((m) => (
            <motion.div
              key={m.label}
              variants={fadeChild}
              className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-4 text-left shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset] backdrop-blur-md sm:px-4 sm:py-5"
            >
              <p className="font-mono text-lg font-semibold tracking-tight text-white sm:text-xl">
                {m.value}
              </p>
              <p className="mt-2 text-[10px] leading-snug text-zinc-500 sm:text-[11px] sm:leading-snug">
                {m.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-14 grid max-w-5xl gap-6 lg:mt-16 lg:grid-cols-2"
          variants={listStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <BeforeAfterCard
            name="Reference pair · M"
            timeframe="Physique and presence block (demo photography)"
            beforeSrc={img.ba1Before}
            afterSrc={img.ba1After}
            fadeChildVariants={fadeChild}
            isMobile={isMobile}
          />
          <BeforeAfterCard
            name="Reference pair · A"
            timeframe="Communication and discipline (demo photography)"
            beforeSrc={img.ba2Before}
            afterSrc={img.ba2After}
            fadeChildVariants={fadeChild}
            isMobile={isMobile}
          />
        </motion.div>

        <motion.div
          className="mt-14 w-full max-w-5xl lg:mt-16"
          variants={fadeMain}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <p className="mb-6 text-left text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-500 lg:pl-1">
            Physique progression · reference frames
          </p>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {[img.prog1, img.prog2, img.prog3].map((src, i) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={txReveal(DURATION_REVEAL, i * rowStagger)}
                className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-950/60"
              >
                <div className="relative aspect-[3/4]">
                  <Image
                    src={src}
                    alt={`Physique reference frame ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:scale-[1.008]"
                    sizes="(max-width: 768px) 33vw, 240px"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-2 left-2 font-mono text-[10px] font-medium text-zinc-400">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="mt-14 w-full max-w-5xl lg:mt-16"
          variants={listStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <p className="mb-6 flex items-center gap-2 text-left text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-500 lg:pl-1">
            <Sparkles
              className="size-3.5 shrink-0 text-zinc-600"
              strokeWidth={1.25}
            />
            Field stills · cinematic reference
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
            {mosaic.map((m) => (
              <MosaicTile
                key={m.src}
                {...m}
                fadeChildVariants={fadeChild}
                isMobile={isMobile}
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          className="mt-12 grid w-full max-w-5xl gap-6 lg:mt-16 lg:grid-cols-2"
          variants={listStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          {quotes.map((q) => (
            <motion.figure
              key={q.tag}
              variants={fadeChild}
              whileHover={{ y: isMobile ? -1 : -2 }}
              transition={SURFACE_SPRING}
              className="relative overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-white/[0.03] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] backdrop-blur-xl sm:p-8"
            >
              <Quote
                className="absolute right-6 top-6 size-8 text-white/[0.06]"
                strokeWidth={1}
              />
              <blockquote className="relative z-10 text-[15px] leading-relaxed text-zinc-300">
                “{q.text}”
              </blockquote>
              <figcaption className="relative z-10 mt-5 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                {q.tag}
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>

        <motion.div
          className="mt-14 w-full max-w-5xl lg:mt-16"
          variants={listStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <p className="mb-6 text-left text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-500 lg:pl-1">
            Member films · demo architecture
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videoStories.map((v, i) => (
              <VideoStoryCard
                key={v.title}
                {...v}
                index={i}
                fadeChildVariants={fadeChild}
                isMobile={isMobile}
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          className="mt-14 w-full max-w-2xl lg:mt-16"
          variants={fadeMain}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <p className="mb-5 text-left text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-500 lg:pl-1">
            Accountability thread · reference UI
          </p>
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-gradient-to-b from-zinc-950/80 to-black/80 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_32px_80px_-40px_rgba(0,0,0,0.75)] backdrop-blur-2xl">
            <div className="mb-4 flex items-center gap-3 border-b border-white/[0.07] pb-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-emerald-950/40 text-emerald-400/90 ring-1 ring-emerald-500/15">
                <Zap className="size-[18px]" strokeWidth={1.35} />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">
                  Ascend · Mentor calibration
                </p>
                <p className="text-[11px] text-zinc-500">
                  Private thread · reference cadence
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {chats.map((c, i) => (
                <motion.div
                  key={c.time + String(i)}
                  initial={{ opacity: 0, x: 8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={viewport}
                  transition={txReveal(DURATION_OPACITY, i * rowStagger)}
                  className={cn(
                    "ml-auto max-w-[94%] rounded-2xl rounded-tr-sm border px-4 py-3",
                    "border-emerald-500/12 bg-emerald-950/[0.2] shadow-[0_12px_40px_-16px_rgba(0,0,0,0.55)]",
                  )}
                >
                  <p className="text-[13px] leading-relaxed text-zinc-200">
                    {c.body}
                  </p>
                  <div className="mt-2 flex items-center justify-end gap-1.5 text-[10px] text-emerald-500/65">
                    <span>{c.time}</span>
                    <CheckCheck className="size-3.5" strokeWidth={1.5} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="relative mt-16 w-full max-w-[100vw] lg:mt-20">
          <p className="mb-6 text-left text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-500 lg:pl-1">
            Proof in motion
          </p>
          <div className="relative overflow-hidden py-2">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#050505] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#050505] to-transparent" />
            <div className="flex w-max ascend-testimonial-marquee gap-5 pr-5">
              {[0, 1].map((dup) => (
                <div key={dup} className="flex shrink-0 gap-5">
                  {marqueeProof.map((item) => (
                    <div
                      key={`${dup}-${item.title}`}
                      className="w-[min(18rem,calc(100vw-3rem))] shrink-0 rounded-2xl border border-white/[0.09] bg-white/[0.035] p-5 shadow-[0_0_40px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:w-72"
                    >
                      <div className="flex items-center gap-2 text-zinc-400">
                        <TrendingUp className="size-4" strokeWidth={1.25} />
                        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                          {item.title}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                        {item.line}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-ascend-surface/40 to-transparent sm:h-24"
        aria-hidden
      />
    </section>
  );
}
