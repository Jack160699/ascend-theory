/** Editorial copy — luxury lifestyle tone, minimal density. */

export const BRAND = {
  name: "Ascend Theory",
  mark: "ASCEND THEORY",
  tagline: "Luxury in motion.",
} as const;

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
    "We design for focus, identity, and the quiet discipline of people building in public — and in private.",
  ],
  pillars: [
    { title: "Discipline", line: "Structure before spectacle." },
    { title: "Identity", line: "How you move is who you are." },
    { title: "Creator life", line: "Performance as a daily practice." },
  ],
} as const;

export const WEARABLES = {
  eyebrow: "Wearables",
  headline: "Objects for the focused life.",
  categories: [
    {
      id: "apparel",
      title: "Apparel",
      line: "Matte silhouettes. Editorial cuts. No logos shouting.",
      imageKey: "lifestyleGolf" as const,
    },
    {
      id: "eyewear",
      title: "Eyewear",
      line: "Sharp lines. Low light. City and coast.",
      imageKey: "lifestyleAirport" as const,
    },
    {
      id: "accessories",
      title: "Accessories",
      line: "Restraint as luxury. Details that stay close.",
      imageKey: "lifestyleCoastal" as const,
    },
  ],
} as const;

export const FEATURED_DROP = {
  eyebrow: "Featured drop",
  name: "Ascend / 01",
  headline: "Limited. Intentional. Gone when it closes.",
  body: "A single release — not a catalog. Each piece is cut for people who already live the standard.",
  status: "Allocation open",
} as const;

export const JOURNAL = {
  eyebrow: "Journal",
  headline: "Notes from the ascent.",
  entries: [
    {
      title: "On discipline as aesthetics",
      date: "Field note · 04",
      read: "4 min",
    },
    {
      title: "The quiet cost of focus",
      date: "Essay · 03",
      read: "6 min",
    },
    {
      title: "Modern masculinity, without theatre",
      date: "Editorial · 02",
      read: "5 min",
    },
  ],
} as const;

export const MENTORSHIP = {
  eyebrow: "Private sessions",
  headline: "Not coaching. A room.",
  body: "High-value private sessions for founders, creators, and operators who want clarity — not another framework deck.",
  note: "Selective intake · manual review",
} as const;
