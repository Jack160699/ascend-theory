import { AscendImage } from "@/components/AscendImage";
import { BrandSiteLayout } from "@/components/brand/layout/BrandSiteLayout";
import type { JournalArticle } from "@/lib/data/journal";
import { BRAND_ROUTES } from "@/lib/brand/routes";
import Link from "next/link";

type JournalArticlePageProps = {
  article: JournalArticle;
};

export function JournalArticlePage({ article }: JournalArticlePageProps) {
  return (
    <BrandSiteLayout className="page-journal-article page-journal--editorial">
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

        <div className="journal-article__hero ascend-media-wrap">
          <AscendImage
            src={article.image}
            alt={article.imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="journal-article__hero-fade" />
        </div>

        <div className="brand-shell journal-article__body">
          <p className="journal-article__excerpt brand-voice">{article.excerpt}</p>
          {article.content.map((line) => (
            <p key={line} className="journal-article__paragraph brand-voice">
              {line}
            </p>
          ))}
        </div>
      </article>
    </BrandSiteLayout>
  );
}
