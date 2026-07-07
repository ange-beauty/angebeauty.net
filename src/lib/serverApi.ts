import { mapAPIProductToProduct, type Product } from "@/types/product";
import { withClientSourceHeader } from "@/lib/requestHeaders";

const API_BASE_URL =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api.angebeauty.net/";
const API_BASE = API_BASE_URL.replace(/\/+$/, "");

export type ServerFetchProductsParams = {
  page?: number;
  limit?: number;
  keyword?: string;
  category?: string;
  brand?: string;
  tag?: string;
  barcode?: string;
  product?: string;
  highlighted?: number | boolean;
};

export type ServerFetchProductsResponse = {
  products: Product[];
  hasMore: boolean;
  totalRows: number;
};

export type PublicOfferTarget = {
  target_aggregate_type?: string | null;
  target_aggregate_id?: string | null;
  [key: string]: unknown;
};

export type PublicOffer = {
  id: string;
  name_ar?: string | null;
  name_en?: string | null;
  description_ar?: string | null;
  description_en?: string | null;
  offer_type?: string | null;
  offer_value?: number | string | null;
  hero_image?: string | null;
  hide_text?: boolean | number | string | null;
  aggregate_version?: number | string | null;
  updated_at?: string | null;
  last_updated_at?: string | null;
  targets?: PublicOfferTarget[];
  [key: string]: unknown;
};

async function serverFetch(path: string, init?: RequestInit) {
  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: withClientSourceHeader({
      Accept: "application/json",
      "Content-Type": "application/json",
      ...((init?.headers || {}) as Record<string, string>),
    }),
    next: { revalidate: 300 },
  });
}

export async function fetchProductsServer(
  params: ServerFetchProductsParams = {},
): Promise<ServerFetchProductsResponse> {
  const { page = 1, limit = 20, keyword, category, brand, tag, barcode, product, highlighted } = params;
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());
  queryParams.append("no_zero_price", "true");
  queryParams.append("products_with_brand", "true");
  if (keyword) queryParams.append("keyword", keyword);
  if (category) queryParams.append("category", category);
  if (brand) queryParams.append("brand", brand);
  if (tag) queryParams.append("tag", tag);
  if (barcode) queryParams.append("barcode", barcode);
  if (product) queryParams.append("product", product);
  if (typeof highlighted !== "undefined") {
    queryParams.append("highlighted", highlighted ? "1" : "0");
  }

  try {
    const response = await serverFetch(`/api/v1/products?${queryParams.toString()}`);
    if (!response.ok) return { products: [], hasMore: false, totalRows: 0 };
    const result = await response.json();
    if (!result || result.success !== true || !result.data) {
      return { products: [], hasMore: false, totalRows: 0 };
    }

    const products = Array.isArray(result.data) ? result.data : [];
    const totalRows =
      typeof result.total_rows === "number"
        ? result.total_rows
        : typeof result.totalRows === "number"
          ? result.totalRows
          : typeof result.total === "number"
            ? result.total
            : 0;

    const hasMore =
      result.has_more === true ||
      result.hasMore === true ||
      (typeof result.next_page === "number" && result.next_page > page) ||
      (typeof result.nextPage === "number" && result.nextPage > page) ||
      (totalRows > 0 ? page * limit < totalRows : products.length === limit);

    return {
      products: products.map(mapAPIProductToProduct).filter((p: Product) => p && p.id),
      hasMore,
      totalRows,
    };
  } catch {
    return { products: [], hasMore: false, totalRows: 0 };
  }
}

export async function fetchPublicOffersServer(): Promise<PublicOffer[]> {
  try {
    const response = await serverFetch("/api/v1/offers/public");
    if (!response.ok) return [];
    const result = await response.json();
    if (!result || result.success !== true || !Array.isArray(result.data)) return [];

    return result.data
      .filter((offer: any) => offer && offer.id)
      .map((offer: any) => ({
        ...offer,
        id: String(offer.id),
        targets: Array.isArray(offer.targets) ? offer.targets : [],
      }));
  } catch {
    return [];
  }
}

export async function fetchBrandsServer(): Promise<
  Array<{ id: string; brand_name_ar: string; brand_name_en?: string }>
> {
  try {
    const response = await serverFetch("/api/v1/brands");
    if (!response.ok) return [];
    const result = await response.json();
    if (!result || result.status !== "success" || !result.data) return [];
    const brands = Array.isArray(result.data) ? result.data : [];
    return brands.filter((brand: any) => brand && brand.id && brand.brand_name_ar);
  } catch {
    return [];
  }
}

export async function fetchProductByIdServer(id: string): Promise<Product | null> {
  if (!id) return null;
  try {
    const response = await serverFetch(`/api/v1/products?product=${encodeURIComponent(id)}`);
    if (!response.ok) return null;
    const result = await response.json();
    const isSuccess = result?.success === true || result?.status === "success";
    if (!isSuccess || !result.data) return null;
    const apiProduct = Array.isArray(result.data) ? result.data[0] : result.data;
    if (!apiProduct) return null;
    const mapped = mapAPIProductToProduct(apiProduct);
    return mapped?.id ? mapped : null;
  } catch {
    return null;
  }
}
