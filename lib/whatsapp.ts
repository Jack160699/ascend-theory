/**
 * Canonical WhatsApp entry for Ascend Theory apply flow.
 * E.164 digits without + prefix.
 */
export const ASCEND_WHATSAPP_DIGITS = "919584735857";

export const ASCEND_WHATSAPP_ME_URL = "https://wa.me/919584735857";

/** Display format for footer and prefill copy. */
export const ASCEND_PHONE_DISPLAY = "9584735857";

/** @deprecated Legacy sections — prefer `WORLD_CTA` on WORLD landing. */
export const HERO_CTA_LABEL = "Begin Assessment" as const;

/** @deprecated Sticky bar disabled on WORLD landing. */
export const STICKY_MOBILE_CTA_LABEL = "Begin Assessment" as const;

/** @deprecated Legacy sections — prefer `WORLD_CTA.privateApplication`. */
export const FINAL_SECTION_CTA_LABEL = "Private Application" as const;

/** Post-form handoff only — not shown on page surface. */
export const MODAL_WHATSAPP_CTA_LABEL = "Continue on WhatsApp" as const;

/** Same wa.me target; optional prefill for handoff messages. */
export function ascendWhatsAppUrl(prefill?: string): string {
  const t = prefill?.trim();
  if (!t) return ASCEND_WHATSAPP_ME_URL;
  return `${ASCEND_WHATSAPP_ME_URL}?text=${encodeURIComponent(t)}`;
}

export type WebsiteApplicationFields = {
  name: string;
  instagram: string;
  goal: string;
  challenge: string;
};

export function formatWebsiteApplicationWhatsAppBody(
  p: WebsiteApplicationFields,
): string {
  const rawIg = p.instagram.trim();
  const igLine = rawIg
    ? rawIg.startsWith("@")
      ? rawIg
      : `@${rawIg.replace(/^@+/, "")}`
    : "—";

  return [
    "Hi Ascend Theory,",
    "",
    `My name is ${p.name.trim()}.`,
    "",
    "Instagram:",
    igLine,
    "",
    "Current goal:",
    p.goal.trim(),
    "",
    "Biggest challenge:",
    p.challenge.trim(),
    "",
    "I came through the website application.",
    "",
    "— Sent from Ascend Theory",
  ].join("\n");
}

export function buildWebsiteApplicationWhatsAppUrl(
  p: WebsiteApplicationFields,
): string {
  return ascendWhatsAppUrl(formatWebsiteApplicationWhatsAppBody(p));
}
