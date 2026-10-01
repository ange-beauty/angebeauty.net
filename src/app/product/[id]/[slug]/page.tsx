import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import ProductDetailsView from "@/components/ProductDetailsView";
import { productHref, slugifyProductName } from "@/lib/productUrl";
import { fetchProductByIdServer, fetchProductVariationsServer } from "@/lib/serverApi";
import {
  breadcrumbJsonLd,
  buildPageMetadata,
  buildProductDescription,
  productBreadcrumbs,
  productJsonLd,
} from "@/lib/seo";

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

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
      robots: { index: false, follow: true },
    };
  }

  const image = product.fullImage || product.image;
  return buildPageMetadata({
    title: `${product.name} | أنج بيوتي`,
    description: buildProductDescription(product),
    path: productHref(product),
    images: image ? [image] : undefined,
  });
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = await params;
  const product = await fetchProductByIdServer(id);

  if (!product) {
    notFound();
  }

  // Any slug other than the canonical one is a duplicate URL: send it to the canonical product URL.
  const expectedSlug = slugifyProductName(product.name || "") || "product";
  if (safeDecode(slug).normalize("NFC") !== expectedSlug.normalize("NFC")) {
    permanentRedirect(productHref(product));
  }

  const variationGroup = await fetchProductVariationsServer(id);
  return (
    <>
      <JsonLd data={productJsonLd(product)} />
      <JsonLd data={breadcrumbJsonLd(productBreadcrumbs(product))} />
      <ProductDetailsView product={product} variationGroup={variationGroup} />
    </>
  );
}
