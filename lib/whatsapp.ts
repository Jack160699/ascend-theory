/**
 * Canonical WhatsApp entry for Ascend Theory apply flow.
 * E.164 digits without + prefix.
 */
export const ASCEND_WHATSAPP_DIGITS = "917777812777";

export const ASCEND_WHATSAPP_ME_URL = "https://wa.me/917777812777";

/** Hero — primary conversion (modal). */
export const HERO_CTA_LABEL = "Apply privately" as const;

/** Mobile sticky bar — opens modal after scroll threshold. */
export const STICKY_MOBILE_CTA_LABEL = "Private entry" as const;

/** Final section — opens modal. */
export const FINAL_SECTION_CTA_LABEL = "Apply privately" as const;

/** Application modal — WhatsApp handoff. */
export const MODAL_WHATSAPP_CTA_LABEL = "Open WhatsApp" as const;

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
    "",
    "Phone number:",
    "7777812777",
  ].join("\n");
}

export function buildWebsiteApplicationWhatsAppUrl(
  p: WebsiteApplicationFields,
): string {
  return ascendWhatsAppUrl(formatWebsiteApplicationWhatsAppBody(p));
}
