"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type CinematicScrollContextValue = {
  /** Active Lenis instance, or null when reduced-motion / unsupported. */
  lenis: Lenis | null;
};

const CinematicScrollContext = createContext<CinematicScrollContextValue>({
  lenis: null,
});

export function useCinematicScroll(): CinematicScrollContextValue {
  return useContext(CinematicScrollContext);
}

/** Pause smooth scroll while modals / gates lock the body. */
export function useCinematicScrollLock(locked: boolean) {
  const { lenis } = useCinematicScroll();
  useEffect(() => {
    if (!lenis) return;
    if (locked) lenis.stop();
    else lenis.start();
  }, [locked, lenis]);
}

export function CinematicScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setLenis(null);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const instance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 0.92,
      touchMultiplier: 1.05,
      smoothWheel: true,
      syncTouch: false,
    });

    lenisRef.current = instance;
    setLenis(instance);

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

    return () => {
      window.removeEventListener("resize", onResize);
      gsap.ticker.remove(onRaf);
      instance.off("scroll", onLenisScroll);
      instance.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, []);

  const value = useMemo(() => ({ lenis }), [lenis]);

  return (
    <CinematicScrollContext.Provider value={value}>
      {children}
    </CinematicScrollContext.Provider>
  );
}
