"use client";

import { useEffect, useRef, useState } from "react";

import ProductCard from "@/components/ProductCard";
import { fetchProducts } from "@/lib/api";
import type { Product } from "@/types/product";

const PAGE_SIZE = 20;

/** The full product list at the very end of the home page: it loads once the visitor scrolls near the bottom, then keeps loading pages. */
export default function HomeAllProducts() {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!hasMore || isLoading) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setIsLoading(true);
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoading, products.length]);

  useEffect(() => {
    if (!isLoading) return;
    let cancelled = false;

    fetchProducts({ page: page + 1, limit: PAGE_SIZE }).then((response) => {
      if (cancelled) return;
      setProducts((current) => [...current, ...response.products]);
      setPage((current) => current + 1);
      setHasMore(response.hasMore);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [isLoading, page]);

  return (
    <section className="home-section">
      <div className="home-section-head">
        <h2>جميع المنتجات</h2>
      </div>
      <div className="grid-products">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {hasMore ? (
        <div ref={sentinelRef} className="products-load-state" aria-hidden="true">
          {isLoading ? "جاري تحميل المزيد..." : ""}
        </div>
      ) : null}
    </section>
  );
}
