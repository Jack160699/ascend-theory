/**
 * Tier assessment lead context for WhatsApp handoff, session replay, and future AI / CRM.
 */

import { ASCEND_WHATSAPP_DIGITS } from "@/lib/whatsapp";

export const ASSESSMENT_SCHEMA_VERSION = 3 as const;

export type TierKey = "core" | "pro" | "black";

export const TIER_LABELS: Record<TierKey, string> = {
  core: "Ascend Core",
  pro: "Ascend Pro",
  black: "Ascend Black",
};

export type AssessmentContactFields = {
  /** Optional — included in WhatsApp + payload when provided */
  phone?: string;
  email?: string;
};

export type CoreAssessmentAnswers = {
  fullName: string;
  struggle: string;
  goal: string;
} & AssessmentContactFields;

export type ProAssessmentAnswers = {
  fullName: string;
  misaligned: string;
  transformation: string;
} & AssessmentContactFields;

export type BlackAssessmentAnswers = {
  fullName: string;
  transformationLevel: string;
  whyPrivate: string;
} & AssessmentContactFields;

export type TierLeadAssessment =
  | { tier: "core"; answers: CoreAssessmentAnswers }
  | { tier: "pro"; answers: ProAssessmentAnswers }
  | { tier: "black"; answers: BlackAssessmentAnswers };

export type AssessmentRecommendationBlock = {
  recommendedTier: TierKey;
  headline: string;
  summary: string;
  whyBullets: readonly string[];
  trustNote?: string | null;
};

export type TierLeadAssessmentPayload = TierLeadAssessment & {
  schemaVersion: typeof ASSESSMENT_SCHEMA_VERSION;
  channel: "tier_assessment_modal";
  submittedAt: string;
  recommendation?: AssessmentRecommendationBlock;
};

export function normalizeWhatsAppDigits(input: string): string {
  return input.replace(/\D/g, "");
}

export function tierLabel(tier: TierKey): string {
  return TIER_LABELS[tier];
}

/** Short summary for AI / sales context (plain text). */
function contactSummaryLines(answers: AssessmentContactFields): string[] {
  const lines: string[] = [];
  const p = answers.phone?.trim();
  const e = answers.email?.trim();
  if (p) lines.push(`Phone: ${p}`);
  if (e) lines.push(`Email: ${e}`);
  return lines;
}

export function formatLeadSummary(lead: TierLeadAssessment): string {
  const name = lead.answers.fullName.trim();
  const contact = contactSummaryLines(lead.answers);
  if (lead.tier === "core") {
    const a = lead.answers;
    return [
      `Tier: ${tierLabel("core")}`,
      `Name: ${name}`,
      ...contact,
      `Struggle: ${a.struggle.trim()}`,
      `Goal: ${a.goal.trim()}`,
    ].join("\n");
  }
  if (lead.tier === "pro") {
    const a = lead.answers;
    return [
      `Tier: ${tierLabel("pro")}`,
      `Name: ${name}`,
      ...contact,
      `Misaligned area: ${a.misaligned.trim()}`,
      `Transformation focus: ${a.transformation.trim()}`,
    ].join("\n");
  }
  const a = lead.answers;
  return [
    `Tier: ${tierLabel("black")}`,
    `Name: ${name}`,
    ...contact,
    `Transformation level: ${a.transformationLevel.trim()}`,
    `Why private mentorship: ${a.whyPrivate.trim()}`,
  ].join("\n");
}

function baseWhatsAppBody(lead: TierLeadAssessment): string[] {
  const tier = tierLabel(lead.tier);
  const name = lead.answers.fullName.trim();
  const contact = contactSummaryLines(lead.answers);

  if (lead.tier === "core") {
    const a = lead.answers;
    return [
      "Ascend Theory — assessment handoff",
      "",
      `Path: ${tier}`,
      `Name: ${name}`,
      ...contact,
      `Current tension: ${a.struggle.trim()}`,
      `Desired shift: ${a.goal.trim()}`,
      "",
    ];
  }

  if (lead.tier === "pro") {
    const a = lead.answers;
    return [
      "Ascend Theory — assessment handoff",
      "",
      `Path: ${tier}`,
      `Name: ${name}`,
      ...contact,
      `Misalignment: ${a.misaligned.trim()}`,
      `Priority transformation: ${a.transformation.trim()}`,
      "",
    ];
  }

  const a = lead.answers;
  return [
    "Ascend Theory — private allocation request",
    "",
    `Path: ${tier}`,
    `Name: ${name}`,
    ...contact,
    `Transformation depth sought: ${a.transformationLevel.trim()}`,
    `Why private mentorship: ${a.whyPrivate.trim()}`,
    "",
  ];
}

export function buildTierWhatsAppMessage(
  lead: TierLeadAssessment,
  recommendation?: AssessmentRecommendationBlock,
): string {
  const lines = [...baseWhatsAppBody(lead)];

  if (recommendation) {
    lines.push("— Alignment read —");
    lines.push(`${tierLabel(recommendation.recommendedTier)} · ${recommendation.headline}`);
    lines.push(recommendation.summary);
    lines.push("Signals:");
    recommendation.whyBullets.forEach((b) => lines.push(`· ${b}`));
    if (recommendation.trustNote) {
      lines.push(recommendation.trustNote);
    }
    lines.push("");
  }

  lines.push(
    "WhatsApp for a calm next step — context preserved above.",
  );

  return lines.join("\n");
}

export function formatLeadContextForBot(payload: TierLeadAssessmentPayload): string {
  return JSON.stringify(payload, null, 2);
}

export function toTierLeadPayload(
  lead: TierLeadAssessment,
  recommendation?: AssessmentRecommendationBlock,
): TierLeadAssessmentPayload {
  return {
    ...lead,
    schemaVersion: ASSESSMENT_SCHEMA_VERSION,
    channel: "tier_assessment_modal",
    submittedAt: new Date().toISOString(),
    ...(recommendation ? { recommendation } : {}),
  };
}

/**
 * Business WhatsApp number (country code + number, digits only).
 * Set `NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER` in `.env.local` / Vercel (digits only, e.g. 447577300441).
 */
export function getWhatsAppBusinessDigits(): string {
  const fromEnv = normalizeWhatsAppDigits(
    process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER ?? "",
  );
  return fromEnv || ASCEND_WHATSAPP_DIGITS;
}

export function buildWhatsAppTierAssessmentUrl(
  lead: TierLeadAssessment,
  recommendation?: AssessmentRecommendationBlock,
): string | null {
  const digits = getWhatsAppBusinessDigits();
  if (!digits) return null;
  const text = buildTierWhatsAppMessage(lead, recommendation);
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

/** @deprecated Use TierKey — kept for gradual refactors */
export type ProgramTier = TierKey;
