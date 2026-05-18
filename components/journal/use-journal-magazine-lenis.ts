"use client";

import {
  LENIS_EDITORIAL,
  LENIS_EASING,
} from "@/lib/motion/journal-scroll";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, type RefObject } from "react";

export function useJournalMagazineLenis(
  viewportRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      ...LENIS_EDITORIAL,
      easing: LENIS_EASING,
      wrapper: viewport,
      content,
    });

    ScrollTrigger.scrollerProxy(content, {
      scrollTop(value) {
        if (arguments.length && typeof value === "number") {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const onRaf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(onRaf);
    gsap.ticker.lagSmoothing(0);

    const onRefresh = () => lenis.resize();
    ScrollTrigger.addEventListener("refresh", onRefresh);
    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      ScrollTrigger.scrollerProxy(content, {});
      gsap.ticker.remove(onRaf);
      lenis.off("scroll", onScroll);
      lenis.destroy();
    };
  }, [enabled, viewportRef, contentRef]);
}
