"use client";

import { HeartIcon, ShoppingBagIcon } from "@/components/Icons";
import { useBasket } from "@/contexts/BasketContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useSellingPoint } from "@/contexts/SellingPointContext";
import { getAvailableQuantityForSellingPoint } from "@/lib/availability";
import type { Product } from "@/types/product";

type ProductActionsProps = {
  product: Product;
};

export default function ProductActions({ product }: ProductActionsProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToBasket, getItemQuantity } = useBasket();
  const { selectedSellingPoint } = useSellingPoint();

  const qty = getItemQuantity(product.id);
  const available = getAvailableQuantityForSellingPoint(product, selectedSellingPoint?.id);

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button className="button secondary" onClick={() => toggleFavorite(product.id)}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <HeartIcon color={isFavorite(product.id) ? "#B9442B" : "#7d6a6e"} size={16} />
          {isFavorite(product.id) ? "إزالة من المفضلة" : "إضافة للمفضلة"}
        </span>
      </button>
      <button
        className="button primary"
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
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <ShoppingBagIcon color="#FFFFFF" size={16} />
          {qty > 0 ? `في السلة (${qty})` : "إضافة إلى السلة"}
        </span>
      </button>
    </div>
  );
}
