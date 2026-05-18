import { JournalCinematicArticle } from "@/components/journal/JournalCinematicArticle";
import type { JournalArticle } from "@/lib/data/journal";

type JournalArticlePageProps = {
  article: JournalArticle;
};

export function JournalArticlePage({ article }: JournalArticlePageProps) {
  return <JournalCinematicArticle article={article} />;
}
