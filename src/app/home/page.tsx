import Link from "next/link";
import HomeHighlightsSlider, { type OfferHeroSlide } from "@/components/HomeHighlightsSlider";
import ProductCard from "@/components/ProductCard";
import { productHref, slugifyProductName } from "@/lib/productUrl";
import {
  fetchBrandsServer,
  fetchCategoriesServer,
  fetchProductByIdServer,
  fetchProductsServer,
  fetchPublicOffersServer,
  type PublicOffer,
  type PublicOfferTarget,
} from "@/lib/serverApi";
import type { Product } from "@/types/product";

export const metadata = {
  title: "أنج بيوتي | جمال ملائكي",
  description: "اكتشف عروض ومنتجات أنج بيوتي المميزة.",
};

function getOfferName(offer: PublicOffer) {
  return String(offer.name_ar || offer.name_en || "عرض أنج بيوتي").trim();
}

function getOfferDescription(offer: PublicOffer) {
  return String(offer.description_ar || offer.description_en || "منتجات مختارة بسعر خاص لفترة محدودة.").trim();
}

function getOfferValueLabel(offer: PublicOffer) {
  const value = Number(offer.offer_value || 0);
  const type = String(offer.offer_type || "").trim();

  if (type === "percentage_discount") return `${value}%`;
  if (type === "fixed_discount") return `خصم ${value.toLocaleString("ar-IQ")}`;
  if (type === "fixed_price") return `${value.toLocaleString("ar-IQ")}`;
  return "عرض خاص";
}

function shouldHideOfferText(offer: PublicOffer) {
  const value = offer.hide_text;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true";
  }
  return false;
}

function buildOfferHeroImageUrl(offer: PublicOffer) {
  const fileName = offer.hero_image || `${offer.id}.webp`;
  return `https://images.angebeauty.net/angeapi/cdn/images/${offer.id}/${fileName}`;
}

function normalizeTarget(target: PublicOfferTarget) {
  const type = String(target.target_aggregate_type || target.TargetAggregateType || "")
    .trim()
    .toLowerCase();
  const id = String(target.target_aggregate_id || target.TargetAggregateId || "").trim();
  return { type, id };
}

async function fetchProductsForOffer(offer: PublicOffer): Promise<Product[]> {
  const targets = (offer.targets || []).map(normalizeTarget).filter((target) => target.type && target.id);

  for (const target of targets) {
    if (target.type === "product") {
      const product = await fetchProductByIdServer(target.id);
      if (product) return [product];
    }

    if (target.type === "brand") {
      const response = await fetchProductsServer({ page: 1, limit: 4, brand: target.id });
      if (response.products.length) return response.products;
    }

    if (target.type === "category") {
      const response = await fetchProductsServer({ page: 1, limit: 4, category: target.id });
      if (response.products.length) return response.products;
    }
  }

  return [];
}

function buildOfferHref(offer: PublicOffer, products: Product[]) {
  const productTarget = (offer.targets || []).map(normalizeTarget).find((target) => target.type === "product" && target.id);
  if (productTarget) {
    return `/products?product=${encodeURIComponent(productTarget.id)}`;
  }

  const brandId = products.find((product) => product.brandId)?.brandId;
  if (brandId) {
    const brandName = products.find((product) => product.brandId === brandId)?.brand || getOfferName(offer);
    return `/products/brand/${encodeURIComponent(brandId)}/${encodeURIComponent(slugifyProductName(brandName) || "brand")}`;
  }

  const categoryTarget = (offer.targets || []).map(normalizeTarget).find((target) => target.type === "category" && target.id);
  if (categoryTarget) {
    return `/products?category=${encodeURIComponent(categoryTarget.id)}`;
  }

  return "/products";
}

function buildFallbackSlides(products: Product[]): OfferHeroSlide[] {
  return products.slice(0, 5).map((product) => ({
    id: `product-${product.id}`,
    badge: "منتج مميز",
    title: product.brand || "أنج بيوتي",
    description: product.name,
    valueLabel: product.price ? product.price.toLocaleString("ar-IQ") : "عرض خاص",
    href: productHref(product),
    products: [product],
  }));
}

export default async function HomePage() {
  const [offers, highlightedResponse, popularResponse, brands, categories] = await Promise.all([
    fetchPublicOffersServer(),
    fetchProductsServer({ page: 1, limit: 8, highlighted: 1 }),
    fetchProductsServer({ page: 1, limit: 8 }),
    fetchBrandsServer(),
    fetchCategoriesServer(),
  ]);
  const highlighted = highlightedResponse.products || [];
  const popular = popularResponse.products || [];

  const offerSlides = await Promise.all(
    offers.slice(0, 5).map(async (offer): Promise<OfferHeroSlide> => {
      const products = await fetchProductsForOffer(offer);

      return {
        id: offer.id,
        badge: "عرض فعال",
        title: getOfferName(offer),
        description: getOfferDescription(offer),
        valueLabel: getOfferValueLabel(offer),
        href: buildOfferHref(offer, products),
        heroImage: buildOfferHeroImageUrl(offer),
        hideText: shouldHideOfferText(offer),
        products,
      };
    }),
  );

  const heroSlides = offerSlides.length > 0 ? offerSlides : buildFallbackSlides(highlighted);
  const rootCategories = categories.filter((category) => !category.parent_category).slice(0, 12);

  return (
    <div className="home-page">
      <section className="home-hero" aria-label="عروض أنج بيوتي">
        {!heroSlides.length ? <p className="muted">لا توجد عروض متاحة حالياً.</p> : null}
        <HomeHighlightsSlider slides={heroSlides} />
      </section>

      <section className="home-section">
        <div className="home-section-head">
          <Link href="/categories">عرض الكل</Link>
          <h2>الفئات</h2>
        </div>
        <div className="home-category-strip">
          {rootCategories.map((category) => (
            <Link key={category.id} href={`/products?category=${encodeURIComponent(category.id)}`} className="home-category-card">
              <span>{category.category_name_ar || category.category_name_en || category.id}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-head">
          <Link href="/brands">عرض الكل</Link>
          <h2>برانداتنا</h2>
        </div>
        <div className="home-brand-strip">
          {brands.slice(0, 8).map((brand) => (
            <Link
              key={brand.id}
              href={`/products/brand/${encodeURIComponent(brand.id)}/${encodeURIComponent(slugifyProductName(brand.brand_name_ar || brand.brand_name_en || brand.id) || "brand")}`}
              className="home-brand-card"
            >
              {brand.brand_name_ar || brand.brand_name_en || brand.id}
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-head">
          <Link href="/products">عرض الكل</Link>
          <h2>المنتجات المميزة</h2>
        </div>
        <div className="grid-products home-products-grid">
          {highlighted.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-head">
          <Link href="/products">عرض الكل</Link>
          <h2>المنتجات الأكثر مبيعا</h2>
        </div>
        <div className="grid-products home-products-grid">
          {popular.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
