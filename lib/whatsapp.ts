/**
 * Canonical WhatsApp entry for Ascend Theory apply flow.
 * E.164 digits without + prefix.
 */
export const ASCEND_WHATSAPP_DIGITS = "917777812777";

export const ASCEND_WHATSAPP_ME_URL = "https://wa.me/917777812777";

export const PRIMARY_CTA_LABEL = "Apply for entry" as const;

/** Same wa.me target; optional prefill only when tier/context is useful. */
export function ascendWhatsAppUrl(prefill?: string): string {
  const t = prefill?.trim();
  if (!t) return ASCEND_WHATSAPP_ME_URL;
  return `${ASCEND_WHATSAPP_ME_URL}?text=${encodeURIComponent(t)}`;
}
