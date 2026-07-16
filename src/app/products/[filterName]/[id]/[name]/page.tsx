import { notFound } from "next/navigation";
import ProductsCatalog from "@/components/ProductsCatalog";
import { fetchBrandsServer, fetchCategoriesServer, fetchProductsServer } from "@/lib/serverApi";

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
};

export async function generateMetadata({
  params,
}: {
  params: Promise<ProductsFilterParams>;
}) {
  const resolvedParams = await params;
  const filterName = (resolvedParams.filterName || "").trim();
  const name = decodeURIComponent((resolvedParams.name || "").trim()).replace(/-/g, " ");

  if (filterName !== "brand") {
    return {};
  }

  return {
    title: name ? `${name} | أنج بيوتي` : "منتجات أنج بيوتي",
    description: name ? `تصفح منتجات ${name} في أنج بيوتي.` : "تصفح منتجات أنج بيوتي.",
  };
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
    }),
    fetchBrandsServer(),
    fetchCategoriesServer(),
  ]);

  return (
    <ProductsCatalog
      initialProducts={productsResponse.products || []}
      initialHasMore={productsResponse.hasMore}
      initialKeyword={keyword}
      initialBrand={id}
      initialBarcode={barcode}
      initialProduct={product}
      initialCategory={category}
      initialFocusSearch={focusSearch}
      brands={brands}
      categories={categories}
    />
  );
}
