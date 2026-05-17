"use client";

import { useCinematicScroll } from "@/contexts/cinematic-scroll";
import {
  initBrandMotion,
  refreshBrandScroll,
  resetBrandMotionStatic,
} from "@/lib/motion/brand-reveal";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect } from "react";

const ROOT_ID = "ascend-brand-canvas";

export function BrandOrchestrator() {
  const { lenis } = useCinematicScroll();

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.getElementById(ROOT_ID);
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 768px)").matches;

    if (reduce || !lenis) {
      resetBrandMotionStatic(root);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    root.classList.add("brand-motion-pending");

    const ctx = gsap.context(() => {
      initBrandMotion(root, { mobile });
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }, root);

    const onLoad = () => refreshBrandScroll();
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
      root.classList.remove("brand-motion-pending");
      ctx.revert();
    };
  }, [lenis]);

  return null;
}
