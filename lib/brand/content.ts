/** Editorial copy — luxury lifestyle tone, minimal density. */

export const BRAND = {
  name: "Ascend Theory",
  mark: "ASCEND THEORY",
  tagline: "Luxury in motion.",
} as const;

export const HERO_PORTAL_SUBLINE = "Elevate Your Presence" as const;

export const HERO_LINES = [
  "Built Through Discipline.",
  "Luxury In Motion.",
  "The Future Belongs To The Focused.",
] as const;

export const PHILOSOPHY = {
  eyebrow: "Philosophy",
  headline: "A standard you carry before you wear it.",
  body: [
    "Ambition without architecture becomes noise.",
    "We design for focus — not attention.",
    "Identity is what remains when the room goes quiet.",
  ],
  pillars: [
    { title: "Discipline", line: "Structure before spectacle." },
    { title: "Identity", line: "Presence before performance." },
    { title: "Ascent", line: "Standards held in private." },
  ],
} as const;

/** Dedicated /philosophy route — conversion narrative. */
export const PHILOSOPHY_PAGE = {
  eyebrow: "Philosophy",
  hook: [
    "Most people want to change.",
    "They never do.",
  ],
  tension: [
    "Ambition without structure becomes noise.",
    "You don't lack motivation.",
    "You lack direction.",
  ],
  authority: {
    lead: "We don't motivate.",
    line: "We build systems.",
  },
  system: {
    eyebrow: "The system",
    pillars: [
      {
        index: "01",
        title: "Discipline",
        line: "You do what is required. Not what feels good.",
      },
      {
        index: "02",
        title: "Identity",
        line: "You become someone who doesn't negotiate with himself.",
      },
      {
        index: "03",
        title: "Ascent",
        line: "You operate at a level most never reach.",
      },
    ],
  },
  filter: [
    "This is not for everyone.",
    "Most won't commit.",
    "Most won't last.",
  ],
  cta: {
    label: "Apply for Ascend",
    subtext: "Limited intake. Selection based.",
  },
  support: "1:1 guidance. Structured system. Real accountability.",
} as const;

export const MENTORSHIP = {
  eyebrow: "Private sessions",
  headline: "Not coaching. A room.",
  body: "For founders and operators who want clarity — not another deck.",
  note: "Selective intake · manual review",
} as const;
