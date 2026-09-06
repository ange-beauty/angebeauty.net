import Link from "next/link";

import HomeHighlightsSlider, { type OfferHeroSlide } from "@/components/HomeHighlightsSlider";
import HorizontalScroller from "@/components/HorizontalScroller";
import { formatPrice } from "@/lib/formatPrice";
import { productHref, slugifyProductName } from "@/lib/productUrl";
import {
  fetchBrandsServer,
  fetchProductsServer,
  fetchPublicOffersServer,
  fetchTagsWithProductsServer,
  type PublicOffer,
} from "@/lib/serverApi";
import type { Product } from "@/types/product";

export const metadata = {
  title: "\u0623\u0646\u062c \u0628\u064a\u0648\u062a\u064a | \u062c\u0645\u0627\u0644 \u0645\u0644\u0627\u0626\u0643\u064a",
  description: "\u0627\u0643\u062a\u0634\u0641 \u0639\u0631\u0648\u0636 \u0648\u0645\u0646\u062a\u062c\u0627\u062a \u0623\u0646\u062c \u0628\u064a\u0648\u062a\u064a \u0627\u0644\u0645\u0645\u064a\u0632\u0629.",
};

function getOfferName(offer: PublicOffer) {
  return String(offer.name_ar || offer.name_en || "\u0639\u0631\u0636 \u0623\u0646\u062c \u0628\u064a\u0648\u062a\u064a").trim();
}

function getOfferDescription(offer: PublicOffer) {
  return String(
    offer.description_ar || offer.description_en || "\u0645\u0646\u062a\u062c\u0627\u062a \u0645\u062e\u062a\u0627\u0631\u0629 \u0628\u0633\u0639\u0631 \u062e\u0627\u0635 \u0644\u0641\u062a\u0631\u0629 \u0645\u062d\u062f\u0648\u062f\u0629.",
  ).trim();
}

function getOfferValueLabel(offer: PublicOffer) {
  const value = Number(offer.offer_value || 0);
  const type = String(offer.offer_type || "").trim();
  if (type === "percentage_discount") return `${value}%`;
  if (type === "fixed_discount") return `\u062e\u0635\u0645 ${value.toLocaleString("ar-IQ")}`;
  if (type === "fixed_price") return value.toLocaleString("ar-IQ");
  return "\u0639\u0631\u0636 \u062e\u0627\u0635";
}

function buildOfferHeroImageUrl(offer: PublicOffer) {
  const fileName = offer.hero_image || `${offer.id}.webp`;
  return `https://images.angebeauty.net/angeapi/cdn/images/${offer.id}/${fileName}`;
}

async function fetchProductsForOffer(offer: PublicOffer): Promise<Product[]> {
  const response = await fetchProductsServer({ page: 1, limit: 4, offerIds: offer.id });
  return response.products;
}

function buildHighlightedSlides(products: Product[]): OfferHeroSlide[] {
  const root = process.env.NEXT_PUBLIC_ROOT_DIR || "angeapi";
  return products.slice(0, 10).map((product) => ({
    id: `highlighted-${product.id}`,
    badge: product.brand || "\u0645\u0646\u062a\u062c \u0645\u0645\u064a\u0632",
    title: product.name,
    description: product.brand || "\u0623\u0646\u062c \u0628\u064a\u0648\u062a\u064a",
    valueLabel: product.price > 0 ? `${formatPrice(product.price)} \u062f.\u0639` : "\u064a\u062a\u0648\u0641\u0631 \u0642\u0631\u064a\u0628\u0627\u064b",
    href: productHref(product),
    heroImage: `https://images.angebeauty.net/${root}/cdn/images/${product.id}/media/tv_display_1.webp`,
    fallbackImage: product.image,
    hideText: true,
    showTextOnFallback: true,
    products: [product],
  }));
}

export default async function HomePage() {
  const [offers, highlightedResponse, brands, tags] = await Promise.all([
    fetchPublicOffersServer(),
    fetchProductsServer({ page: 1, limit: 10, highlighted: 1 }),
    fetchBrandsServer(),
    fetchTagsWithProductsServer(),
  ]);
  const highlighted = highlightedResponse.products || [];
  const offerSlides = await Promise.all(
    offers.slice(0, 5).map(async (offer): Promise<OfferHeroSlide> => {
      const products = await fetchProductsForOffer(offer);
      return {
        id: offer.id,
        badge: "\u0639\u0631\u0636 \u0641\u0639\u0627\u0644",
        title: getOfferName(offer),
        description: getOfferDescription(offer),
        valueLabel: getOfferValueLabel(offer),
        href: `/products?offerIds=${encodeURIComponent(offer.id)}`,
        heroImage: buildOfferHeroImageUrl(offer),
        fallbackImage: products[0]?.image,
        hideText: true,
        showTextOnFallback: true,
        products,
      };
    }),
  );
  const highlightedSlides = buildHighlightedSlides(highlighted);

  return (
    <div className="home-page">
      {offerSlides.length > 0 ? (
        <section className="home-hero" aria-label={'\u0639\u0631\u0648\u0636 \u0623\u0646\u062c \u0628\u064a\u0648\u062a\u064a'}>
          <HomeHighlightsSlider slides={offerSlides} />
        </section>
      ) : null}

      <Link href="/products?hasActiveOffer=true" className="home-discount-offers-banner" aria-label={'\u062a\u0635\u0641\u062d \u0627\u0644\u0639\u0631\u0648\u0636'}>
        <img src="/images/discount__offers_home.webp" alt={'\u062a\u062e\u0641\u064a\u0636\u0627\u062a \u0648\u0639\u0631\u0648\u0636 \u0623\u0646\u062c \u0628\u064a\u0648\u062a\u064a'} />
      </Link>

      {highlightedSlides.length > 0 ? (
        <section className="home-section">
          <div className="home-section-head"><h2>{'\u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a \u0627\u0644\u0645\u0645\u064a\u0632\u0629'}</h2></div>
          <div className="home-highlighted-hero"><HomeHighlightsSlider slides={highlightedSlides} /></div>
        </section>
      ) : null}

      {brands.length > 0 ? (
        <section className="home-section">
          <div className="home-section-head">
            <Link href="/brands">{'\u0639\u0631\u0636 \u0627\u0644\u0643\u0644'}</Link>
            <h2>{'\u0628\u0631\u0627\u0646\u062f\u0627\u062a\u0646\u0627'}</h2>
          </div>
          <HorizontalScroller trackClassName="home-brand-strip" label={'\u0628\u0631\u0627\u0646\u062f\u0627\u062a\u0646\u0627'}>
            {brands.slice(0, 12).map((brand) => (
              <Link
                key={brand.id}
                href={`/products/brand/${encodeURIComponent(brand.id)}/${encodeURIComponent(slugifyProductName(brand.brand_name_ar || brand.brand_name_en || brand.id) || "brand")}`}
                className="home-brand-card"
                aria-label={brand.brand_name_ar || brand.brand_name_en || brand.id}
              >
                {brand.icon ? (
                  <img src={`https://images.angebeauty.net/${process.env.NEXT_PUBLIC_ROOT_DIR || "angeapi"}/cdn/images/${brand.id}/${brand.icon}?v=${brand.aggregate_version || 1}`} alt="" />
                ) : (
                  <span>{brand.brand_name_ar || brand.brand_name_en || brand.id}</span>
                )}
              </Link>
            ))}
          </HorizontalScroller>
        </section>
      ) : null}

      {tags.length > 0 ? (
        <section className="home-section">
          <div className="home-section-head"><h2>{'\u0627\u0644\u0648\u0633\u0648\u0645'}</h2></div>
          <HorizontalScroller trackClassName="home-tag-strip" label={'\u0627\u0644\u0648\u0633\u0648\u0645'}>
            {tags.slice(0, 20).map((tag) => (
              <Link key={tag.id} href={`/products?tag=${encodeURIComponent(tag.id)}`} className="home-tag-pill">
                {tag.tag_name_ar || tag.tag_name_en}
              </Link>
            ))}
          </HorizontalScroller>
        </section>
      ) : null}
    </div>
  );
}
