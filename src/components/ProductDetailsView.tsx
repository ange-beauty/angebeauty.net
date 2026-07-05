"use client";

import { useEffect, useState } from "react";
import { HeartIcon } from "@/components/Icons";
import { useBasket } from "@/contexts/BasketContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useSellingPoint } from "@/contexts/SellingPointContext";
import { getAvailableQuantityForSellingPoint } from "@/lib/availability";
import { formatPrice } from "@/lib/formatPrice";
import type { Product } from "@/types/product";

type Props = {
  product: Product;
};

export default function ProductDetailsView({ product }: Props) {
  const [isImageOpen, setIsImageOpen] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToBasket, getItemQuantity } = useBasket();
  const { selectedSellingPoint } = useSellingPoint();

  const qty = getItemQuantity(product.id);
  const available = getAvailableQuantityForSellingPoint(product, selectedSellingPoint?.id);
  const hasStock = available === null || available > qty;
  const hasDiscount =
    typeof product.basePrice === "number" &&
    product.basePrice > product.price &&
    (product.discountAmount ?? product.basePrice - product.price) > 0;

  const availabilityText = !selectedSellingPoint?.id
    ? "اختر نقطة البيع لمعرفة التوفر."
    : hasStock
      ? "متوفر في نقطة البيع المختارة."
      : "غير متوفر في نقطة البيع المختارة.";
  const displayImage =
    product.image || "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=1200&fit=crop";
  const popupImage = product.fullImage || displayImage;

  useEffect(() => {
    if (!isImageOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsImageOpen(false);
      }
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
        <div className="product-detail-head-logo">أنج بيوتي</div>
      </header>

      <section className="product-detail-layout">
        <article className="product-media-panel">
          <button type="button" className="product-detail-image-trigger" onClick={() => setIsImageOpen(true)}>
            <img
              src={displayImage}
              alt={product.name}
              className="product-detail-image"
            />
          </button>
          <button
            type="button"
            className="product-detail-fav-btn"
            aria-label="المفضلة"
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

          <div className="product-price-box">
            <p className="product-price-label">السعر</p>
            {hasDiscount ? <p className="product-detail-old-price">{formatPrice(product.basePrice!)}</p> : null}
            <p className={`product-price-value ${hasDiscount ? "discounted" : ""}`}>{formatPrice(product.price)}</p>
            <p className={`product-availability ${hasStock ? "ok" : "out"}`}>{availabilityText}</p>
          </div>
        </article>
      </section>

      <section className="product-sticky-bar">
        <div>
          <p className="product-sticky-price-label">السعر</p>
          {hasDiscount ? <p className="product-sticky-old-price">{formatPrice(product.basePrice!)}</p> : null}
          <p className={`product-sticky-price-value ${hasDiscount ? "discounted" : ""}`}>{formatPrice(product.price)}</p>
        </div>
        <button
          type="button"
          className="button primary product-add-button"
          onClick={() => {
            if (!selectedSellingPoint?.id) {
              window.alert("يرجى اختيار نقطة البيع أولاً من صفحة المتجر.");
              return;
            }
            if (available !== null && qty >= available) {
              window.alert("لا يمكن إضافة كمية أكبر من المتوفر في المتجر المحدد.");
              return;
            }
            addToBasket(product.id, 1);
          }}
        >
          {qty > 0 ? `إضافة إلى السلة (${qty})` : "إضافة إلى السلة"}
        </button>
      </section>

      {product.description ? (
        <section className="card product-description-card">
          <h2 className="product-description-title">الوصف</h2>
          <div dangerouslySetInnerHTML={{ __html: product.description }} />
        </section>
      ) : null}

      {isImageOpen ? (
        <div className="product-image-lightbox" onClick={() => setIsImageOpen(false)}>
          <button
            type="button"
            className="product-image-lightbox-close"
            aria-label="إغلاق الصورة"
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
