"use client";

import { useEffect, useState } from "react";

import { HeartIcon } from "@/components/Icons";
import { useBasket } from "@/contexts/BasketContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useSellingPoint } from "@/contexts/SellingPointContext";
import { formatPrice } from "@/lib/formatPrice";
import type { Product } from "@/types/product";
import type { ProductVariationGroup } from "@/types/productVariations";
import ProductVariationSelector from "@/components/ProductVariationSelector";

type Props = {
  product: Product;
  variationGroup?: ProductVariationGroup | null;
};

export default function ProductDetailsView({ product, variationGroup }: Props) {
  const [isImageOpen, setIsImageOpen] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToBasket, getItemQuantity } = useBasket();
  const { selectedSellingPoint } = useSellingPoint();
  const qty = getItemQuantity(product.id);
  const canAddToBasket = Number.isFinite(product.price) && product.price > 0;
  const hasDiscount =
    canAddToBasket &&
    typeof product.basePrice === "number" &&
    product.basePrice > product.price &&
    (product.discountAmount ?? product.basePrice - product.price) > 0;
  const priceLabel = canAddToBasket ? formatPrice(product.price) : "\u064a\u062a\u0648\u0641\u0631 \u0642\u0631\u064a\u0628\u0627\u064b";
  const displayImage =
    product.image || "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=1200&fit=crop";
  const popupImage = product.fullImage || displayImage;

  useEffect(() => {
    if (!isImageOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsImageOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isImageOpen]);

  return (
    <div className="product-detail-page">
      <header className="product-detail-head">
        <div className="product-detail-head-logo">{'\u0623\u0646\u062c \u0628\u064a\u0648\u062a\u064a'}</div>
      </header>

      <section className="product-detail-layout">
        <article className="product-media-panel">
          <button type="button" className="product-detail-image-trigger" onClick={() => setIsImageOpen(true)}>
            <img src={displayImage} alt={product.name} className="product-detail-image" />
          </button>
          <button
            type="button"
            className="product-detail-fav-btn"
            aria-label={'\u0627\u0644\u0645\u0641\u0636\u0644\u0629'}
            onClick={() => toggleFavorite(product.id)}
          >
            <HeartIcon color={isFavorite(product.id) ? "#B9442B" : "#7d6a6e"} size={18} />
          </button>
        </article>

        <article className="product-info-panel">
          <div className="product-info-top">
            <span className="product-chip">{product.category}</span>
            <span className="product-chip">{product.brand}</span>
          </div>
          <h1 className="product-detail-title">{product.name}</h1>
          {variationGroup && <ProductVariationSelector group={variationGroup} productId={product.id} />}
          <div className="product-price-box">
            <p className="product-price-label">{'\u0627\u0644\u0633\u0639\u0631'}</p>
            {hasDiscount ? <p className="product-detail-old-price">{formatPrice(product.basePrice!)}</p> : null}
            <p className={`product-price-value ${hasDiscount ? "discounted" : ""}`}>{priceLabel}</p>
          </div>
        </article>
      </section>

      <section className="product-sticky-bar">
        <div>
          <p className="product-sticky-price-label">{'\u0627\u0644\u0633\u0639\u0631'}</p>
          {hasDiscount ? <p className="product-sticky-old-price">{formatPrice(product.basePrice!)}</p> : null}
          <p className={`product-sticky-price-value ${hasDiscount ? "discounted" : ""}`}>{priceLabel}</p>
        </div>
        <button
          type="button"
          className="button primary product-add-button"
          disabled={!canAddToBasket}
          onClick={() => {
            if (!selectedSellingPoint?.id) {
              window.alert("\u064a\u0631\u062c\u0649 \u0627\u062e\u062a\u064a\u0627\u0631 \u0646\u0642\u0637\u0629 \u0627\u0644\u0628\u064a\u0639 \u0623\u0648\u0644\u0627\u064b \u0645\u0646 \u0635\u0641\u062d\u0629 \u0627\u0644\u0645\u062a\u062c\u0631.");
              return;
            }
            addToBasket(product, 1);
          }}
        >
          {!canAddToBasket
            ? "\u064a\u062a\u0648\u0641\u0631 \u0642\u0631\u064a\u0628\u0627\u064b"
            : qty > 0
              ? `\u0625\u0636\u0627\u0641\u0629 \u0625\u0644\u0649 \u0627\u0644\u0633\u0644\u0629 (${qty})`
              : "\u0625\u0636\u0627\u0641\u0629 \u0625\u0644\u0649 \u0627\u0644\u0633\u0644\u0629"}
        </button>
      </section>

      {product.description ? (
        <section className="card product-description-card">
          <h2 className="product-description-title">{'\u0627\u0644\u0648\u0635\u0641'}</h2>
          <div dangerouslySetInnerHTML={{ __html: product.description }} />
        </section>
      ) : null}

      {isImageOpen ? (
        <div className="product-image-lightbox" onClick={() => setIsImageOpen(false)}>
          <button
            type="button"
            className="product-image-lightbox-close"
            aria-label={'\u0625\u063a\u0644\u0627\u0642 \u0627\u0644\u0635\u0648\u0631\u0629'}
            onClick={() => setIsImageOpen(false)}
          >
            ×
          </button>
          <img
            src={popupImage}
            alt={product.name}
            className="product-image-lightbox-img"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  );
}
