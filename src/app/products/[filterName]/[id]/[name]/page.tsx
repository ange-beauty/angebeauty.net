import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductsCatalog from "@/components/ProductsCatalog";
import JsonLd from "@/components/JsonLd";
import { brandHref } from "@/lib/productUrl";
import { fetchBrandsServer, fetchCategoriesServer, fetchProductsServer } from "@/lib/serverApi";
import { breadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

type ProductsFilterParams = {
  filterName?: string;
  id?: string;
  name?: string;
};

type ProductsSearchParams = {
  keyword?: string;
  barcode?: string;
  product?: string;
  category?: string;
  focusSearch?: string;
  hasActiveOffer?: string;
  newStockArrivals?: string;
  offerIds?: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<ProductsFilterParams>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const filterName = (resolvedParams.filterName || "").trim();
  const id = safeDecode((resolvedParams.id || "").trim());

  if (filterName !== "brand" || !id) {
    return {};
  }

  const brand = (await fetchBrandsServer()).find((item) => item.id === id);
  const name = brand
    ? brand.brand_name_ar || brand.brand_name_en || brand.id
    : safeDecode((resolvedParams.name || "").trim()).replace(/-/g, " ");
  // Canonical always uses the brand's real name slug and drops query filters (search, sort, etc.).
  const path = brandHref({ id, name: name || id });
  const englishName = brand?.brand_name_en && brand.brand_name_en !== name ? ` (${brand.brand_name_en})` : "";

  return buildPageMetadata({
    title: name ? `منتجات ${name}${englishName} | أنج بيوتي` : "منتجات أنج بيوتي",
    description: name
      ? `تسوق منتجات ${name}${englishName} من أنج بيوتي في العراق، مع الأسعار بالدينار العراقي.`
      : "تصفح منتجات أنج بيوتي.",
    path,
  });
}

export default async function ProductsFilterPage({
  params,
  searchParams,
}: {
  params: Promise<ProductsFilterParams>;
  searchParams: Promise<ProductsSearchParams>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const filterName = (resolvedParams.filterName || "").trim();
  const id = decodeURIComponent((resolvedParams.id || "").trim());

  if (filterName !== "brand" || !id) {
    notFound();
  }

  const keyword = (resolvedSearchParams.keyword || "").trim();
  const barcode = (resolvedSearchParams.barcode || "").trim();
  const product = (resolvedSearchParams.product || "").trim();
  const category = (resolvedSearchParams.category || "").trim();
  const offerIds = (resolvedSearchParams.offerIds || "").trim();
  const hasActiveOffer = offerIds.length > 0 || ["1", "true"].includes((resolvedSearchParams.hasActiveOffer || "").trim().toLowerCase());
  const newStockArrivals = ["1", "true"].includes((resolvedSearchParams.newStockArrivals || "").trim().toLowerCase());
  const focusSearch = resolvedSearchParams.focusSearch === "1";

  const [productsResponse, brands, categories] = await Promise.all([
    fetchProductsServer({
      page: 1,
      limit: 10,
      keyword: keyword || undefined,
      brand: id,
      barcode: barcode || undefined,
      product: product || undefined,
      category: category || undefined,
      hasActiveOffer: hasActiveOffer || undefined,
      newStockArrivals: newStockArrivals || undefined,
      offerIds: offerIds || undefined,
    }),
    fetchBrandsServer(),
    fetchCategoriesServer(),
  ]);

  const brand = brands.find((item) => item.id === id);
  const brandName = brand ? brand.brand_name_ar || brand.brand_name_en || brand.id : "";

  return (
    <>
      {brand ? (
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "الرئيسية", path: "/home" },
            { name: "الماركات", path: "/brands" },
            { name: brandName, path: brandHref({ id: brand.id, name: brandName }) },
          ])}
        />
      ) : null}
      <ProductsCatalog
        initialProducts={productsResponse.products || []}
        initialHasMore={productsResponse.hasMore}
        initialKeyword={keyword}
        initialBrand={id}
        initialBarcode={barcode}
        initialProduct={product}
        initialCategory={category}
        initialHasActiveOffer={hasActiveOffer}
        initialNewStockArrivals={newStockArrivals}
        initialOfferIds={offerIds}
        initialFocusSearch={focusSearch}
        brands={brands}
        categories={categories}
      />
    </>
  );
}
