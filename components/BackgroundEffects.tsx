"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

/** Fixed layout — identical on server and client (no runtime randomness). */
const PARTICLES = [
  {
    id: 0,
    left: 8,
    top: 68.47,
    size: 3.436,
    duration: 17.6,
    delay: 7.8,
    driftX: 5.15,
    driftY: 12.42,
  },
  {
    id: 1,
    left: 35.32,
    top: 29.63,
    size: 1.981,
    duration: 28.32,
    delay: 7.25,
    driftX: 3.31,
    driftY: 3.02,
  },
  {
    id: 2,
    left: 26.82,
    top: 51.02,
    size: 3.283,
    duration: 18.28,
    delay: 7.76,
    driftX: -8.19,
    driftY: -3.78,
  },
  {
    id: 3,
    left: 80.28,
    top: 12.23,
    size: 2.449,
    duration: 21.02,
    delay: 5.64,
    driftX: -4.17,
    driftY: 15.07,
  },
  {
    id: 4,
    left: 52.39,
    top: 36.98,
    size: 1.05,
    duration: 29.41,
    delay: 2.31,
    driftX: 4.06,
    driftY: 4.13,
  },
  {
    id: 5,
    left: 64.43,
    top: 87.45,
    size: 3.162,
    duration: 30.47,
    delay: 7.56,
    driftX: -6.52,
    driftY: -9.21,
  },
  {
    id: 6,
    left: 88.37,
    top: 15.67,
    size: 2.219,
    duration: 19.52,
    delay: 7.47,
    driftX: 4.7,
    driftY: 11.39,
  },
  {
    id: 7,
    left: 54.72,
    top: 76.21,
    size: 2.595,
    duration: 25.88,
    delay: 4.9,
    driftX: 0.58,
    driftY: 6.63,
  },
  {
    id: 8,
    left: 17.13,
    top: 64.55,
    size: 2.928,
    duration: 19.37,
    delay: 5.71,
    driftX: -3.34,
    driftY: 14.79,
  },
  {
    id: 9,
    left: 91.27,
    top: 73.36,
    size: 1.391,
    duration: 14.38,
    delay: 7.75,
    driftX: -9.79,
    driftY: -5.08,
  },
  {
    id: 10,
    left: 91.09,
    top: 36.43,
    size: 1.765,
    duration: 14.05,
    delay: 5.3,
    driftX: 0.95,
    driftY: -13.14,
  },
  {
    id: 11,
    left: 71.8,
    top: 47.26,
    size: 2.029,
    duration: 25.16,
    delay: 6.03,
    driftX: -5.23,
    driftY: -1.12,
  },
  {
    id: 12,
    left: 46.39,
    top: 83.28,
    size: 2.295,
    duration: 15.8,
    delay: 6.23,
    driftX: 7.73,
    driftY: -0.3,
  },
  {
    id: 13,
    left: 33.06,
    top: 76.29,
    size: 2.141,
    duration: 23.06,
    delay: 0.24,
    driftX: -8.02,
    driftY: -13.99,
  },
  {
    id: 14,
    left: 17.89,
    top: 86.81,
    size: 2.209,
    duration: 28.58,
    delay: 3.9,
    driftX: -4.17,
    driftY: -13.57,
  },
  {
    id: 15,
    left: 65.06,
    top: 41.61,
    size: 1.417,
    duration: 20.39,
    delay: 2.29,
    driftX: -0.59,
    driftY: 6.57,
  },
  {
    id: 16,
    left: 10.65,
    top: 10.52,
    size: 3.447,
    duration: 30.35,
    delay: 2.87,
    driftX: -6.45,
    driftY: 9.59,
  },
  {
    id: 17,
    left: 70.01,
    top: 55.23,
    size: 2.742,
    duration: 22.6,
    delay: 3.31,
    driftX: -9.54,
    driftY: 0.4,
  },
] as const;

export function BackgroundEffects({ className }: { className?: string }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const particles = isMobile ? PARTICLES.slice(0, 8) : PARTICLES;

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[#050505]" />
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/85 via-[#070707] to-black" />

      <motion.div
        className={cn(
          "absolute -left-[20%] top-[12%] rounded-full bg-zinc-500/[0.07]",
          isMobile
            ? "h-[22rem] w-[22rem] blur-[56px]"
            : "h-[38rem] w-[38rem] blur-[100px]",
        )}
        animate={{ x: [0, 28, 0], y: [0, 18, 0], opacity: [0.45, 0.65, 0.45] }}
        transition={{
          duration: isMobile ? 36 : 28,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className={cn(
          "absolute -right-[18%] bottom-[5%] rounded-full bg-white/[0.035]",
          isMobile
            ? "h-[20rem] w-[20rem] blur-[58px]"
            : "h-[32rem] w-[32rem] blur-[110px]",
        )}
        animate={{
          x: [0, -22, 0],
          y: [0, -14, 0],
          opacity: [0.35, 0.55, 0.35],
        }}
        transition={{
          duration: isMobile ? 40 : 32,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className={cn(
          "absolute left-[25%] top-[40%] rounded-full bg-zinc-400/[0.05]",
          isMobile
            ? "h-[12rem] w-[12rem] blur-[50px]"
            : "h-[20rem] w-[20rem] blur-[90px]",
        )}
        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.65, 0.4] }}
        transition={{
          duration: isMobile ? 34 : 24,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-15%,rgba(255,255,255,0.07),transparent_55%)]"
        animate={{ opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_72%)]" />

      <motion.div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          background:
            "linear-gradient(125deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)",
          backgroundSize: "200% 200%",
        }}
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
      />

      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-white/[0.12]"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            x: [0, p.driftX, 0],
            y: [0, p.driftY, 0],
            opacity: [0.15, 0.45, 0.15],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}
