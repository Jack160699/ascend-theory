"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  LENIS_DEFAULT,
  LENIS_EDITORIAL,
  LENIS_EASING,
} from "@/lib/motion/journal-scroll";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ScrollVariant = "default" | "editorial";

type CinematicScrollContextValue = {
  lenis: Lenis | null;
};

const CinematicScrollContext = createContext<CinematicScrollContextValue>({
  lenis: null,
});

export function useCinematicScroll(): CinematicScrollContextValue {
  return useContext(CinematicScrollContext);
}

export function useCinematicScrollLock(locked: boolean) {
  const { lenis } = useCinematicScroll();
  useEffect(() => {
    if (!lenis) return;
    if (locked) lenis.stop();
    else lenis.start();
  }, [locked, lenis]);
}

type CinematicScrollProviderProps = {
  children: ReactNode;
  variant?: ScrollVariant;
};

export function CinematicScrollProvider({
  children,
  variant = "default",
}: CinematicScrollProviderProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const profile = variant === "editorial" ? LENIS_EDITORIAL : LENIS_DEFAULT;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    gsap.registerPlugin(ScrollTrigger);

    const instance = new Lenis({
      ...profile,
      easing: LENIS_EASING,
    });

    const onLenisScroll = () => {
      ScrollTrigger.update();
    };
    instance.on("scroll", onLenisScroll);

    const onRaf = (time: number) => {
      instance.raf(time * 1000);
    };
    gsap.ticker.add(onRaf);
    gsap.ticker.lagSmoothing(0);

    const onResize = () => {
      instance.resize();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    const frame = requestAnimationFrame(() => {
      setLenis(instance);
    });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      gsap.ticker.remove(onRaf);
      instance.off("scroll", onLenisScroll);
      instance.destroy();
      setLenis(null);
    };
  }, [variant]);

  const value = useMemo(() => ({ lenis }), [lenis]);

  return (
    <CinematicScrollContext.Provider value={value}>
      {children}
    </CinematicScrollContext.Provider>
  );
}
