"use client";

import { useEffect, useRef, useState } from "react";

const CURSOR_LAYER_OPACITY = 0.052;

/**
 * Extremely subtle viewport-wide radial that follows the pointer.
 * Disabled on small viewports and when reduced motion is preferred.
 */
export function CursorAmbientLight() {
  const [enabled, setEnabled] = useState(false);
  const pos = useRef({ x: 50, y: 38 });
  const target = useRef({ x: 50, y: 38 });
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 769px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(mq.matches && !reduce.matches);
    sync();
    mq.addEventListener("change", sync);
    reduce.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      reduce.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.style.setProperty("--ascend-cursor-x", "50%");
    root.style.setProperty("--ascend-cursor-y", "38%");

    const apply = () => {
      const lerp = 0.1;
      pos.current.x += (target.current.x - pos.current.x) * lerp;
      pos.current.y += (target.current.y - pos.current.y) * lerp;
      root.style.setProperty("--ascend-cursor-x", `${pos.current.x}%`);
      root.style.setProperty("--ascend-cursor-y", `${pos.current.y}%`);
    };

    const onMove = (e: MouseEvent) => {
      target.current.x = (e.clientX / window.innerWidth) * 100;
      target.current.y = (e.clientY / window.innerHeight) * 100;
      if (raf.current != null) return;
      raf.current = window.requestAnimationFrame(() => {
        apply();
        raf.current = null;
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf.current != null) window.cancelAnimationFrame(raf.current);
      root.style.removeProperty("--ascend-cursor-x");
      root.style.removeProperty("--ascend-cursor-y");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 mix-blend-soft-light"
      style={{
        opacity: CURSOR_LAYER_OPACITY,
        background: `radial-gradient(92vw 78vh at var(--ascend-cursor-x, 50%) var(--ascend-cursor-y, 38%), rgba(255,255,255,0.24), transparent 70%)`,
      }}
      aria-hidden
    />
  );
}
