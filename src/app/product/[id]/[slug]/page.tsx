import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailsView from "@/components/ProductDetailsView";
import { fetchProductByIdServer } from "@/lib/serverApi";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProductByIdServer(id);
  if (!product) {
    return {
      title: "المنتج غير متوفر | أنج بيوتي",
      description: "المنتج غير متوفر حالياً.",
    };
  }

  return {
    title: `${product.name} | أنج بيوتي`,
    description: product.description
      ? product.description.replace(/<[^>]+>/g, "").slice(0, 160)
      : `تفاصيل منتج ${product.name} من أنج بيوتي.`,
  };
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id } = await params;
  const product = await fetchProductByIdServer(id);

  if (!product) {
    notFound();
  }

  return <ProductDetailsView product={product} />;
}
