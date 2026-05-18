"use client";

import { AscendImage } from "@/components/AscendImage";
import { JournalReveal } from "@/components/journal/JournalReveal";
import type { JournalScene as JournalSceneData } from "@/lib/data/journal";
import { BRAND_ROUTES } from "@/lib/brand/routes";
import {
  JOURNAL_DURATION,
  JOURNAL_DURATION_SLOW,
  JOURNAL_EASE,
  JOURNAL_RISE_SUBTLE,
  JOURNAL_STAGGER,
} from "@/lib/motion/journal-motion";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type JournalSceneProps = {
  scene: JournalSceneData;
  index: number;
  scrollRoot?: HTMLElement | null;
};

export function JournalScene({ scene, index, scrollRoot }: JournalSceneProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || (scene.type !== "visual" && scene.type !== "media")) return;
    const el = mediaRef.current;
    if (!el) return;

    gsap.registerPlugin(ScrollTrigger);
    const scroller = scrollRoot ?? undefined;

    const ctx = gsap.context(() => {
      const inner = el.querySelector(".journal-scene__media-inner");
      if (!inner) return;

      gsap.fromTo(
        inner,
        { scale: 1.14, y: 48 },
        {
          scale: 1,
          y: -12,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            scroller,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.85,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [reduce, scene.type, scrollRoot]);

  useEffect(() => {
    if (reduce || scene.type !== "media") return;
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    if (!section || !sticky) return;

    gsap.registerPlugin(ScrollTrigger);
    const scroller = scrollRoot ?? undefined;
    const inner = sticky.querySelector(".journal-scene__media-inner");
    if (!inner) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        inner,
        { scale: 1.02 },
        {
          scale: 1.14,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            scroller,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5,
          },
        },
      );
    }, section);

    return () => ctx.revert();
  }, [reduce, scene.type, scrollRoot]);

  switch (scene.type) {
    case "intro":
      return (
        <section
          ref={sectionRef}
          className="journal-scene journal-scene--intro"
          data-scene={scene.id}
        >
          <motion.div
            className="journal-scene__intro-bg"
            initial={reduce ? false : { scale: 1.05 }}
            animate={reduce ? undefined : { scale: 1 }}
            transition={{ duration: 1.35, ease: JOURNAL_EASE }}
            aria-hidden
          />
          <div className="journal-scene__grain" aria-hidden />
          <div className="journal-scene__inner">
            {scene.kicker ? (
              <JournalReveal onMount delay={0.55} y={JOURNAL_RISE_SUBTLE} duration={0.95}>
                <p className="journal-scene__kicker">{scene.kicker}</p>
              </JournalReveal>
            ) : null}
            <h1 className="journal-scene__intro-lines">
              {scene.lines?.map((line, i) => (
                <JournalReveal
                  key={line}
                  onMount
                  delay={0.72 + i * 0.28}
                  y={36}
                  duration={JOURNAL_DURATION_SLOW}
                  className={cn(
                    "journal-scene__intro-line block",
                    i === 1 && "journal-scene__intro-line--secondary",
                  )}
                >
                  <span>{line}</span>
                </JournalReveal>
              ))}
            </h1>
            <JournalReveal onMount delay={1.35} y={12} duration={0.85}>
              <p className="journal-scene__scroll-hint" aria-hidden>
                Scroll
              </p>
            </JournalReveal>
          </div>
        </section>
      );

    case "visual":
      return (
        <section
          ref={sectionRef}
          className="journal-scene journal-scene--visual"
          data-scene={scene.id}
        >
          <div ref={mediaRef} className="journal-scene__media journal-scene__media--full">
            <motion.div className="journal-scene__media-inner">
              {scene.image ? (
                <AscendImage
                  src={scene.image}
                  alt={scene.imageAlt ?? ""}
                  fill
                  priority={index < 2}
                  sizes="100vw"
                  className="object-cover object-center"
                />
              ) : null}
            </motion.div>
            <div className="journal-scene__edge-blur journal-scene__edge-blur--top" aria-hidden />
            <div className="journal-scene__edge-blur journal-scene__edge-blur--bottom" aria-hidden />
            <div className="journal-scene__vignette" aria-hidden />
            <div className="journal-scene__visual-gradient" aria-hidden />
          </div>
          {scene.caption ? (
            <JournalReveal className="journal-scene__caption-wrap" y={24} delay={0.12}>
              <p className="journal-scene__caption">{scene.caption}</p>
            </JournalReveal>
          ) : null}
        </section>
      );

    case "typography":
      return (
        <section
          ref={sectionRef}
          className={cn(
            "journal-scene journal-scene--typography",
            index % 2 === 0 ? "journal-scene--align-left" : "journal-scene--align-right",
          )}
          data-scene={scene.id}
        >
          <JournalReveal y={40} duration={JOURNAL_DURATION_SLOW} delay={0.08}>
            <p className="journal-scene__statement">{scene.statement}</p>
          </JournalReveal>
        </section>
      );

    case "text":
      return (
        <section
          ref={sectionRef}
          className={cn(
            "journal-scene journal-scene--text",
            "journal-scene--align-right",
          )}
          data-scene={scene.id}
        >
          <div className="journal-scene__inner journal-scene__inner--narrow journal-scene__inner--offset">
            {scene.kicker ? <p className="journal-scene__kicker">{scene.kicker}</p> : null}
            <motion.div
              initial={reduce ? false : "hidden"}
              whileInView={reduce ? undefined : "visible"}
              viewport={{ once: true, amount: 0.45 }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: JOURNAL_STAGGER } },
              }}
            >
              {scene.body?.map((line, lineIndex) => (
                <motion.p
                  key={line}
                  className={cn(
                    "journal-scene__body-line",
                    lineIndex % 2 === 1 && "journal-scene__body-line--shift",
                  )}
                  variants={{
                    hidden: { opacity: 0, y: JOURNAL_RISE_SUBTLE },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: JOURNAL_DURATION, ease: JOURNAL_EASE },
                    },
                  }}
                >
                  {line}
                </motion.p>
              ))}
            </motion.div>
          </div>
        </section>
      );

    case "media":
      return (
        <section
          ref={sectionRef}
          className="journal-scene journal-scene--media"
          data-scene={scene.id}
        >
          <div ref={stickyRef} className="journal-scene__media journal-scene__media--sticky">
            <div ref={mediaRef} className="journal-scene__media-inner">
              {scene.image ? (
                <AscendImage
                  src={scene.image}
                  alt={scene.imageAlt ?? ""}
                  fill
                  sizes="100vw"
                  className="object-cover object-center journal-scene__media-dim"
                />
              ) : null}
            </div>
            <div className="journal-scene__edge-blur journal-scene__edge-blur--top" aria-hidden />
            <div className="journal-scene__media-overlay" aria-hidden />
            <div className="journal-scene__visual-gradient" aria-hidden />
          </div>
          <div className="journal-scene__media-copy">
            {scene.statement ? (
              <JournalReveal y={32} duration={JOURNAL_DURATION_SLOW} delay={0.45}>
                <p className="journal-scene__statement journal-scene__statement--overlay">
                  {scene.statement}
                </p>
              </JournalReveal>
            ) : null}
          </div>
        </section>
      );

    case "outro":
      return (
        <section
          ref={sectionRef}
          className="journal-scene journal-scene--outro"
          data-scene={scene.id}
        >
          <div className="journal-scene__outro-fade" aria-hidden />
          <div className="journal-scene__grain journal-scene__grain--heavy" aria-hidden />
          <div className="journal-scene__outro-inner">
            <JournalReveal y={28} duration={JOURNAL_DURATION_SLOW} delay={0.15}>
              <p className="journal-scene__closing">{scene.closing}</p>
            </JournalReveal>
            {scene.outroLine ? (
              <JournalReveal y={20} duration={JOURNAL_DURATION} delay={0.5}>
                <p className="journal-scene__outro-line">{scene.outroLine}</p>
              </JournalReveal>
            ) : null}
            {scene.subclosing ? (
              <JournalReveal y={16} duration={0.95} delay={0.75}>
                <p className="journal-scene__subclosing">{scene.subclosing}</p>
              </JournalReveal>
            ) : null}
            {scene.ctaLabel ? (
              <JournalReveal y={12} duration={0.9} delay={1.05}>
                <Link href={BRAND_ROUTES.journal} className="journal-scene__outro-cta">
                  {scene.ctaLabel}
                </Link>
              </JournalReveal>
            ) : null}
            <JournalReveal y={8} duration={0.85} delay={1.35}>
              <p className="journal-scene__outro-mark">Ascend Theory</p>
            </JournalReveal>
          </div>
        </section>
      );

    default:
      return null;
  }
}
