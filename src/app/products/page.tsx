import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ProductsCatalog from "@/components/ProductsCatalog";
import { fetchBrandsServer, fetchCategoriesServer, fetchProductsServer, fetchTagsWithProductsServer } from "@/lib/serverApi";
import { buildPageMetadata } from "@/lib/seo";
import { slugifyProductName } from "@/lib/productUrl";

type ProductsSearchParams = {
  keyword?: string;
  brand?: string;
  barcode?: string;
  product?: string;
  category?: string;
  tag?: string;
  focusSearch?: string;
  hasActiveOffer?: string;
  newStockArrivals?: string;
  offerIds?: string;
};

const PRODUCTS_TITLE = "أنج بيوتي | المنتجات";
const PRODUCTS_DESCRIPTION = "تصفح منتجات أنج بيوتي مع البحث والتصفية حسب العلامة التجارية والفئة.";

function isTruthyParam(value?: string) {
  return ["1", "true"].includes((value || "").trim().toLowerCase());
}

/**
 * Only single-filter listing views (one category, one tag, offers, new arrivals) are self-canonical.
 * Searches, barcode lookups and multi-filter combinations canonicalize to /products.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ProductsSearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const category = (params.category || "").trim();
  const tag = (params.tag || "").trim();
  const hasActiveOffer = isTruthyParam(params.hasActiveOffer);
  const newStockArrivals = isTruthyParam(params.newStockArrivals);
  const otherFilters = [params.keyword, params.brand, params.barcode, params.product, params.offerIds].some(
    (value) => (value || "").trim().length > 0,
  );
  const activeFilters = [Boolean(category), Boolean(tag), hasActiveOffer, newStockArrivals].filter(Boolean).length;

  if (!otherFilters && activeFilters === 1) {
    if (category && !category.includes(",")) {
      const match = (await fetchCategoriesServer()).find((item) => item.id === category);
      const name = match?.category_name_ar || match?.category_name_en;
      if (name) {
        return buildPageMetadata({
          title: `${name} | أنج بيوتي`,
          description: `تسوق منتجات ${name} من أنج بيوتي في العراق، مع الأسعار بالدينار العراقي.`,
          path: `/products?category=${encodeURIComponent(category)}`,
        });
      }
    }
    if (tag) {
      const match = (await fetchTagsWithProductsServer()).find((item) => item.id === tag);
      const name = match?.tag_name_ar || match?.tag_name_en;
      if (name) {
        return buildPageMetadata({
          title: `${name} | أنج بيوتي`,
          description: `تسوق منتجات ${name} من أنج بيوتي في العراق، مع الأسعار بالدينار العراقي.`,
          path: `/products?tag=${encodeURIComponent(tag)}`,
        });
      }
    }
    if (hasActiveOffer) {
      return buildPageMetadata({
        title: "العروض والتخفيضات | أنج بيوتي",
        description: "تسوق منتجات التجميل والعناية المشمولة بالعروض والتخفيضات الحالية في أنج بيوتي.",
        path: "/products?hasActiveOffer=true",
      });
    }
    if (newStockArrivals) {
      return buildPageMetadata({
        title: "وصل حديثاً | أنج بيوتي",
        description: "منتجات وصلت حديثاً إلى أنج بيوتي.",
        path: "/products?newStockArrivals=true",
      });
    }
  }

  return buildPageMetadata({ title: PRODUCTS_TITLE, description: PRODUCTS_DESCRIPTION, path: "/products" });
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<ProductsSearchParams>;
}) {
  const params = await searchParams;
  const keyword = (params.keyword || "").trim();
  const brand = (params.brand || "").trim();
  const barcode = (params.barcode || "").trim();
  const product = (params.product || "").trim();
  const category = (params.category || "").trim();
  const tag = (params.tag || "").trim();
  const offerIds = (params.offerIds || "").trim();
  const hasActiveOffer = offerIds.length > 0 || ["1", "true"].includes((params.hasActiveOffer || "").trim().toLowerCase());
  const newStockArrivals = ["1", "true"].includes((params.newStockArrivals || "").trim().toLowerCase());
  const focusSearch = params.focusSearch === "1";

  const [productsResponse, brands, categories] = await Promise.all([
    fetchProductsServer({
      page: 1,
      limit: 10,
      keyword: keyword || undefined,
      brand: brand || undefined,
      barcode: barcode || undefined,
      product: product || undefined,
      category: category || undefined,
      tag: tag || undefined,
      hasActiveOffer: hasActiveOffer || undefined,
      newStockArrivals: newStockArrivals || undefined,
      offerIds: offerIds || undefined,
    }),
    fetchBrandsServer(),
    fetchCategoriesServer(),
  ]);

  if (brand) {
    const selectedBrand = brands.find((item) => item.id === brand);
    if (selectedBrand) {
      const label = selectedBrand.brand_name_ar || selectedBrand.brand_name_en || selectedBrand.id;
      const slug = slugifyProductName(label) || "brand";
      const query = new URLSearchParams();
      if (keyword) query.set("keyword", keyword);
      if (barcode) query.set("barcode", barcode);
      if (product) query.set("product", product);
      if (category) query.set("category", category);
      if (tag) query.set("tag", tag);
      if (hasActiveOffer) query.set("hasActiveOffer", "true");
      if (newStockArrivals) query.set("newStockArrivals", "true");
      if (offerIds) query.set("offerIds", offerIds);
      if (params.focusSearch) query.set("focusSearch", params.focusSearch);
      const href = `/products/brand/${encodeURIComponent(selectedBrand.id)}/${encodeURIComponent(slug)}`;
      redirect(query.toString() ? `${href}?${query.toString()}` : href);
    }
  }

  return (
    <ProductsCatalog
      initialProducts={productsResponse.products || []}
      initialHasMore={productsResponse.hasMore}
      initialKeyword={keyword}
      initialBrand={brand}
      initialBarcode={barcode}
      initialProduct={product}
      initialCategory={category}
      initialTag={tag}
      initialHasActiveOffer={hasActiveOffer}
      initialNewStockArrivals={newStockArrivals}
      initialOfferIds={offerIds}
      initialFocusSearch={focusSearch}
      brands={brands}
      categories={categories}
    />
  );
}
