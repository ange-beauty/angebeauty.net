"use client";

import Link from "next/link";
import type { Product } from "@/types/product";
import { getDisplayBrand } from "@/lib/brand";
import { formatPrice } from "@/lib/formatPrice";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useBasket } from "@/contexts/BasketContext";
import { useSellingPoint } from "@/contexts/SellingPointContext";
import { getAvailableQuantityForSellingPoint } from "@/lib/availability";
import { HeartIcon, ShoppingBagIcon } from "@/components/Icons";
import { productHref } from "@/lib/productUrl";

type Props = {
  product: Product;
  hidePrice?: boolean;
};

export default function ProductCard({ product, hidePrice = false }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToBasket, getItemQuantity } = useBasket();
  const { selectedSellingPoint } = useSellingPoint();

  const qty = getItemQuantity(product.id);
  const available = getAvailableQuantityForSellingPoint(product, selectedSellingPoint?.id);
  const displayBrand = getDisplayBrand(product.brand);
  const href = productHref(product);
  const hasDiscount =
    typeof product.basePrice === "number" &&
    product.basePrice > product.price &&
    (product.discountAmount ?? product.basePrice - product.price) > 0;

  return (
    <article className="product-card">
      <Link href={href}>
        <img
          src={product.image || "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop"}
          alt={product.name}
          loading="lazy"
          decoding="async"
        />
      </Link>
      <button
        className="product-fav-btn"
        aria-label="favorite"
        onClick={() => toggleFavorite(product.id)}
      >
        <HeartIcon color={isFavorite(product.id) ? "#B9442B" : "#7d6a6e"} size={17} />
      </button>
      <div className="product-body">
        {displayBrand ? <p className="product-brand">{displayBrand}</p> : null}
        <Link href={href}>
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <div className="product-footer">
          {!hidePrice ? (
            <div className="product-price-stack">
              {hasDiscount ? <p className="product-old-price">{formatPrice(product.basePrice!)}</p> : null}
              <p className={`product-price ${hasDiscount ? "discounted" : ""}`}>{formatPrice(product.price)}</p>
            </div>
          ) : <span />}
          <button
            className="product-basket-btn"
            aria-label="add to basket"
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
            <ShoppingBagIcon color="#7E4A53" size={16} />
            {qty > 0 ? <span className="product-basket-badge">{qty}</span> : null}
          </button>
        </div>
      </div>
    </article>
  );
}
