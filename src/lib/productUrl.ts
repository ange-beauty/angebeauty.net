import type { Product } from "@/types/product";

export function slugifyProductName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function productHref(product: Pick<Product, "id" | "name">): string {
  const slug = slugifyProductName(product.name || "");
  return `/product/${encodeURIComponent(product.id)}/${encodeURIComponent(slug || "product")}`;
}
