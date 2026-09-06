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
  const canAddToBasket = Number.isFinite(product.price) && product.price > 0;

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button className="button secondary" onClick={() => toggleFavorite(product.id)}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <HeartIcon color={isFavorite(product.id) ? "#B9442B" : "#7d6a6e"} size={16} />
          {isFavorite(product.id) ? "\u0625\u0632\u0627\u0644\u0629 \u0645\u0646 \u0627\u0644\u0645\u0641\u0636\u0644\u0629" : "\u0625\u0636\u0627\u0641\u0629 \u0644\u0644\u0645\u0641\u0636\u0644\u0629"}
        </span>
      </button>
      <button
        className="button primary"
        disabled={!canAddToBasket}
        onClick={() => {
          if (!selectedSellingPoint?.id) {
            window.alert("\u064a\u0631\u062c\u0649 \u0627\u062e\u062a\u064a\u0627\u0631 \u0646\u0642\u0637\u0629 \u0627\u0644\u0628\u064a\u0639 \u0623\u0648\u0644\u0627\u064b \u0645\u0646 \u0635\u0641\u062d\u0629 \u0627\u0644\u0645\u062a\u062c\u0631.");
            return;
          }
          if (available !== null && qty >= available) {
            window.alert("\u0644\u0627 \u064a\u0645\u0643\u0646 \u0625\u0636\u0627\u0641\u0629 \u0643\u0645\u064a\u0629 \u0623\u0643\u0628\u0631 \u0645\u0646 \u0627\u0644\u0645\u062a\u0648\u0641\u0631 \u0641\u064a \u0627\u0644\u0645\u062a\u062c\u0631 \u0627\u0644\u0645\u062d\u062f\u062f.");
            return;
          }
          addToBasket(product, 1);
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <ShoppingBagIcon color="#FFFFFF" size={16} />
          {!canAddToBasket
            ? "\u064a\u062a\u0648\u0641\u0631 \u0642\u0631\u064a\u0628\u0627\u064b"
            : qty > 0
              ? `\u0641\u064a \u0627\u0644\u0633\u0644\u0629 (${qty})`
              : "\u0625\u0636\u0627\u0641\u0629 \u0625\u0644\u0649 \u0627\u0644\u0633\u0644\u0629"}
        </span>
      </button>
    </div>
  );
}
