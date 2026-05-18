"use client";

import { useEffect } from "react";

const LOCK_CLASS = "portal-scroll-lock";

/** Locks html/body scroll for fixed cinematic homepage only. */
export function usePortalScrollLock() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    html.classList.add(LOCK_CLASS);
    body.classList.add(LOCK_CLASS);

    return () => {
      html.classList.remove(LOCK_CLASS);
      body.classList.remove(LOCK_CLASS);
    };
  }, []);
}
