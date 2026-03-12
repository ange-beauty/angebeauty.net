import { mapAPIProductToProduct, type Product } from "@/types/product";
import { withClientSourceHeader } from "@/lib/requestHeaders";



export interface Brand {
  id: string;
  brand_name_ar: string;
  brand_name_en?: string;
}

export interface Category {
  id: string;
  name_ar: string;
  name_en?: string;
}

export interface FetchProductsParams {
  page?: number;
  limit?: number;
  keyword?: string;
  category?: string;
  brand?: string;
  barcode?: string;
  highlighted?: number | boolean;
}

export interface FetchProductsResponse {
  products: Product[];
  hasMore: boolean;
  totalRows: number;
}

export async function fetchProducts(params: FetchProductsParams = {}): Promise<FetchProductsResponse> {
  const { page = 1, limit = 10, keyword, category, brand, barcode, highlighted } = params;

  try {
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());
    queryParams.append("no_zero_price", "true");
    queryParams.append("products_with_brand", "true");

    if (keyword) queryParams.append("keyword", keyword);
    if (category) queryParams.append("category", category);
    if (brand) queryParams.append("brand", brand);
    if (barcode) queryParams.append("barcode", barcode);
    if (typeof highlighted !== "undefined") queryParams.append("highlighted", highlighted ? "1" : "0");

    const response = await fetch(`/api/v1/products?${queryParams.toString()}`, {
      method: "GET",
      headers: withClientSourceHeader({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      credentials: "include",
    });

    if (!response.ok) {
      return { products: [], hasMore: false, totalRows: 0 };
    }

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

export async function fetchBrands(): Promise<Brand[]> {
  try {
    const response = await fetch(`/api/v1/brands`, {
      method: "GET",
      headers: withClientSourceHeader({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      credentials: "include",
    });

    if (!response.ok) return [];
    const result = await response.json();
    if (!result || result.status !== "success" || !result.data) return [];
    const brands = Array.isArray(result.data) ? result.data : [];
    return brands.filter((brand: any) => brand && brand.id && brand.brand_name_ar);
  } catch {
    return [];
  }
}

export async function fetchCategories(): Promise<Category[]> {
  return [];
}

export async function fetchProductById(id: string): Promise<Product | null> {
  if (!id) return null;

  try {
    const response = await fetch(`/api/v1/products?product=${encodeURIComponent(id)}`, {
      method: "GET",
      headers: withClientSourceHeader({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      credentials: "include",
    });

    if (!response.ok) return null;
    const result = await response.json();
    const isSuccess = result?.success === true || result?.status === "success";
    if (!isSuccess || !result.data) return null;
    const apiProduct = Array.isArray(result.data) ? result.data[0] : result.data;
    if (!apiProduct) return null;
    const mappedProduct = mapAPIProductToProduct(apiProduct);
    return mappedProduct?.id ? mappedProduct : null;
  } catch {
    return null;
  }
}

