import { ASCEND_PRODUCT_IMAGES } from "@/lib/product-images";

export type JournalSceneType =
  | "intro"
  | "visual"
  | "typography"
  | "text"
  | "media"
  | "outro";

export type JournalScene = {
  id: string;
  type: JournalSceneType;
  /** Oversized intro lines */
  lines?: readonly string[];
  kicker?: string;
  /** Single statement scene */
  statement?: string;
  /** Short editorial lines */
  body?: readonly string[];
  image?: string;
  imageAlt?: string;
  caption?: string;
  /** Outro */
  closing?: string;
  subclosing?: string;
  outroLine?: string;
  ctaLabel?: string;
};

export type JournalIssue = {
  slug: string;
  number: string;
  title: string;
  theme: string;
  coverImage: string;
  coverAlt: string;
  articleSlug: string;
};

export type JournalArticle = {
  slug: string;
  issueSlug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  image: string;
  imageAlt: string;
  content: readonly string[];
  scenes: readonly JournalScene[];
};

export const JOURNAL_ISSUES: readonly JournalIssue[] = [
  {
    slug: "discipline",
    number: "01",
    title: "DISCIPLINE",
    theme: "Structure before spectacle.",
    coverImage: ASCEND_PRODUCT_IMAGES.editorialArchitecture,
    coverAlt: "Architectural lines — Issue 01",
    articleSlug: "discipline-as-aesthetics",
  },
  {
    slug: "silence",
    number: "02",
    title: "SILENCE",
    theme: "Focus charges interest.",
    coverImage: ASCEND_PRODUCT_IMAGES.teamStudio,
    coverAlt: "Studio portrait — Issue 02",
    articleSlug: "quiet-cost-of-focus",
  },
  {
    slug: "presence",
    number: "03",
    title: "PRESENCE",
    theme: "Strength without theatre.",
    coverImage: ASCEND_PRODUCT_IMAGES.heroStorefront,
    coverAlt: "City night — Issue 03",
    articleSlug: "modern-masculinity-without-theatre",
  },
] as const;

const ARTICLE_CORE = [
  {
    slug: "discipline-as-aesthetics",
    issueSlug: "discipline",
    title: "On discipline as aesthetics",
    excerpt: "Structure is the frame that makes expression legible.",
    date: "Issue 01 · Field note",
    readTime: "4",
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
    issueSlug: "silence",
    title: "The quiet cost of focus",
    excerpt: "Focus charges interest in sleep, spontaneity, and noise.",
    date: "Issue 02 · Essay",
    readTime: "6",
    image: ASCEND_PRODUCT_IMAGES.teamStudio,
    imageAlt: "Studio portrait — the quiet cost of focus",
    content: [
      "Everyone wants the outcome. Few accept the invoice.",
      "You will miss dinners. You will answer late. That is allocation — not failure.",
      "Silence became the new symbol of status.",
    ],
  },
  {
    slug: "modern-masculinity-without-theatre",
    issueSlug: "presence",
    title: "Modern masculinity, without theatre",
    excerpt: "Strength without performance. Presence without posturing.",
    date: "Issue 03 · Editorial",
    readTime: "5",
    image: ASCEND_PRODUCT_IMAGES.heroStorefront,
    imageAlt: "City night — modern masculinity editorial",
    content: [
      "The old script said: perform, dominate, announce.",
      "The new standard says: build, hold, move.",
      "No theatre. No slogans. Only the work.",
    ],
  },
] as const;

function buildScenes(
  issue: JournalIssue,
  article: (typeof ARTICLE_CORE)[number],
): JournalScene[] {
  return [
    {
      id: "intro",
      type: "intro",
      kicker: `Issue ${issue.number}`,
      lines: [issue.title, article.title],
    },
    {
      id: "visual",
      type: "visual",
      image: article.image,
      imageAlt: article.imageAlt,
      caption: article.excerpt,
    },
    {
      id: "typography",
      type: "typography",
      statement: article.content[0],
    },
    {
      id: "text",
      type: "text",
      body: article.content.slice(1, -1),
      kicker: article.date,
    },
    {
      id: "media",
      type: "media",
      image: article.image,
      imageAlt: article.imageAlt,
      statement: article.content[article.content.length - 1],
    },
    {
      id: "outro",
      type: "outro",
      closing: "Not everyone enters.",
      outroLine: "Those who do — build differently.",
      subclosing: issue.theme,
      ctaLabel: "Return to Journal",
    },
  ];
}

const issueMap = new Map(JOURNAL_ISSUES.map((i) => [i.slug, i]));

export const JOURNAL_ARTICLES: readonly JournalArticle[] = ARTICLE_CORE.map(
  (article) => {
    const issue = issueMap.get(article.issueSlug)!;
    return {
      ...article,
      scenes: buildScenes(issue, article),
    };
  },
);

const journalMap = new Map(JOURNAL_ARTICLES.map((a) => [a.slug, a]));

export function getJournalIssueBySlug(slug: string): JournalIssue | undefined {
  return JOURNAL_ISSUES.find((i) => i.slug === slug);
}

export function getJournalIssueByArticleSlug(
  articleSlug: string,
): JournalIssue | undefined {
  return JOURNAL_ISSUES.find((i) => i.articleSlug === articleSlug);
}

export function getJournalBySlug(slug: string): JournalArticle | undefined {
  return journalMap.get(slug);
}

export function getAllJournalSlugs(): string[] {
  return JOURNAL_ARTICLES.map((a) => a.slug);
}

export const JOURNAL_INDEX = {
  eyebrow: "Journal",
  headline: "A luxury publication.",
  subline: "Issue-based editorials. Cinematic pacing. No noise.",
  statement: "Scroll is the medium.",
} as const;
