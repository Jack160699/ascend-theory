import { PageExploreLinks } from "@/components/brand/PageExploreLinks";
import { BrandSiteLayout } from "@/components/brand/layout/BrandSiteLayout";
import type { JournalArticle } from "@/lib/data/journal";
import { BRAND_ROUTES } from "@/lib/brand/routes";
import Image from "next/image";
import Link from "next/link";

type JournalArticlePageProps = {
  article: JournalArticle;
};

export function JournalArticlePage({ article }: JournalArticlePageProps) {
  return (
    <BrandSiteLayout className="page-journal-article">
      <article className="journal-article">
        <div className="brand-shell">
          <Link href={BRAND_ROUTES.journal} className="journal-article__back">
            ← Journal
          </Link>

          <header className="journal-article__header">
            <p className="brand-eyebrow">{article.date}</p>
            <h1 className="journal-article__title">{article.title}</h1>
            <p className="brand-prose-tight mt-4 uppercase tracking-[0.18em]">
              {article.readTime} read
            </p>
          </header>
        </div>

        <div className="journal-article__hero">
          <Image
            src={article.image}
            alt={article.imageAlt}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="journal-article__hero-fade" />
        </div>

        <div className="brand-shell journal-article__body">
          <p className="journal-article__excerpt">{article.excerpt}</p>
          {article.content.map((paragraph) => (
            <p key={paragraph} className="journal-article__paragraph">
              {paragraph}
            </p>
          ))}
          <PageExploreLinks excludeHref={BRAND_ROUTES.journal} />
        </div>
      </article>
    </BrandSiteLayout>
  );
}
