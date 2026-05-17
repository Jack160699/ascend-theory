import { STOCK_IMAGES } from "@/lib/stock-media";

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
    excerpt:
      "Structure is not the enemy of expression — it is the frame that makes expression legible.",
    date: "Field note · 04",
    readTime: "4 min",
    image: STOCK_IMAGES.editorialArchitecture,
    imageAlt: "Editorial architecture — discipline as aesthetics",
    content: [
      "Most people treat discipline as punishment. Ascend treats it as composition — the same way a photographer treats light, or an architect treats negative space.",
      "When your days have rhythm, your choices have weight. You stop negotiating with yourself because the standard was set before the moment arrived.",
      "Aesthetics without discipline is decoration. Discipline without aesthetics is burnout. The intersection is where identity becomes visible — in how you dress, move, and build.",
      "We do not design for motivation. We design for the person who already decided.",
    ],
  },
  {
    slug: "quiet-cost-of-focus",
    title: "The quiet cost of focus",
    excerpt:
      "Focus is not free. It charges interest in friendships, sleep, and the version of you that used to be spontaneous.",
    date: "Essay · 03",
    readTime: "6 min",
    image: STOCK_IMAGES.teamStudio,
    imageAlt: "Studio portrait — the quiet cost of focus",
    content: [
      "Everyone wants the outcome of focus. Few accept the invoice.",
      "You will miss dinners. You will answer messages late. You will feel, at times, like you are disappearing from rooms you used to fill with noise.",
      "That is not failure — that is allocation. The cost is real, but so is the compound return: clarity, output, and a self-image that does not depend on applause.",
      "The disciplined life is not lonely because you chose isolation. It is quiet because you chose direction.",
    ],
  },
  {
    slug: "modern-masculinity-without-theatre",
    title: "Modern masculinity, without theatre",
    excerpt:
      "Strength without performance. Presence without posturing. A standard that does not need an audience.",
    date: "Editorial · 02",
    readTime: "5 min",
    image: STOCK_IMAGES.lifestyleAirport,
    imageAlt: "Transit — modern masculinity editorial",
    content: [
      "The old script said: perform, dominate, announce. The new standard says: build, hold, move.",
      "Modern masculinity is not softer — it is more precise. It knows when to speak and when silence is the stronger move. It invests in craft over commentary.",
      "Ascend exists in that precision. Not costumes for the confident, but objects for people already living the standard.",
      "No theatre. No slogans. Just the work — and what you wear while doing it.",
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
} as const;
