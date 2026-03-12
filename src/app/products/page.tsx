import ProductsCatalog from "@/components/ProductsCatalog";
import { fetchBrandsServer, fetchProductsServer } from "@/lib/serverApi";

type ProductsSearchParams = {
  keyword?: string;
  brand?: string;
};

export const metadata = {
  title: "أنج بيوتي | المنتجات",
  description: "تصفح منتجات أنج بيوتي مع البحث والتصفية حسب العلامة التجارية.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<ProductsSearchParams>;
}) {
  const params = await searchParams;
  const keyword = (params.keyword || "").trim();
  const brand = (params.brand || "").trim();

  const [productsResponse, brands] = await Promise.all([
    fetchProductsServer({
      page: 1,
      limit: 10,
      keyword: keyword || undefined,
      brand: brand || undefined,
    }),
    fetchBrandsServer(),
  ]);

  return (
    <ProductsCatalog
      initialProducts={productsResponse.products || []}
      initialHasMore={productsResponse.hasMore}
      initialKeyword={keyword}
      initialBrand={brand}
      brands={brands}
    />
  );
}
