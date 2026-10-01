import type { Metadata } from "next";
import type { Product } from "@/types/product";
import { brandHref, productHref } from "@/lib/productUrl";

// Canonical public origin. The live apex (angebeauty.net) redirects to www, so www is the canonical host.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.angebeauty.net").replace(/\/+$/, "");
export const SITE_NAME = "أنج بيوتي";
export const SITE_NAME_EN = "Ange Beauty";
export const DEFAULT_OG_IMAGE = "/icon.png";
export const CONTACT_PHONE = "+9647761791777";
export const CONTACT_EMAIL = "support@angebeauty.net";

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

type PageMetadataInput = {
  title: string;
  description?: string;
  /** Site-relative canonical path, e.g. "/products". Resolved against metadataBase. */
  path: string;
  images?: string[];
  type?: "website" | "article";
};

/**
 * Builds title/description/canonical/Open Graph/Twitter metadata for a public page.
 * Next.js merges `openGraph` shallowly, so every page that sets its own OG gets the full object here.
 */
export function buildPageMetadata({ title, description, path, images, type = "website" }: PageMetadataInput): Metadata {
  const ogImages = (images && images.filter(Boolean).length ? images.filter(Boolean) : [DEFAULT_OG_IMAGE]).map((url) => ({
    url,
    alt: title,
  }));

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      url: path,
      siteName: SITE_NAME,
      locale: "ar_IQ",
      title,
      description,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages.map((image) => image.url),
    },
  };
}

export function stripHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateAtWord(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  const cut = value.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s،,.:;-]+$/, "")}…`;
}

export function hasKnownBrand(product: Pick<Product, "brand">): boolean {
  return Boolean(product.brand && product.brand !== "Unknown brand");
}

function formatIqd(price: number): string {
  return `${Math.round(price).toLocaleString("en-US")} د.ع`;
}

/** Meta description built only from API data: name, brand, price, stock and the start of the description. */
export function buildProductDescription(product: Product): string {
  const parts: string[] = [];
  let lead = product.name;
  if (hasKnownBrand(product) && !product.name.includes(product.brand)) lead += ` من ${product.brand}`;
  if (product.price > 0) lead += ` بسعر ${formatIqd(product.price)}`;
  parts.push(`${lead} في ${SITE_NAME}.`);
  if (typeof product.totalAvailable === "number" && product.totalAvailable > 0) parts.push("متوفر الآن.");

  const head = parts.join(" ");
  const body = product.description ? stripHtml(product.description) : "";
  return truncateAtWord(body ? `${head} ${body}` : head, 158);
}

type JsonLdObject = Record<string, unknown>;

export function organizationJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: SITE_NAME_EN,
    url: `${SITE_URL}/`,
    logo: absoluteUrl(DEFAULT_OG_IMAGE),
    email: CONTACT_EMAIL,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: CONTACT_PHONE,
      email: CONTACT_EMAIL,
      contactType: "customer service",
      areaServed: "IQ",
      availableLanguage: ["ar", "en"],
    },
  };
}

export function webSiteJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    alternateName: SITE_NAME_EN,
    url: `${SITE_URL}/`,
    inLanguage: "ar",
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/products?keyword={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * Product + Offer JSON-LD from API data only. Returns null when there is no price, because Google
 * requires an offer (or real reviews/ratings, which we do not have) for product rich results.
 * Rating/reviewCount on Product are placeholders in the mapper and are intentionally never emitted.
 */
export function productJsonLd(product: Product): JsonLdObject | null {
  if (!(product.price > 0)) return null;

  const url = absoluteUrl(productHref(product));
  const description = product.description ? truncateAtWord(stripHtml(product.description), 5000) : undefined;
  const image = product.fullImage || product.image;

  const offer: JsonLdObject = {
    "@type": "Offer",
    url,
    priceCurrency: "IQD",
    price: Math.round(product.price),
    seller: { "@id": `${SITE_URL}/#organization` },
  };
  if (typeof product.totalAvailable === "number") {
    offer.availability = product.totalAvailable > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
  }

  const data: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    sku: product.id,
    url,
    offers: offer,
  };
  if (image) data.image = [image];
  if (description) data.description = description;
  if (hasKnownBrand(product)) data.brand = { "@type": "Brand", name: product.brand };
  return data;
}

export function productBreadcrumbs(product: Product): Array<{ name: string; path: string }> {
  const items = [{ name: "الرئيسية", path: "/home" }];
  if (product.brandId && hasKnownBrand(product)) {
    items.push({ name: product.brand, path: brandHref({ id: product.brandId, name: product.brand }) });
  }
  items.push({ name: product.name, path: productHref(product) });
  return items;
}
