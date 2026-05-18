/**
 * Canonical WhatsApp entry for Ascend Theory apply flow.
 * E.164 digits without + prefix — used for `https://wa.me/{digits}` (mobile, desktop & WhatsApp Web).
 */
export const ASCEND_WHATSAPP_DIGITS = "447577300441";

export const ASCEND_WHATSAPP_ME_URL = "https://wa.me/447577300441";

/** Display format where a phone line is shown (readable international). */
export const ASCEND_PHONE_DISPLAY = "+44 7577 300441";

/** @deprecated Legacy sections — WORLD landing uses `WORLD_CTA` (see lib/world-cta.ts). */
export const HERO_CTA_LABEL = "Enter Now" as const;

/** @deprecated Sticky bar disabled on WORLD landing. */
export const STICKY_MOBILE_CTA_LABEL = "Enter Now" as const;

/** @deprecated Legacy sections — WORLD landing Final uses `WORLD_CTA.beginTheAscent`. */
export const FINAL_SECTION_CTA_LABEL = "Begin Application" as const;

/** Apply modal primary action */
export const MODAL_WHATSAPP_CTA_LABEL = "Continue on WhatsApp" as const;

/** Same wa.me target; optional prefill for handoff messages. */
export function ascendWhatsAppUrl(prefill?: string): string {
  const t = prefill?.trim();
  if (!t) return ASCEND_WHATSAPP_ME_URL;
  return `${ASCEND_WHATSAPP_ME_URL}?text=${encodeURIComponent(t)}`;
}

export type WebsiteApplicationFields = {
  name: string;
  age: string;
  instagram: string;
  needsChange: string;
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
    `Name: ${p.name.trim()}`,
    `Age: ${p.age.trim()}`,
    `Instagram: ${igLine}`,
    "",
    "What needs to change:",
    p.needsChange.trim(),
    "",
    "Requesting entry into Ascend Theory.",
  ].join("\n");
}

export function buildWebsiteApplicationWhatsAppUrl(
  p: WebsiteApplicationFields,
): string {
  return ascendWhatsAppUrl(formatWebsiteApplicationWhatsAppBody(p));
}
