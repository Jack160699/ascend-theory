import { ASCEND_PRODUCT_IMAGES } from "@/lib/product-images";

export type JournalArticle = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  image: string;
  imageAlt: string;
  content: readonly string[];
};

export const JOURNAL_ARTICLES: readonly JournalArticle[] = [
  {
    slug: "discipline-as-aesthetics",
    title: "On discipline as aesthetics",
    excerpt: "Structure is the frame that makes expression legible.",
    date: "Field note · 04",
    readTime: "4 min",
    image: ASCEND_PRODUCT_IMAGES.editorialArchitecture,
    imageAlt: "Architectural lines — discipline as aesthetics",
    content: [
      "Discipline is not punishment. It is composition.",
      "When your days have rhythm, your choices have weight.",
      "We do not design for motivation. We design for the person who already decided.",
    ],
  },
  {
    slug: "quiet-cost-of-focus",
    title: "The quiet cost of focus",
    excerpt: "Focus charges interest in sleep, spontaneity, and noise.",
    date: "Essay · 03",
    readTime: "6 min",
    image: ASCEND_PRODUCT_IMAGES.teamStudio,
    imageAlt: "Studio portrait — the quiet cost of focus",
    content: [
      "Everyone wants the outcome. Few accept the invoice.",
      "You will miss dinners. You will answer late. That is allocation — not failure.",
      "The disciplined life is quiet because you chose direction.",
    ],
  },
  {
    slug: "modern-masculinity-without-theatre",
    title: "Modern masculinity, without theatre",
    excerpt: "Strength without performance. Presence without posturing.",
    date: "Editorial · 02",
    readTime: "5 min",
    image: ASCEND_PRODUCT_IMAGES.heroStorefront,
    imageAlt: "City night — modern masculinity editorial",
    content: [
      "The old script said: perform, dominate, announce.",
      "The new standard says: build, hold, move.",
      "No theatre. No slogans. Only the work — and what you wear while doing it.",
    ],
  },
] as const;

const journalMap = new Map(JOURNAL_ARTICLES.map((a) => [a.slug, a]));

export function getJournalBySlug(slug: string): JournalArticle | undefined {
  return journalMap.get(slug);
}

export function getAllJournalSlugs(): string[] {
  return JOURNAL_ARTICLES.map((a) => a.slug);
}

export const JOURNAL_INDEX = {
  eyebrow: "Journal",
  headline: "Notes from the ascent.",
  subline: "Short reads. No noise.",
} as const;
