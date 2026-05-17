import { JournalArticlePage } from "@/components/pages/JournalArticlePage";
import { AssessmentModalProvider } from "@/contexts/assessment-modal";
import { getAllJournalSlugs, getJournalBySlug } from "@/lib/data/journal";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllJournalSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getJournalBySlug(slug);
  if (!article) {
    return { title: "Journal | Ascend Theory" };
  }
  return {
    title: `${article.title} | Ascend Theory Journal`,
    description: article.excerpt,
  };
}

export default async function JournalArticleRoute({ params }: PageProps) {
  const { slug } = await params;
  const article = getJournalBySlug(slug);
  if (!article) notFound();

  return (
    <AssessmentModalProvider>
      <JournalArticlePage article={article} />
    </AssessmentModalProvider>
  );
}
