"use client";

import { AssessmentModal } from "@/components/AssessmentModal";
import type { TierKey } from "@/lib/lead-context";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AssessmentModalValue = {
  /** Opens the premium intake modal. Pass a tier when opened from pricing (optional context in WhatsApp). */
  openAssessment: (tier?: TierKey) => void;
  closeAssessment: () => void;
};

const AssessmentModalContext = createContext<AssessmentModalValue | null>(
  null,
);

export function AssessmentModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [tier, setTier] = useState<TierKey | null>(null);

  const openAssessment = useCallback((key?: TierKey) => {
    setTier(key ?? null);
    setOpen(true);
  }, []);

  const closeAssessment = useCallback(() => {
    setOpen(false);
  }, []);

  const value = useMemo(
    () => ({ openAssessment, closeAssessment }),
    [openAssessment, closeAssessment],
  );

  return (
    <AssessmentModalContext.Provider value={value}>
      {children}
      <AssessmentModal tier={tier} open={open} onClose={closeAssessment} />
    </AssessmentModalContext.Provider>
  );
}

export function useAssessmentModal(): AssessmentModalValue {
  const ctx = useContext(AssessmentModalContext);
  if (!ctx) {
    throw new Error("useAssessmentModal requires AssessmentModalProvider");
  }
  return ctx;
}
