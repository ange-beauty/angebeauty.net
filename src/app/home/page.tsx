import Link from "next/link";
import HomeHighlightsSlider from "@/components/HomeHighlightsSlider";
import { getDisplayBrand } from "@/lib/brand";
import { formatPrice } from "@/lib/formatPrice";
import { productHref } from "@/lib/productUrl";
import { fetchProductsServer } from "@/lib/serverApi";

export const metadata = {
  title: "أنج بيوتي | اكتشف",
  description: "اكتشف المنتجات المميزة والأكثر مبيعاً من أنج بيوتي.",
};

export default async function HomePage() {
  const [productsResponse, highlightedResponse] = await Promise.all([
    fetchProductsServer({ page: 1, limit: 30 }),
    fetchProductsServer({ page: 1, limit: 8, highlighted: 1 }),
  ]);

  const products = productsResponse.products || [];
  const highlighted = highlightedResponse.products || [];
  const mostSellingProducts = products.slice(6, 14);
  const saleProducts = products.slice(14, 20);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <section className="card">
        <h1 className="page-title">اكتشف</h1>
        <p className="muted">جمالك يبدأ من هنا.</p>
      </section>

      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>مميزات اليوم</h2>
          <Link href="/products" className="muted">
            عرض الكل
          </Link>
        </div>
        {!highlighted.length ? <p className="muted">لا توجد منتجات مميزة حالياً.</p> : null}
        <HomeHighlightsSlider products={highlighted} />
      </section>

      <section className="home-section">
        <h2 className="home-section-title">الأكثر مبيعًا</h2>
        {!mostSellingProducts.length ? <p className="muted">لا توجد منتجات حالياً.</p> : null}
        <div className="mini-products-row">
          {mostSellingProducts.map((product) => {
            const brand = getDisplayBrand(product.brand);
            return (
              <Link key={product.id} href={productHref(product)} className="mini-card">
                <img
                  src={product.image || "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop"}
                  alt={product.name}
                  className="mini-image"
                  loading="lazy"
                  decoding="async"
                />
                {brand ? <p className="mini-brand">{brand}</p> : null}
                <p className="mini-name">{product.name}</p>
                <p className="mini-price">{formatPrice(product.price)}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="home-section">
        <h2 className="home-section-title">العروض والتخفيضات</h2>

        <article className="promo-card">
          <h3 className="promo-title">عرض الأسبوع</h3>
          <p className="promo-subtitle">خصم محدود على مجموعة منتخبة</p>
          <Link href="/products" className="promo-button">
            تسوق الآن <span>←</span>
          </Link>
        </article>

        <div className="sales-row">
          {saleProducts.map((product) => (
            <Link key={product.id} href={productHref(product)} className="sale-card">
              <img
                src={product.image || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&h=500&fit=crop"}
                alt={product.name}
                className="sale-image"
                loading="lazy"
                decoding="async"
              />
              <p className="sale-name">{product.name}</p>
              <p className="sale-price">{formatPrice(product.price)}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
