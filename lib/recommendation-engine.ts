import { tierLabel, type TierKey, type TierLeadAssessment } from "@/lib/lead-context";

export type RecommendationOutput = {
  appliedTier: TierKey;
  recommendedTier: TierKey;
  headline: string;
  summary: string;
  whyBullets: string[];
  trustNote?: string;
};

function blobFromLead(lead: TierLeadAssessment): string {
  switch (lead.tier) {
    case "core": {
      const a = lead.answers;
      return `${a.struggle} ${a.goal}`.toLowerCase();
    }
    case "pro": {
      const a = lead.answers;
      return `${a.misaligned} ${a.transformation}`.toLowerCase();
    }
    case "black": {
      const a = lead.answers;
      return `${a.transformationLevel} ${a.whyPrivate}`.toLowerCase();
    }
  }
}

function countHits(blob: string, terms: readonly string[]): number {
  let n = 0;
  for (const t of terms) {
    if (blob.includes(t)) n += 1;
  }
  return n;
}

const BLACK_SIGNALS = [
  "founder",
  "co-founder",
  "cofounder",
  "executive",
  "ceo",
  "c-suite",
  "c suite",
  "board",
  "chairman",
  "chairperson",
  "nri",
  "portfolio",
  "acquisition",
  "investor",
  "enterprise",
  "high performance",
  "high-performance",
  "discretion",
  "private office",
  "public figure",
  "managing director",
  "elite",
  "exclusive",
  "confidential",
  "scale the",
  "global role",
] as const;

const PRO_SIGNALS = [
  "identity",
  "accountability",
  "presence",
  "communication",
  "discipline",
  "deeper",
  "whole life",
  "serious",
  "urgent",
  "urgency",
  "leadership",
  "career",
  "burnout",
  "rebuild",
  "misaligned",
  "alignment",
  "mentorship",
  "transformation",
  "stuck for",
  "years of",
  "executive presence",
  "confidence under pressure",
] as const;

const CORE_SIGNALS = [
  "beginner",
  "starting",
  "first step",
  "foundation",
  "structure",
  "habit",
  "routine",
  "inconsistent",
  "student",
  "new to",
  "learn",
  "weekly",
  "group",
  "accountability buddy",
  "getting started",
  "build consistency",
  "small steps",
] as const;

/**
 * Trust-first alignment: honors the path the user chose, uses text only to
 * nuance — never pushes Black without selective signals; never pushes Black from Core/Pro flows.
 */
export function interpretAssessment(lead: TierLeadAssessment): RecommendationOutput {
  const appliedTier = lead.tier;
  const blob = blobFromLead(lead);
  const len = blob.length;

  const blackHits = countHits(blob, BLACK_SIGNALS);
  const proHits = countHits(blob, PRO_SIGNALS);
  const coreHits = countHits(blob, CORE_SIGNALS);

  const shallow = len < 90;

  if (appliedTier === "core") {
    const strongPro = proHits >= 5 && coreHits <= 1;
    if (strongPro) {
      return {
        appliedTier,
        recommendedTier: "pro",
        headline: "Recommended Path: Ascend Pro",
        summary:
          "Your language carries identity-level stakes and appetite for closer mentorship — Pro’s accountability density appears proportionate without jumping past what you substantiated.",
        whyBullets: [
          "Identity, communication, or professional pressure reads as sustained",
          "Mentorship proximity and response priority appear proportionate",
          "Black remains off-table without explicit private-tier context from you",
        ],
      };
    }
    const moderateProHints = proHits >= 2;
    return {
      appliedTier,
      recommendedTier: "core",
      headline: "Best Starting Point: Ascend Core",
        summary:
          "Based on your responses, your strongest growth edge appears to be consistency, structure, and accountable foundations — a foundation rhythm before higher-touch density.",
        whyBullets: [
          "Signals map to a structuring season more than an overload season",
          "Cadence and accountability systems appear most aligned first",
          "Discipline compounds cleaner when the container matches the stage",
        ],
        trustNote: moderateProHints
        ? "There are hints of Pro-grade stakes — Core still reads as the most honest entry today."
        : undefined,
    };
  }

  if (appliedTier === "pro") {
    const thin = shallow && proHits <= 1 && coreHits >= 1;
    if (thin) {
      return {
        appliedTier,
        recommendedTier: "core",
        headline: "Best Starting Point: Ascend Core",
        summary:
          "Your answers read as early-stage and still forming — Core’s structured rhythm may match you more cleanly than a dense Pro container right now.",
        whyBullets: [
          "Depth suggests foundation season over maximum proximity season",
          "Core’s cadence can build the base Pro amplifies later",
          "We bias toward clarity over capacity — never pressure",
        ],
      };
    }
    return {
      appliedTier,
      recommendedTier: "pro",
      headline: "Recommended Path: Ascend Pro",
      summary:
        "Your responses suggest readiness for deeper mentorship — higher accountability structure and mentor proximity appear aligned with what you shared.",
      whyBullets: [
        "Identity, communication, or lifestyle stakes read as non-superficial",
        "Accountability density appears proportionate to the stakes described",
        "Black stays closed unless your context clearly warrants private allocation",
      ],
    };
  }

  const blackEligible = blackHits >= 3;
  if (blackEligible) {
    return {
      appliedTier,
      recommendedTier: "black",
      headline: "Private Path Consideration: Ascend Black",
      summary:
        "Your language signals discretion-heavy context or executive-grade tempo — Black may warrant consideration, always reviewed manually.",
      whyBullets: [
        "Private / high-performance signals crossed a selective threshold",
        "Commitment tone appears consistent with reserved allocation",
        "Manual review remains the only path — never automatic entitlement",
      ],
    };
  }

  return {
    appliedTier,
    recommendedTier: "pro",
    headline: "Ascend Pro may currently provide the strongest mentorship-depth fit",
    summary:
      "Black stays intentionally narrow. From what you shared, Pro appears to carry the accountability architecture without moving you into private allocation prematurely.",
    whyBullets: [
      "Private-tier signals stayed below the selective threshold",
      "Pro preserves elevated proximity, response priority, and lifestyle architecture",
      "Black remains available if your context materially changes",
    ],
    trustNote:
      "Honest calibration — Pro is not a consolation tier.",
  };
}

export function recommendationForStorage(rec: RecommendationOutput) {
  return {
    appliedTier: rec.appliedTier,
    appliedLabel: tierLabel(rec.appliedTier),
    recommendedTier: rec.recommendedTier,
    recommendedLabel: tierLabel(rec.recommendedTier),
    headline: rec.headline,
    summary: rec.summary,
    whyBullets: rec.whyBullets,
    trustNote: rec.trustNote ?? null,
  };
}
