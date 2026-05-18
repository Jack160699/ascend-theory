import type { JournalArticle, JournalIssue } from "@/lib/data/journal";

function absoluteUrl(site: string, path: string): string {
  const base = site.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

type JournalArticleJsonLdProps = {
  article: JournalArticle;
  issue: JournalIssue;
  canonicalPath: string;
};

export function JournalArticleJsonLd({
  article,
  issue,
  canonicalPath,
}: JournalArticleJsonLdProps) {
  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://ascendtheory.com";
  const url = absoluteUrl(site, canonicalPath);
  const imageUrl = article.image.startsWith("http")
    ? article.image
    : absoluteUrl(site, article.image);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: imageUrl,
    datePublished: article.publishedISO,
    dateModified: article.publishedISO,
    author: {
      "@type": "Organization",
      name: "Ascend Theory",
    },
    publisher: {
      "@type": "Organization",
      name: "Ascend Theory",
    },
    articleSection: `Issue ${issue.number} — ${issue.title}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    isPartOf: {
      "@type": "Periodical",
      name: "Ascend Theory Journal",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
