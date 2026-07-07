import HomeHighlightsSlider, { type OfferHeroSlide } from "@/components/HomeHighlightsSlider";
import { productHref, slugifyProductName } from "@/lib/productUrl";
import {
  fetchProductByIdServer,
  fetchProductsServer,
  fetchPublicOffersServer,
  type PublicOffer,
  type PublicOfferTarget,
} from "@/lib/serverApi";
import type { Product } from "@/types/product";

export const metadata = {
  title: "أنج بيوتي | العروض",
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

function buildOfferHeroImageUrl(offer: PublicOffer) {
  return `https://images.angebeauty.net/angeapi/cdn/images/${offer.id}/${offer.id}.webp`;
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

    if (target.type === "tag") {
      const response = await fetchProductsServer({ page: 1, limit: 4, tag: target.id });
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

  return "/products";
}

function buildFallbackSlides(products: Product[]): OfferHeroSlide[] {
  return products.slice(0, 5).map((product) => ({
    id: `product-${product.id}`,
    badge: "منتج مميز",
    title: product.brand || "Ange Beauty",
    description: product.name,
    valueLabel: product.price ? product.price.toLocaleString("ar-IQ") : "عرض خاص",
    href: productHref(product),
    products: [product],
  }));
}

export default async function HomePage() {
  const [offers, highlightedResponse] = await Promise.all([
    fetchPublicOffersServer(),
    fetchProductsServer({ page: 1, limit: 8, highlighted: 1 }),
  ]);
  const highlighted = highlightedResponse.products || [];

  const offerSlides = await Promise.all(
    offers.slice(0, 5).map(async (offer): Promise<OfferHeroSlide | null> => {
      const products = await fetchProductsForOffer(offer);

      return {
        id: offer.id,
        badge: "عرض فعال",
        title: getOfferName(offer),
        description: getOfferDescription(offer),
        valueLabel: getOfferValueLabel(offer),
        href: buildOfferHref(offer, products),
        heroImage: buildOfferHeroImageUrl(offer),
        products,
      };
    })
  );

  const slides = offerSlides.filter((slide): slide is OfferHeroSlide => Boolean(slide))
    .filter((slide) => slide.products.length > 0 || Boolean(slide.heroImage));
  const heroSlides = slides.length > 0 ? slides : buildFallbackSlides(highlighted);

  return (
    <div className="home-page">
      <section className="home-hero" aria-label="عروض أنج بيوتي">
        {!heroSlides.length ? <p className="muted">لا توجد عروض متاحة حالياً.</p> : null}
        <HomeHighlightsSlider slides={heroSlides} />
      </section>
    </div>
  );
}
