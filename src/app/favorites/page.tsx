"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/ProductCard";
import { useFavorites } from "@/contexts/FavoritesContext";
import { fetchProductById } from "@/lib/api";

export default function FavoritesPage() {
  const { favorites } = useFavorites();

  const query = useQuery({
    queryKey: ["favorite-products", favorites],
    queryFn: async () => {
      const results = await Promise.all(favorites.map((id) => fetchProductById(id)));
      return results.filter((item) => item !== null);
    },
    enabled: favorites.length > 0,
  });

  const products = useMemo(() => query.data || [], [query.data]);

  return (
    <div className="card">
      <h1 className="page-title">المفضلة</h1>
      {favorites.length === 0 ? <p className="muted">لا توجد مفضلات بعد.</p> : null}
      {query.isLoading ? <p className="muted">جاري التحميل...</p> : null}
      <div className="grid-products">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
