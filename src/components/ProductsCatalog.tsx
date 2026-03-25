"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { CloseIcon, FilterIcon, SearchIcon } from "@/components/Icons";
import { useSellingPoint } from "@/contexts/SellingPointContext";
import { fetchProducts, type Brand } from "@/lib/api";
import { getAvailableQuantityForSellingPoint } from "@/lib/availability";
import type { Product } from "@/types/product";

type Props = {
  initialProducts: Product[];
  initialHasMore: boolean;
  initialKeyword: string;
  initialBrand: string;
  initialBarcode: string;
  initialInStockOnly: boolean;
  brands: Brand[];
};

const BRAND_LETTERS = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
  "0", "-", "9",
];

function getBrandLabel(brand: Brand): string {
  return brand.brand_name_ar || brand.brand_name_en || brand.id;
}

function startsWithLetter(brand: Brand, letter: string): boolean {
  const label = getBrandLabel(brand).trim();
  if (!label) {
    return false;
  }

  const firstChar = label[0].toUpperCase();

  if (letter === "0") {
    return /[0-9]/.test(firstChar);
  }

  if (letter === "-") {
    return /[^A-Z0-9\u0600-\u06FF]/.test(firstChar);
  }

  return firstChar === letter;
}

export default function ProductsCatalog({
  initialProducts,
  initialHasMore,
  initialKeyword,
  initialBrand,
  initialBarcode,
  initialInStockOnly,
  brands,
}: Props) {
  const router = useRouter();
  const { selectedSellingPoint } = useSellingPoint();
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [keywordInput, setKeywordInput] = useState(initialKeyword);
  const [draftKeyword, setDraftKeyword] = useState(initialKeyword);
  const [draftBrand, setDraftBrand] = useState(initialBrand);
  const [draftBarcode, setDraftBarcode] = useState(initialBarcode);
  const [draftInStockOnly, setDraftInStockOnly] = useState(initialInStockOnly);
  const [activeBrandLetter, setActiveBrandLetter] = useState("A");
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setProducts(initialProducts);
    setPage(1);
    setHasMore(initialHasMore);
    setIsLoadingMore(false);
    setLoadError("");
    setKeywordInput(initialKeyword);
    setDraftKeyword(initialKeyword);
    setDraftBrand(initialBrand);
    setDraftBarcode(initialBarcode);
    setDraftInStockOnly(initialInStockOnly);
  }, [initialBarcode, initialBrand, initialHasMore, initialInStockOnly, initialKeyword, initialProducts]);

  const filteredBrands = useMemo(
    () => brands.filter((brand) => startsWithLetter(brand, activeBrandLetter)),
    [activeBrandLetter, brands],
  );

  const visibleProducts =
    draftInStockOnly && selectedSellingPoint?.id
      ? products.filter((product) => {
          const available = getAvailableQuantityForSellingPoint(product, selectedSellingPoint.id);
          return available === null || available > 0;
        })
      : products;

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
        if (entries[0]?.isIntersecting) {
          setIsLoadingMore(true);
        }
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, visibleProducts.length]);

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
        barcode: initialBarcode || undefined,
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
      if (!cancelled) {
        setLoadError("حدث خطأ أثناء تحميل المزيد من المنتجات.");
        setIsLoadingMore(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [initialBarcode, initialBrand, initialKeyword, isLoadingMore, page]);

  function applyFilters() {
    const query = new URLSearchParams();

    if (draftKeyword.trim()) {
      query.set("keyword", draftKeyword.trim());
    }
    if (draftBrand.trim()) {
      query.set("brand", draftBrand.trim());
    }
    if (draftBarcode.trim()) {
      query.set("barcode", draftBarcode.trim());
    }
    if (draftInStockOnly && selectedSellingPoint?.id) {
      query.set("in_stock", "1");
    }

    const href = query.toString() ? `/products?${query.toString()}` : "/products";
    setIsFilterOpen(false);
    router.push(href);
  }

  function resetFilters() {
    setDraftKeyword("");
    setDraftBrand("");
    setDraftBarcode("");
    setDraftInStockOnly(false);
    setKeywordInput("");
    setIsFilterOpen(false);
    router.push("/products");
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDraftKeyword(keywordInput);

    const query = new URLSearchParams();
    if (keywordInput.trim()) {
      query.set("keyword", keywordInput.trim());
    }
    if (initialBrand.trim()) {
      query.set("brand", initialBrand.trim());
    }
    if (initialBarcode.trim()) {
      query.set("barcode", initialBarcode.trim());
    }
    if (initialInStockOnly && selectedSellingPoint?.id) {
      query.set("in_stock", "1");
    }

    const href = query.toString() ? `/products?${query.toString()}` : "/products";
    router.push(href);
  }

  const hasActiveFilters = Boolean(initialBrand || initialBarcode || initialInStockOnly);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <section className="card products-head-card">
        <form className="products-search-shell" onSubmit={submitSearch}>
          <button type="button" className="products-filter-trigger" aria-label="فتح التصفية" onClick={() => setIsFilterOpen(true)}>
            <FilterIcon size={18} color="#7e4a53" />
            {hasActiveFilters ? <span className="products-filter-dot" /> : null}
          </button>

          <div className="products-search-field">
            <SearchIcon size={18} color="#6d565b" />
            <input
              className="products-search-input-plain"
              placeholder="ابحث عن المنتجات..."
              value={keywordInput}
              onChange={(event) => setKeywordInput(event.target.value)}
            />
          </div>
        </form>
      </section>

      <section className="card">
        {!visibleProducts.length ? <p className="muted">لم يتم العثور على منتجات.</p> : null}
        <div className="grid-products">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {loadError ? <p className="error products-load-state">{loadError}</p> : null}
        {hasMore ? (
          <div ref={sentinelRef} className="products-load-state" aria-hidden="true">
            {isLoadingMore ? "جار تحميل المزيد..." : "مرر للأسفل لتحميل المزيد"}
          </div>
        ) : visibleProducts.length ? (
          <p className="muted products-load-state">تم عرض جميع المنتجات.</p>
        ) : null}
      </section>

      {isFilterOpen ? (
        <div className="products-modal-overlay" onClick={() => setIsFilterOpen(false)}>
          <div className="products-modal products-modal-wide" onClick={(event) => event.stopPropagation()}>
            <div className="products-modal-header products-modal-header-row">
              <h2>تصفية المنتجات</h2>
              <button type="button" className="products-modal-close" aria-label="إغلاق" onClick={() => setIsFilterOpen(false)}>
                <CloseIcon size={22} color="#1a1a1a" />
              </button>
            </div>

            <div className="products-modal-body">
              <section className="products-filter-section">
                <div className="products-section-head">
                  <h3>توفر المنتج</h3>
                  <p>عرض المنتجات المتاحة فقط في نقطة البيع المحددة</p>
                </div>
                <label className={`products-availability-toggle ${!selectedSellingPoint?.id ? "disabled" : ""}`}>
                  <input
                    type="checkbox"
                    checked={draftInStockOnly && !!selectedSellingPoint?.id}
                    disabled={!selectedSellingPoint?.id}
                    onChange={(event) => setDraftInStockOnly(event.target.checked)}
                  />
                  <span className="products-toggle-slider" />
                </label>
                {!selectedSellingPoint?.id ? (
                  <p className="products-helper-note">اختر نقطة البيع أولاً لتفعيل هذا الخيار</p>
                ) : null}
              </section>

              <section className="products-filter-section">
                <div className="products-section-head">
                  <h3>الباركود</h3>
                </div>
                <input
                  className="input products-filter-input"
                  placeholder="أدخل الباركود..."
                  value={draftBarcode}
                  onChange={(event) => setDraftBarcode(event.target.value)}
                />
              </section>

              <section className="products-filter-section">
                <div className="products-section-head">
                  <h3>العلامة التجارية</h3>
                </div>

                <div className="products-letters-row">
                  {BRAND_LETTERS.map((letter) => (
                    <button
                      key={letter}
                      type="button"
                      className={`products-letter ${activeBrandLetter === letter ? "active" : ""}`}
                      onClick={() => setActiveBrandLetter(letter)}
                    >
                      {letter}
                    </button>
                  ))}
                </div>

                <div className="products-brands-panel">
                  {filteredBrands.length ? (
                    <div className="products-brands-grid">
                      {filteredBrands.map((brand) => (
                        <button
                          key={brand.id}
                          type="button"
                          className={`products-brand-chip ${draftBrand === brand.id ? "active" : ""}`}
                          onClick={() => setDraftBrand((current) => (current === brand.id ? "" : brand.id))}
                        >
                          {getBrandLabel(brand)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="products-empty-state">لا توجد علامات تجارية تبدأ بـ {activeBrandLetter}</p>
                  )}
                </div>
              </section>
            </div>

            <div className="products-modal-footer products-modal-footer-actions">
              <button type="button" className="button secondary products-modal-action" onClick={resetFilters}>
                مسح الكل
              </button>
              <button type="button" className="button primary products-modal-action products-modal-action-dark" onClick={applyFilters}>
                تطبيق
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
