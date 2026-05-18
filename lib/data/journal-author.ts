import { ASCEND_WHATSAPP_ME_URL } from "@/lib/whatsapp";

/** Journal author card — human layer, consistent across issues */
export const JOURNAL_AUTHOR_SOCIAL = {
  instagramUrl: "https://www.instagram.com/ascendtheory/",
  whatsappUrl: ASCEND_WHATSAPP_ME_URL,
  handle: "@ascendtheory",
  displayName: "Ascend Theory",
  tagline: "Minimal. Intentional. Structured evolution.",
  avatarSrc: "/images/ascend/team-studio.webp",
} as const;
