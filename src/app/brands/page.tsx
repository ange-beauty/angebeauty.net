import BrandsBrowser from "@/components/BrandsBrowser";
import { fetchBrandsServer } from "@/lib/serverApi";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "تسوق حسب الماركة | أنج بيوتي",
  description: "تصفح جميع الماركات المتوفرة في أنج بيوتي وتسوق منتجات كل ماركة.",
  path: "/brands",
});

export default async function BrandsPage() {
  const brands = await fetchBrandsServer();

  return (
    <main className="brands-page">
      <h1 className="screen-title">تسوق حسب الماركة</h1>
      <BrandsBrowser brands={brands} />
    </main>
  );
}
