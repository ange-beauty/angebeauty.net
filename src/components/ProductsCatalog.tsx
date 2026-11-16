"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import BrandsBrowser from "@/components/BrandsBrowser";
import CategorySelector from "@/components/CategorySelector";
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
  initialTag?: string;
  initialHasActiveOffer: boolean;
  initialNewStockArrivals: boolean;
  initialOfferIds: string;
  initialFocusSearch: boolean;
  brands: Brand[];
  categories: Category[];
};

function splitIds(value: string): string[] {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function getBrandLabel(brand: Brand): string {
  return brand.brand_name_ar || brand.brand_name_en || brand.id;
}

function getCategoryLabel(category: Category): string {
  return category.category_name_ar || category.category_name_en || category.id;
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
  initialTag = "",
  initialHasActiveOffer,
  initialNewStockArrivals,
  initialOfferIds,
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
  const [draftBrands, setDraftBrands] = useState<string[]>(splitIds(initialBrand));
  const [filterTab, setFilterTab] = useState<"brands" | "categories" | "general">("brands");
  const [draftBarcode, setDraftBarcode] = useState(initialBarcode);
  const [draftCategories, setDraftCategories] = useState<string[]>(
    initialCategory.split(",").map((item) => item.trim()).filter(Boolean),
  );
  const [draftHasActiveOffer, setDraftHasActiveOffer] = useState(initialHasActiveOffer);
  const [draftNewStockArrivals, setDraftNewStockArrivals] = useState(initialNewStockArrivals);

  useEffect(() => {
    setProducts(initialProducts);
    setPage(1);
    setHasMore(initialHasMore);
    setIsLoadingMore(false);
    setLoadError("");
    setKeywordInput(initialKeyword);
    setDraftKeyword(initialKeyword);
    setDraftBrands(splitIds(initialBrand));
    setDraftBarcode(initialBarcode);
    setDraftCategories(initialCategory.split(",").map((item) => item.trim()).filter(Boolean));
    setDraftHasActiveOffer(initialHasActiveOffer);
    setDraftNewStockArrivals(initialNewStockArrivals);
  }, [initialBarcode, initialBrand, initialCategory, initialHasActiveOffer, initialHasMore, initialKeyword, initialNewStockArrivals, initialProducts, initialTag]);

  useEffect(() => {
    if (initialFocusSearch) {
      inputRef.current?.focus();
    }
  }, [initialFocusSearch]);

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
        tag: initialTag || undefined,
        hasActiveOffer: initialHasActiveOffer || undefined,
        newStockArrivals: initialNewStockArrivals || undefined,
        offerIds: initialOfferIds || undefined,
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
  }, [initialBarcode, initialBrand, initialCategory, initialHasActiveOffer, initialKeyword, initialNewStockArrivals, initialOfferIds, initialProduct, initialTag, isLoadingMore, page]);

  function pushProductsRoute(next: {
    keyword?: string;
    barcode?: string;
    brand?: string;
    product?: string;
    category?: string;
    tag?: string;
    hasActiveOffer?: boolean;
    newStockArrivals?: boolean;
    offerIds?: string;
  }) {
    const query = new URLSearchParams();
    if (next.keyword?.trim()) query.set("keyword", next.keyword.trim());
    if (next.barcode?.trim()) query.set("barcode", next.barcode.trim());
    if (next.product?.trim()) query.set("product", next.product.trim());
    if (next.category?.trim()) query.set("category", next.category.trim());
    if (next.tag?.trim()) query.set("tag", next.tag.trim());
    if (next.hasActiveOffer) query.set("hasActiveOffer", "true");
    if (next.newStockArrivals) query.set("newStockArrivals", "true");
    if (next.offerIds?.trim()) query.set("offerIds", next.offerIds.trim());

    // One brand keeps its pretty /products/brand/... path; several go in the ?brand= list the API already accepts.
    const brandIds = splitIds(next.brand || "");
    const selectedBrand = brandIds.length === 1 ? brands.find((brand) => brand.id === brandIds[0]) : undefined;
    if (brandIds.length > 1) query.set("brand", brandIds.join(","));
    const basePath = selectedBrand ? brandFilterPath(selectedBrand) : "/products";
    router.push(query.toString() ? `${basePath}?${query.toString()}` : basePath);
  }

  function applyFilters() {
    setIsFilterOpen(false);
    pushProductsRoute({
      keyword: draftKeyword,
      barcode: draftBarcode,
      brand: draftBrands.join(","),
      product: initialProduct,
      category: draftCategories.join(","),
      tag: initialTag,
      hasActiveOffer: draftHasActiveOffer,
      newStockArrivals: draftNewStockArrivals,
      offerIds: draftHasActiveOffer ? initialOfferIds : "",
    });
  }

  function resetFilters() {
    setDraftKeyword("");
    setDraftBrands([]);
    setDraftBarcode("");
    setDraftCategories([]);
    setDraftHasActiveOffer(false);
    setDraftNewStockArrivals(false);
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
      tag: initialTag,
      hasActiveOffer: initialHasActiveOffer,
      newStockArrivals: initialNewStockArrivals,
      offerIds: initialOfferIds,
    });
  }

  function toggleBrand(id: string) {
    setDraftBrands((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toggleCategory(id: string) {
    setDraftCategories((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  const selectedBrandIds = splitIds(initialBrand);
  const selectedBrands = selectedBrandIds
    .map((id) => brands.find((brand) => brand.id === id))
    .filter((brand): brand is Brand => Boolean(brand));
  const selectedCategoryIds = initialCategory.split(",").map((item) => item.trim()).filter(Boolean);
  const selectedCategories = selectedCategoryIds
    .map((id) => categories.find((category) => category.id === id))
    .filter((category): category is Category => Boolean(category));
  const hasActiveFilters = Boolean(initialKeyword || initialBrand || initialBarcode || initialProduct || initialCategory || initialTag || initialHasActiveOffer || initialNewStockArrivals);

  function removeFilter(filter: "keyword" | "brand" | "barcode" | "product" | "category" | "tag" | "offer" | "newStock", itemId?: string) {
    const nextCategory =
      filter === "category" && itemId
        ? selectedCategoryIds.filter((id) => id !== itemId).join(",")
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
      brand: filter === "brand" ? (itemId ? selectedBrandIds.filter((id) => id !== itemId).join(",") : "") : initialBrand,
      product: filter === "product" ? "" : initialProduct,
      category: nextCategory,
      tag: filter === "tag" ? "" : initialTag,
      hasActiveOffer: filter === "offer" ? false : initialHasActiveOffer,
      newStockArrivals: filter === "newStock" ? false : initialNewStockArrivals,
      offerIds: filter === "offer" ? "" : initialOfferIds,
    });
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
            {/* Several brands or categories collapse into one chip each, so the bar stays one line; the label opens that tab. */}
            {selectedBrands.length ? (
              <span className="products-chip products-filter-chip">
                <button type="button" className="products-chip-open" onClick={() => { setFilterTab("brands"); setIsFilterOpen(true); }}>
                  {selectedBrands.length === 1 ? getBrandLabel(selectedBrands[0]) : `${selectedBrands.length} علامات تجارية`}
                </button>
                <button type="button" className="products-chip-clear" aria-label="مسح العلامات التجارية" onClick={() => removeFilter("brand")}>×</button>
              </span>
            ) : null}
            {initialProduct ? (
              <button type="button" className="products-chip products-filter-chip" onClick={() => removeFilter("product")}>
                <span>منتج محدد</span>
                <strong aria-hidden="true">×</strong>
              </button>
            ) : null}
            {initialTag ? (
              <button type="button" className="products-chip products-filter-chip" onClick={() => removeFilter("tag")}>
                <span>{'\u0648\u0633\u0645'}</span>
                <strong aria-hidden="true">×</strong>
              </button>
            ) : null}
            {initialHasActiveOffer ? (
              <button type="button" className="products-chip products-filter-chip" onClick={() => removeFilter("offer")}>
                <span>{initialOfferIds ? "عروض محددة" : "منتجات عليها عروض"}</span>
                <strong aria-hidden="true">×</strong>
              </button>
            ) : null}
            {initialNewStockArrivals ? (
              <button type="button" className="products-chip products-filter-chip" onClick={() => removeFilter("newStock")}>
                <span>{"\u0648\u0635\u0644 \u062d\u062f\u064a\u062b\u0627\u064b"}</span>
                <strong aria-hidden="true">{"\u00d7"}</strong>
              </button>
            ) : null}
            {selectedCategories.length ? (
              <span className="products-chip products-filter-chip">
                <button type="button" className="products-chip-open" onClick={() => { setFilterTab("categories"); setIsFilterOpen(true); }}>
                  {selectedCategories.length === 1 ? getCategoryLabel(selectedCategories[0]) : `${selectedCategories.length} فئات`}
                </button>
                <button type="button" className="products-chip-clear" aria-label="مسح الفئات" onClick={() => removeFilter("category")}>×</button>
              </span>
            ) : null}
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

            <div className="products-filter-tabs" role="tablist">
              {([
                ["brands", "العلامات التجارية"],
                ["categories", "الفئات"],
                ["general", "عام"],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={filterTab === key}
                  className={`products-filter-tab ${filterTab === key ? "active" : ""}`}
                  onClick={() => setFilterTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {filterTab === "brands" ? (
              <div className="products-modal-body">
                <BrandsBrowser embedded brands={brands} selectedIds={draftBrands} onToggle={toggleBrand} />
              </div>
            ) : null}
            {filterTab === "categories" ? (
              <div className="products-modal-body products-modal-body-flush">
                <CategorySelector
                  embedded
                  categories={categories}
                  onClose={() => setIsFilterOpen(false)}
                  onApply={(ids) => {
                    setIsFilterOpen(false);
                    pushProductsRoute({
                      keyword: draftKeyword,
                      barcode: draftBarcode,
                      brand: draftBrands.join(","),
                      product: initialProduct,
                      category: ids.join(","),
                      tag: initialTag,
                      hasActiveOffer: draftHasActiveOffer,
                      newStockArrivals: draftNewStockArrivals,
                      offerIds: draftHasActiveOffer ? initialOfferIds : "",
                    });
                  }}
                />
              </div>
            ) : null}
            {filterTab === "general" ? (
              <div className="products-modal-body">
              <section className="products-filter-section">
                <div className="products-section-head">
                  <h3>{"\u0627\u0644\u0645\u062e\u0632\u0648\u0646"}</h3>
                </div>
                <label className="products-offer-filter">
                  <input
                    type="checkbox"
                    checked={draftNewStockArrivals}
                    onChange={(event) => setDraftNewStockArrivals(event.target.checked)}
                  />
                  <span>{"\u0645\u0646\u062a\u062c\u0627\u062a \u0648\u0635\u0644\u062a \u062e\u0644\u0627\u0644 \u0622\u062e\u0631 14 \u064a\u0648\u0645\u0627\u064b"}</span>
                </label>
              </section>
              <section className="products-filter-section">
                <div className="products-section-head">
                  <h3>العروض</h3>
                </div>
                <label className="products-offer-filter">
                  <input
                    type="checkbox"
                    checked={draftHasActiveOffer}
                    onChange={(event) => setDraftHasActiveOffer(event.target.checked)}
                  />
                  <span>المنتجات المشمولة بعرض فعال</span>
                </label>
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

              </div>
            ) : null}

            {filterTab !== "categories" ? (
              <div className="products-modal-footer products-modal-footer-actions">
                <button type="button" className="button secondary products-modal-action" onClick={resetFilters}>
                  مسح الكل
                </button>
                <button type="button" className="button primary products-modal-action products-modal-action-dark" onClick={applyFilters}>
                  تطبيق
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
