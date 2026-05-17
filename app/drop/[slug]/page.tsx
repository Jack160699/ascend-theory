import { CommerceShell } from "@/components/cart/CommerceShell";
import { DropExperience } from "@/components/drop";
import { AssessmentModalProvider } from "@/contexts/assessment-modal";
import { getAllDropSlugs, getDropBySlug } from "@/lib/data/drops";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllDropSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getDropBySlug(slug);
  if (!product) {
    return { title: "Drop | Ascend Theory" };
  }
  return {
    title: `${product.productName} — ${product.dropName} | Ascend Theory`,
    description: product.description,
  };
}

export default async function DropProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getDropBySlug(slug);
  if (!product) notFound();

  return (
    <AssessmentModalProvider>
      <CommerceShell>
        <DropExperience product={product} />
      </CommerceShell>
    </AssessmentModalProvider>
  );
}
