import { CommerceShell } from "@/components/cart/CommerceShell";
import { DropExperience } from "@/components/drop";
import { getDropBySlug } from "@/lib/brand/drops";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getDropBySlug(id);
  if (!product) {
    return { title: "Drop | Ascend Theory" };
  }
  return {
    title: `${product.productName} — ${product.dropName} | Ascend Theory`,
    description: `${product.tagline} Limited release. No restock.`,
  };
}

export default async function DropProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = getDropBySlug(id);
  if (!product) notFound();

  return (
    <CommerceShell>
      <DropExperience product={product} />
    </CommerceShell>
  );
}
