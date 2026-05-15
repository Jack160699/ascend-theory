"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";

/** Empty = no ribbon / urgency strip (avoid repeating intake copy site-wide). */
const STATIC_NOTICE = "";

type ConversionValue = {
  urgencyMessage: string;
  urgencyForTier: (_offset: number) => string;
};

const ConversionContext = createContext<ConversionValue | null>(null);

export function useConversionExperience(): ConversionValue {
  const ctx = useContext(ConversionContext);
  if (!ctx) {
    throw new Error(
      "useConversionExperience requires ConversionExperienceProvider",
    );
  }
  return ctx;
}

export function useConversionExperienceOptional(): ConversionValue | null {
  return useContext(ConversionContext);
}

export function ConversionExperienceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const urgencyForTier = useCallback(() => STATIC_NOTICE, []);

  const value = useMemo<ConversionValue>(
    () => ({
      urgencyMessage: STATIC_NOTICE,
      urgencyForTier,
    }),
    [urgencyForTier],
  );

  return (
    <ConversionContext.Provider value={value}>
      {children}
    </ConversionContext.Provider>
  );
}
