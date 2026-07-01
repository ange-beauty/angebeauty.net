export type ProductCategory = "skincare" | "makeup" | "fragrance" | "haircare" | "bodycare";

export interface Product {
  id: string;
  name: string;
  brand: string;
  brandId?: string;
  category: ProductCategory;
  price: number;
  basePrice?: number;
  discountAmount?: number;
  appliedOffer?: {
    id?: string;
    name?: string;
    type?: string;
    value?: number;
  } | null;
  image: string;
  description: string;
  ingredients?: string[];
  rating: number;
  reviewCount: number;
  totalAvailable?: number;
  availabilityBySellingPoint?: {
    sellingPointId: string;
    nameAr?: string | null;
    nameEn?: string | null;
    totalAvailable: number;
  }[];
}

export interface APIProduct {
  id: number | string;
  name?: string;
  name_ar?: string | null;
  name_en?: string | null;
  price: number | string;
  base_price?: number | string | null;
  final_price?: number | string | null;
  discount_amount?: number | string | null;
  applied_offer?: {
    id?: string | null;
    nameAr?: string | null;
    name_ar?: string | null;
    nameEn?: string | null;
    name_en?: string | null;
    type?: string | null;
    value?: number | string | null;
  } | null;
  description?: string;
  description_ar?: string | null;
  description_en?: string | null;
  images?: string | string[] | null;
  category?: string | null | { id: number; name?: string; name_ar?: string; name_en?: string };
  brand?: string | null;
  brand_id?: string | number | null;
  brand_name_ar?: string | null;
  brand_name_en?: string | null;
  aggregate_version?: number | string | null;
  last_updated_at?: string | null;
  tags?: string[];
  total_available?: number | null;
  availability_by_selling_point?: {
    selling_point?: string | null;
    name_ar?: string | null;
    name_en?: string | null;
    totalAvailable?: number | null;
    stockes?: { quantity?: number | null }[];
  }[] | null;
}

function countArabicChars(value: string): number {
  const matches = value.match(/[\u0600-\u06FF]/g);
  return matches ? matches.length : 0;
}

function repairArabicMojibake(value?: string | null): string {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (!/[ØÙ]/.test(trimmed)) {
    return trimmed;
  }

  try {
    const bytes = Uint8Array.from(trimmed, (char) => char.charCodeAt(0) & 0xff);
    const decoded = new TextDecoder("utf-8").decode(bytes).trim();

    if (!decoded) {
      return trimmed;
    }

    return countArabicChars(decoded) >= countArabicChars(trimmed) ? decoded : trimmed;
  } catch {
    return trimmed;
  }
}

function buildProductThumbUrl(apiProduct: APIProduct, fileName: string): string {
  const baseUrl = `https://images.angebeauty.net/angeapi/cdn/images/${apiProduct.id}/thumbs/${fileName}`;
  const stableVersion = apiProduct.aggregate_version ?? apiProduct.last_updated_at;

  if (stableVersion === null || typeof stableVersion === "undefined" || stableVersion === "") {
    return baseUrl;
  }

  return `${baseUrl}?v=${encodeURIComponent(String(stableVersion))}`;
}

export function mapAPIProductToProduct(apiProduct: APIProduct): Product {
  const categoryMap: Record<string, ProductCategory> = {
    skincare: "skincare",
    makeup: "makeup",
    fragrance: "fragrance",
    haircare: "haircare",
    bodycare: "bodycare",
  };

  const productName =
    repairArabicMojibake(apiProduct.name_ar) ||
    repairArabicMojibake(apiProduct.name_en) ||
    repairArabicMojibake(apiProduct.name) ||
    "Unnamed product";
  const productDescription =
    repairArabicMojibake(apiProduct.description_ar) ||
    repairArabicMojibake(apiProduct.description_en) ||
    repairArabicMojibake(apiProduct.description) ||
    "";

  let category: ProductCategory = "skincare";
  if (typeof apiProduct.category === "object" && apiProduct.category) {
    const categoryName = (
      repairArabicMojibake(apiProduct.category.name_ar) ||
      repairArabicMojibake(apiProduct.category.name) ||
      repairArabicMojibake(apiProduct.category.name_en) ||
      "skincare"
    ).toLowerCase();
    category = categoryMap[categoryName] || "skincare";
  }

  const brandName =
    repairArabicMojibake(apiProduct.brand_name_ar) ||
    repairArabicMojibake(apiProduct.brand_name_en) ||
    "Unknown brand";
  const brandId = apiProduct.brand_id?.toString() || apiProduct.brand?.toString() || undefined;

  let imageUrl = "";
  try {
    if (apiProduct.images) {
      let imagesArray: string[] = [];
      if (typeof apiProduct.images === "string") {
        imagesArray = JSON.parse(apiProduct.images);
      } else if (Array.isArray(apiProduct.images)) {
        imagesArray = apiProduct.images;
      }

      const firstImage = imagesArray[0];
      if (firstImage) {
        imageUrl = buildProductThumbUrl(apiProduct, firstImage);
      }
    }
  } catch {
    imageUrl = "";
  }

  const parsedBasePrice =
    typeof apiProduct.base_price === "number"
      ? apiProduct.base_price
      : parseFloat(apiProduct.base_price?.toString() || apiProduct.price?.toString() || "0");
  const parsedFinalPrice =
    typeof apiProduct.final_price === "number"
      ? apiProduct.final_price
      : parseFloat(apiProduct.final_price?.toString() || apiProduct.price?.toString() || "0");
  const parsedDiscount =
    typeof apiProduct.discount_amount === "number"
      ? apiProduct.discount_amount
      : parseFloat(apiProduct.discount_amount?.toString() || "0");
  const finalPrice = Number.isFinite(parsedFinalPrice) ? parsedFinalPrice : 0;
  const basePrice = Number.isFinite(parsedBasePrice) ? parsedBasePrice : finalPrice;
  const discountAmount = Number.isFinite(parsedDiscount) ? parsedDiscount : Math.max(0, basePrice - finalPrice);
  const appliedOffer = apiProduct.applied_offer
    ? {
        id: apiProduct.applied_offer.id?.toString(),
        name: repairArabicMojibake(apiProduct.applied_offer.nameAr || apiProduct.applied_offer.name_ar) ||
          repairArabicMojibake(apiProduct.applied_offer.nameEn || apiProduct.applied_offer.name_en),
        type: apiProduct.applied_offer.type?.toString(),
        value:
          typeof apiProduct.applied_offer.value === "number"
            ? apiProduct.applied_offer.value
            : parseFloat(apiProduct.applied_offer.value?.toString() || "0"),
      }
    : null;

  return {
    id: apiProduct.id?.toString() || "",
    name: productName,
    brand: brandName,
    brandId,
    category,
    price: finalPrice,
    basePrice,
    discountAmount,
    appliedOffer,
    image: imageUrl,
    description: productDescription,
    ingredients: apiProduct.tags || [],
    rating: 4.5,
    reviewCount: 0,
    totalAvailable: typeof apiProduct.total_available === "number" ? apiProduct.total_available : undefined,
    availabilityBySellingPoint: Array.isArray(apiProduct.availability_by_selling_point)
      ? apiProduct.availability_by_selling_point
          .filter((entry) => entry && entry.selling_point)
          .map((entry) => ({
            sellingPointId: entry.selling_point?.toString() || "",
            nameAr: repairArabicMojibake(entry.name_ar) || null,
            nameEn: repairArabicMojibake(entry.name_en) || null,
            totalAvailable:
              typeof entry.totalAvailable === "number"
                ? entry.totalAvailable
                : Array.isArray(entry.stockes)
                  ? entry.stockes.reduce((sum, stock) => sum + (typeof stock?.quantity === "number" ? stock.quantity : 0), 0)
                  : 0,
          }))
      : [],
  };
}
