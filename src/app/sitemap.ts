import type { MetadataRoute } from "next";
import { brandHref, productHref } from "@/lib/productUrl";
import {
  fetchBrandsServer,
  fetchCategoriesServer,
  fetchProductsServer,
  fetchTagsWithProductsServer,
} from "@/lib/serverApi";
import { absoluteUrl } from "@/lib/seo";
import type { Product } from "@/types/product";

// Regenerate at most every hour; the heavy product listing calls are cached for 6 hours.
export const revalidate = 3600;

const PRODUCT_PAGE_SIZE = 500;
const PRODUCT_REVALIDATE_SECONDS = 6 * 60 * 60;
const MAX_PRODUCT_PAGES = 40;

/**
 * The API has no lightweight "all product ids + updated_at" endpoint, so this pages through the
 * public product listing. Stops on an empty/short page or after MAX_PRODUCT_PAGES.
 */
async function fetchAllProducts(): Promise<Product[]> {
  const all: Product[] = [];
  const seen = new Set<string>();
  for (let page = 1; page <= MAX_PRODUCT_PAGES; page += 1) {
    const { products, hasMore } = await fetchProductsServer(
      { page, limit: PRODUCT_PAGE_SIZE },
      { revalidate: PRODUCT_REVALIDATE_SECONDS },
    );
    for (const product of products) {
      if (!seen.has(product.id)) {
        seen.add(product.id);
        all.push(product);
      }
    }
    if (!hasMore || products.length === 0) break;
  }
  return all;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, brands, categories, tags] = await Promise.all([
    fetchAllProducts(),
    fetchBrandsServer(),
    fetchCategoriesServer(),
    fetchTagsWithProductsServer(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/home"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/products"), changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/products?hasActiveOffer=true"), changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/products?newStockArrivals=true"), changeFrequency: "daily", priority: 0.7 },
    { url: absoluteUrl("/brands"), changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/categories"), changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.2 },
  ];

  const brandPages: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: absoluteUrl(brandHref({ id: brand.id, name: brand.brand_name_ar || brand.brand_name_en || brand.id })),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories
    .filter((category) => category.category_name_ar || category.category_name_en)
    .map((category) => ({
      url: absoluteUrl(`/products?category=${encodeURIComponent(category.id)}`),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  const tagPages: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: absoluteUrl(`/products?tag=${encodeURIComponent(tag.id)}`),
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((product) => {
    const image = product.fullImage || product.image;
    return {
      url: absoluteUrl(productHref(product)),
      changeFrequency: "weekly",
      priority: 0.8,
      ...(image ? { images: [image] } : {}),
    };
  });

  return [...staticPages, ...brandPages, ...categoryPages, ...tagPages, ...productPages];
}
