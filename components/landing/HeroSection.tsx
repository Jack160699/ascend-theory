"use client";

import { StickyScene } from "@/components/landing/world/StickyScene";
import { HERO_SCENES } from "@/lib/figma-world-content";
import { EASE_CINEMATIC } from "@/lib/motion";
import { motion } from "framer-motion";

export function HeroSection() {
  const scene = HERO_SCENES.hero;

  return (
    <StickyScene
      id="hero"
      variant="hero"
      scrollHeight="150vh"
      image={scene.image}
      imageAlt={scene.imageAlt}
      imageClass={scene.imageClass}
      imagePosition="center"
      gradientClass="bg-gradient-to-br from-transparent via-[#0d0d0d]/60 to-[#0d0d0d]/90"
      warmGlowClass="world-warm-glow"
      contentClassName="flex flex-col justify-between px-5 py-8"
      parallax={{ scale: [1, 1.12], y: [0, -30] }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.5, ease: EASE_CINEMATIC }}
        className="world-brand-mark"
      >
        ASCEND THEORY
      </motion.div>

      <motion.div
        className="pb-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 1, ease: EASE_CINEMATIC }}
      >
        <h1 className="world-display world-display--hero">
          You know
          <br />
          you&apos;re wasting
          <br />
          your potential.
        </h1>
      </motion.div>
    </StickyScene>
  );
}
