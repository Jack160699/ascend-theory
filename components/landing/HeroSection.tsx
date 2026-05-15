"use client";

import { SceneContent } from "@/components/landing/world/SceneContent";
import { StickyScene } from "@/components/landing/world/StickyScene";
import { HERO_SCENES } from "@/lib/figma-world-content";
import { EASE_CINEMATIC } from "@/lib/motion";
import { SCENE_SCROLL } from "@/lib/world-scene-metrics";
import { motion, useReducedMotion } from "framer-motion";

export function HeroSection() {
  const scene = HERO_SCENES.hero;
  const reduceMotion = useReducedMotion();

  return (
    <StickyScene
      id="hero"
      variant="hero"
      scrollHeight={SCENE_SCROLL.hero}
      image={scene.image}
      imageAlt={scene.imageAlt}
      imageClass={scene.imageClass}
      imagePosition="center"
      priority
      gradientClass="bg-gradient-to-br from-transparent via-[#0d0d0d]/65 to-[#0d0d0d]/92"
      warmGlowClass="world-warm-glow"
      contentClassName="flex flex-col justify-between px-5 py-7 sm:py-8"
      parallax={{ scale: [1, 1.1], y: [0, -24] }}
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.4, ease: EASE_CINEMATIC }}
        className="world-brand-mark relative z-10"
      >
        ASCEND THEORY
      </motion.div>

      <SceneContent layout="bottom" innerClassName="pb-2 sm:pb-4">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.85, ease: EASE_CINEMATIC }}
        >
          <h1 className="world-display world-display--hero">
            You know
            <br />
            you&apos;re wasting
            <br />
            your potential.
          </h1>
        </motion.div>
      </SceneContent>
    </StickyScene>
  );
}
