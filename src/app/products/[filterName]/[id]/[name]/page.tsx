import { notFound } from "next/navigation";
import ProductsCatalog from "@/components/ProductsCatalog";
import { fetchBrandsServer, fetchProductsServer } from "@/lib/serverApi";

type ProductsFilterParams = {
  filterName?: string;
  id?: string;
  name?: string;
};

type ProductsSearchParams = {
  keyword?: string;
  barcode?: string;
  in_stock?: string;
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
    title: name ? `${name} | Ange Beauty` : "Ange Beauty products",
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
  const inStockOnly = resolvedSearchParams.in_stock === "1";

  const [productsResponse, brands] = await Promise.all([
    fetchProductsServer({
      page: 1,
      limit: 10,
      keyword: keyword || undefined,
      brand: id,
      barcode: barcode || undefined,
    }),
    fetchBrandsServer(),
  ]);

  return (
    <ProductsCatalog
      initialProducts={productsResponse.products || []}
      initialHasMore={productsResponse.hasMore}
      initialKeyword={keyword}
      initialBrand={id}
      initialBarcode={barcode}
      initialInStockOnly={inStockOnly}
      brands={brands}
    />
  );
}
