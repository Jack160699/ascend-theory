/**
 * Canonical WhatsApp entry for Ascend Theory apply flow.
 * E.164 digits without + prefix.
 */
export const ASCEND_WHATSAPP_DIGITS = "917777812777";

export const ASCEND_WHATSAPP_ME_URL = "https://wa.me/917777812777";

/** Primary conversion label — opens the application modal everywhere. */
export const PRIMARY_CTA_LABEL = "Start application" as const;

/** Same wa.me target; optional prefill for handoff messages. */
export function ascendWhatsAppUrl(prefill?: string): string {
  const t = prefill?.trim();
  if (!t) return ASCEND_WHATSAPP_ME_URL;
  return `${ASCEND_WHATSAPP_ME_URL}?text=${encodeURIComponent(t)}`;
}

export type PremiumIntakePayload = {
  name: string;
  age: string;
  phone: string;
  goal: string;
  frustration: string;
  instagram?: string;
  /** When opened from a pricing tier, included in the prefilled message. */
  tierInterest?: string;
};

export function formatPremiumIntakeWhatsAppBody(
  p: PremiumIntakePayload,
): string {
  const ig = p.instagram?.trim();
  const lines = [
    "Name:",
    p.name.trim(),
    "Age:",
    p.age.trim(),
    "Phone:",
    p.phone.trim(),
    "Goal:",
    p.goal.trim(),
    "Current Frustration:",
    p.frustration.trim(),
    "Instagram:",
    ig && ig.length > 0 ? ig : "—",
  ];
  if (p.tierInterest?.trim()) {
    lines.push("", "Tier of interest:", p.tierInterest.trim());
  }
  return lines.join("\n");
}

export function buildPremiumIntakeWhatsAppUrl(p: PremiumIntakePayload): string {
  return ascendWhatsAppUrl(formatPremiumIntakeWhatsAppBody(p));
}
