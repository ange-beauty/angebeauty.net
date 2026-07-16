"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { CloseIcon, FilterIcon, SearchIcon } from "@/components/Icons";
import { fetchProducts, type Brand, type Category } from "@/lib/api";
import { slugifyProductName } from "@/lib/productUrl";
import type { Product } from "@/types/product";

type Props = {
  initialProducts: Product[];
  initialHasMore: boolean;
  initialKeyword: string;
  initialBrand: string;
  initialBarcode: string;
  initialProduct: string;
  initialCategory: string;
  initialFocusSearch: boolean;
  brands: Brand[];
  categories: Category[];
};

const BRAND_ALL_FILTER = "ALL";
const BRAND_LETTERS = [
  BRAND_ALL_FILTER,
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
];

function getBrandLabel(brand: Brand): string {
  return brand.brand_name_ar || brand.brand_name_en || brand.id;
}

function getCategoryLabel(category: Category): string {
  return category.category_name_ar || category.category_name_en || category.id;
}

function startsWithLetter(brand: Brand, letter: string): boolean {
  if (letter === BRAND_ALL_FILTER) return true;
  const labels = [brand.brand_name_en, brand.brand_name_ar, brand.id]
    .map((value) => String(value || "").trim())
    .filter(Boolean);
  return labels.some((label) => (label[0]?.toUpperCase() || "") === letter);
}

function brandFilterPath(brand: Brand): string {
  const label = getBrandLabel(brand);
  const slug = slugifyProductName(label || "brand") || "brand";
  return `/products/brand/${encodeURIComponent(brand.id)}/${encodeURIComponent(slug)}`;
}

export default function ProductsCatalog({
  initialProducts,
  initialHasMore,
  initialKeyword,
  initialBrand,
  initialBarcode,
  initialProduct,
  initialCategory,
  initialFocusSearch,
  brands,
  categories,
}: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
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
  const [draftCategories, setDraftCategories] = useState<string[]>(
    initialCategory.split(",").map((item) => item.trim()).filter(Boolean),
  );
  const [activeBrandLetter, setActiveBrandLetter] = useState(BRAND_ALL_FILTER);

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
    setDraftCategories(initialCategory.split(",").map((item) => item.trim()).filter(Boolean));
  }, [initialBarcode, initialBrand, initialCategory, initialHasMore, initialKeyword, initialProducts]);

  useEffect(() => {
    if (initialFocusSearch) {
      inputRef.current?.focus();
    }
  }, [initialFocusSearch]);

  const filteredBrands = useMemo(
    () => brands.filter((brand) => startsWithLetter(brand, activeBrandLetter)),
    [activeBrandLetter, brands],
  );

  const rootCategories = useMemo(
    () => {
      const ids = new Set(categories.map((category) => category.id));
      return categories.filter((category) => !category.parent_category || !ids.has(category.parent_category));
    },
    [categories],
  );

  const childrenByParent = useMemo(() => {
    const map = new Map<string, Category[]>();
    const ids = new Set(categories.map((category) => category.id));
    categories.forEach((category) => {
      if (!category.parent_category || !ids.has(category.parent_category)) return;
      const current = map.get(category.parent_category) || [];
      current.push(category);
      map.set(category.parent_category, current);
    });
    return map;
  }, [categories]);

  useEffect(() => {
    if (!hasMore || isLoadingMore) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setIsLoadingMore(true);
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, products.length]);

  useEffect(() => {
    if (!isLoadingMore) return;
    let cancelled = false;

    async function loadNextPage() {
      const nextPage = page + 1;
      const response = await fetchProducts({
        page: nextPage,
        limit: 10,
        keyword: initialKeyword || undefined,
        brand: initialBrand || undefined,
        barcode: initialBarcode || undefined,
        product: initialProduct || undefined,
        category: initialCategory || undefined,
      });

      if (cancelled) return;
      if (!response.products.length && response.hasMore) {
        setLoadError("تعذر تحميل المزيد من المنتجات.");
        setIsLoadingMore(false);
        return;
      }

      setProducts((current) => {
        const seen = new Set(current.map((item) => item.id));
        return [...current, ...response.products.filter((item) => !seen.has(item.id))];
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
  }, [initialBarcode, initialBrand, initialCategory, initialKeyword, initialProduct, isLoadingMore, page]);

  function pushProductsRoute(next: {
    keyword?: string;
    barcode?: string;
    brand?: string;
    product?: string;
    category?: string;
  }) {
    const query = new URLSearchParams();
    if (next.keyword?.trim()) query.set("keyword", next.keyword.trim());
    if (next.barcode?.trim()) query.set("barcode", next.barcode.trim());
    if (next.product?.trim()) query.set("product", next.product.trim());
    if (next.category?.trim()) query.set("category", next.category.trim());

    const selectedBrand = brands.find((brand) => brand.id === next.brand?.trim());
    const basePath = selectedBrand ? brandFilterPath(selectedBrand) : "/products";
    router.push(query.toString() ? `${basePath}?${query.toString()}` : basePath);
  }

  function applyFilters() {
    setIsFilterOpen(false);
    pushProductsRoute({
      keyword: draftKeyword,
      barcode: draftBarcode,
      brand: draftBrand,
      product: initialProduct,
      category: draftCategories.join(","),
    });
  }

  function resetFilters() {
    setDraftKeyword("");
    setDraftBrand("");
    setDraftBarcode("");
    setDraftCategories([]);
    setKeywordInput("");
    setIsFilterOpen(false);
    router.push("/products");
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDraftKeyword(keywordInput);
    pushProductsRoute({
      keyword: keywordInput,
      barcode: initialBarcode,
      brand: initialBrand,
      product: initialProduct,
      category: initialCategory,
    });
  }

  function toggleCategory(id: string) {
    setDraftCategories((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  const selectedBrand = brands.find((brand) => brand.id === initialBrand);
  const selectedCategoryIds = initialCategory.split(",").map((item) => item.trim()).filter(Boolean);
  const selectedCategories = selectedCategoryIds
    .map((id) => categories.find((category) => category.id === id))
    .filter((category): category is Category => Boolean(category));
  const hasActiveFilters = Boolean(initialKeyword || initialBrand || initialBarcode || initialProduct || initialCategory);

  function removeFilter(filter: "keyword" | "brand" | "barcode" | "product" | "category", categoryId?: string) {
    const nextCategory =
      filter === "category" && categoryId
        ? selectedCategoryIds.filter((id) => id !== categoryId).join(",")
        : filter === "category"
          ? ""
          : initialCategory;

    if (filter === "keyword") {
      setKeywordInput("");
      setDraftKeyword("");
    }

    pushProductsRoute({
      keyword: filter === "keyword" ? "" : initialKeyword,
      barcode: filter === "barcode" ? "" : initialBarcode,
      brand: filter === "brand" ? "" : initialBrand,
      product: filter === "product" ? "" : initialProduct,
      category: nextCategory,
    });
  }

  function renderCategoryFilterNode(category: Category, depth = 0): React.ReactNode {
    const children = childrenByParent.get(category.id) || [];
    const isSelected = draftCategories.includes(category.id);

    return (
      <details key={category.id} className="products-category-node" open={depth === 0}>
        <summary>
          <span style={{ paddingInlineEnd: depth > 0 ? Math.min(depth * 12, 36) : undefined }}>
            {getCategoryLabel(category)}
          </span>
          <button
            type="button"
            className={`products-category-check ${isSelected ? "active" : ""}`}
            onClick={(event) => {
              event.preventDefault();
              toggleCategory(category.id);
            }}
          >
            {isSelected ? "\u2713" : "+"}
          </button>
        </summary>
        {children.length ? (
          <div className="products-category-children">
            {children.map((child) => renderCategoryFilterNode(child, depth + 1))}
          </div>
        ) : null}
      </details>
    );
  }

  return (
    <div className="products-page">
      <section className="card products-head-card">
        <form className="products-search-shell" onSubmit={submitSearch}>
          <button type="button" className="products-filter-trigger" aria-label="فتح التصفية" onClick={() => setIsFilterOpen(true)}>
            <FilterIcon size={22} color="#7e4a53" />
            {hasActiveFilters ? <span className="products-filter-dot" /> : null}
          </button>

          <div className="products-search-field">
            <SearchIcon size={18} color="#6d565b" />
            <input
              ref={inputRef}
              className="products-search-input-plain"
              placeholder="ابحث عن المنتجات..."
              value={keywordInput}
              onChange={(event) => setKeywordInput(event.target.value)}
            />
          </div>
        </form>
        {hasActiveFilters ? (
          <div className="products-active-filters" aria-label="الفلاتر المطبقة">
            {initialKeyword ? (
              <button type="button" className="products-chip products-filter-chip" onClick={() => removeFilter("keyword")}>
                <span>البحث: {initialKeyword}</span>
                <strong aria-hidden="true">×</strong>
              </button>
            ) : null}
            {initialBarcode ? (
              <button type="button" className="products-chip products-filter-chip" onClick={() => removeFilter("barcode")}>
                <span>الباركود: {initialBarcode}</span>
                <strong aria-hidden="true">×</strong>
              </button>
            ) : null}
            {selectedBrand ? (
              <button type="button" className="products-chip products-filter-chip" onClick={() => removeFilter("brand")}>
                <span>{getBrandLabel(selectedBrand)}</span>
                <strong aria-hidden="true">×</strong>
              </button>
            ) : null}
            {initialProduct ? (
              <button type="button" className="products-chip products-filter-chip" onClick={() => removeFilter("product")}>
                <span>منتج محدد</span>
                <strong aria-hidden="true">×</strong>
              </button>
            ) : null}
            {selectedCategories.map((category) => (
              <button key={category.id} type="button" className="products-chip products-filter-chip" onClick={() => removeFilter("category", category.id)}>
                <span>{getCategoryLabel(category)}</span>
                <strong aria-hidden="true">×</strong>
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <section className="products-grid-section">
        {!products.length ? <p className="muted products-empty">لم يتم العثور على منتجات.</p> : null}
        <div className="grid-products">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {loadError ? <p className="error products-load-state">{loadError}</p> : null}
        {hasMore ? (
          <div ref={sentinelRef} className="products-load-state" aria-hidden="true">
            {isLoadingMore ? "جاري تحميل المزيد..." : "مرر للأسفل لتحميل المزيد"}
          </div>
        ) : products.length ? (
          <p className="muted products-load-state">تم عرض جميع المنتجات.</p>
        ) : null}
      </section>

      {isFilterOpen ? (
        <div className="products-modal-overlay" onClick={() => setIsFilterOpen(false)}>
          <div className="products-modal products-modal-full" onClick={(event) => event.stopPropagation()}>
            <div className="products-modal-header products-modal-header-row">
              <h2>تصفية المنتجات</h2>
              <button type="button" className="products-modal-close" aria-label="إغلاق" onClick={() => setIsFilterOpen(false)}>
                <CloseIcon size={24} color="#1a1a1a" />
              </button>
            </div>

            <div className="products-modal-body">
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
                      {letter === BRAND_ALL_FILTER ? "الكل" : letter}
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
                    <p className="products-empty-state">لا توجد علامات تجارية لهذا الحرف.</p>
                  )}
                </div>
              </section>

              <section className="products-filter-section">
                <div className="products-section-head">
                  <h3>الفئات</h3>
                  <p>يمكن اختيار أكثر من فئة.</p>
                </div>
                <div className="products-category-tree">
                  {rootCategories.map((category) => {
                    const children = childrenByParent.get(category.id) || [];
                    return (
                      <details key={category.id} className="products-category-node">
                        <summary>
                          <span>{getCategoryLabel(category)}</span>
                          <button
                            type="button"
                            className={`products-category-check ${draftCategories.includes(category.id) ? "active" : ""}`}
                            onClick={(event) => {
                              event.preventDefault();
                              toggleCategory(category.id);
                            }}
                          >
                            {draftCategories.includes(category.id) ? "✓" : "+"}
                          </button>
                        </summary>
                        {children.length ? (
                          <div className="products-category-children">
                            {children.map((child) => renderCategoryFilterNode(child, 1))}
                          </div>
                        ) : null}
                      </details>
                    );
                  })}
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
