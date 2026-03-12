"use client";

import { useEffect, useRef, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { fetchProducts, type Brand } from "@/lib/api";
import type { Product } from "@/types/product";

type Props = {
  initialProducts: Product[];
  initialHasMore: boolean;
  initialKeyword: string;
  initialBrand: string;
  brands: Brand[];
};

export default function ProductsCatalog({
  initialProducts,
  initialHasMore,
  initialKeyword,
  initialBrand,
  brands,
}: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState("");
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setProducts(initialProducts);
    setPage(1);
    setHasMore(initialHasMore);
    setIsLoadingMore(false);
    setLoadError("");
  }, [initialBrand, initialHasMore, initialKeyword, initialProducts]);

  useEffect(() => {
    if (!hasMore || isLoadingMore) {
      return;
    }

    const node = sentinelRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) {
          return;
        }

        setIsLoadingMore(true);
      },
      {
        rootMargin: "300px 0px",
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, products.length]);

  useEffect(() => {
    if (!isLoadingMore) {
      return;
    }

    let cancelled = false;

    async function loadNextPage() {
      const nextPage = page + 1;
      const response = await fetchProducts({
        page: nextPage,
        limit: 10,
        keyword: initialKeyword || undefined,
        brand: initialBrand || undefined,
      });

      if (cancelled) {
        return;
      }

      if (!response.products.length && response.hasMore) {
        setLoadError("تعذر تحميل المزيد من المنتجات.");
        setIsLoadingMore(false);
        return;
      }

      setProducts((current) => {
        const seen = new Set(current.map((item) => item.id));
        const incoming = response.products.filter((item) => !seen.has(item.id));
        return [...current, ...incoming];
      });
      setPage(nextPage);
      setHasMore(response.hasMore);
      setLoadError("");
      setIsLoadingMore(false);
    }

    loadNextPage().catch(() => {
      if (cancelled) {
        return;
      }
      setLoadError("حدث خطأ أثناء تحميل المزيد من المنتجات.");
      setIsLoadingMore(false);
    });

    return () => {
      cancelled = true;
    };
  }, [initialBrand, initialKeyword, isLoadingMore, page]);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <section className="card">
        <h1 className="page-title">المنتجات</h1>
        <form method="get" className="products-search-row">
          <input
            className="input products-search-input"
            placeholder="ابحث عن المنتجات..."
            name="keyword"
            defaultValue={initialKeyword}
          />
          <select className="select" name="brand" defaultValue={initialBrand}>
            <option value="">كل العلامات</option>
            {brands.map((item) => (
              <option key={item.id} value={item.id}>
                {item.brand_name_ar || item.brand_name_en}
              </option>
            ))}
          </select>
          <button className="button primary" type="submit">
            تطبيق
          </button>
        </form>
      </section>

      <section className="card">
        {!products.length ? <p className="muted">لم يتم العثور على منتجات.</p> : null}
        <div className="grid-products">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {loadError ? <p className="error products-load-state">{loadError}</p> : null}
        {hasMore ? (
          <div ref={sentinelRef} className="products-load-state" aria-hidden="true">
            {isLoadingMore ? "جار تحميل المزيد..." : "مرر للأسفل لتحميل المزيد"}
          </div>
        ) : products.length ? (
          <p className="muted products-load-state">تم عرض جميع المنتجات.</p>
        ) : null}
      </section>
    </div>
  );
}
