"use client";

import { VIEWPORT_CALM, VIEWPORT_CALM_MOBILE } from "@/lib/motion/timing";
import { createContext, useContext, useSyncExternalStore } from "react";

const MobileConversionContext = createContext(false);

function subscribe(onStoreChange: () => void) {
  const mq = window.matchMedia("(max-width: 767px)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getSnapshot() {
  return window.matchMedia("(max-width: 767px)").matches;
}

function getServerSnapshot() {
  return false;
}

export function MobileConversionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return (
    <MobileConversionContext.Provider value={isMobile}>
      {children}
    </MobileConversionContext.Provider>
  );
}

/** True on viewports ≤767px (client); false on SSR first paint. */
export function useIsMobileConversion(): boolean {
  return useContext(MobileConversionContext);
}

export function useRevealViewport() {
  const isMobile = useIsMobileConversion();
  return isMobile ? VIEWPORT_CALM_MOBILE : VIEWPORT_CALM;
}
