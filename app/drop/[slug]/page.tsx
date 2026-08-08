import { CommerceShell } from "@/components/cart/CommerceShell";
import { DropExperience } from "@/components/drop";
import { AssessmentModalProvider } from "@/contexts/assessment-modal";
import { getDropBySlugAsync, getAllDropSlugsAsync } from "@/lib/data/drops";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getAllDropSlugsAsync();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getDropBySlugAsync(slug);
  if (!product) {
    return { title: "Drop Not Found | Ascend Theory" };
  }
  return {
    title: `${product.name} — ${product.dropName} | Ascend Theory`,
    description: product.description,
  };
}

export default async function DropProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getDropBySlugAsync(slug);
  if (!product) notFound();

  return (
    <AssessmentModalProvider>
      <CommerceShell>
        <DropExperience product={product} />
      </CommerceShell>
    </AssessmentModalProvider>
  );
}
