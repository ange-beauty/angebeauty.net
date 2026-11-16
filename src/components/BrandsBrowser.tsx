"use client";

import Link from "next/link";

import { slugifyProductName } from "@/lib/productUrl";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export type BrowserBrand = { id: string; brand_name_ar: string; brand_name_en?: string; icon?: string | null; aggregate_version?: number };

function brandLabel(brand: BrowserBrand) {
  return brand.brand_name_ar || brand.brand_name_en || brand.id;
}

function firstLetter(brand: BrowserBrand) {
  const label = (brand.brand_name_en || brand.brand_name_ar || brand.id).trim();
  return (label[0] || "#").toUpperCase();
}

function brandIconUrl(brand: BrowserBrand) {
  if (!brand.icon) return "";
  const root = process.env.NEXT_PUBLIC_ROOT_DIR || "angeapi";
  return `https://images.angebeauty.net/${root}/cdn/images/${brand.id}/${brand.icon}?v=${brand.aggregate_version || 1}`;
}

/**
 * The brands screen body. On /brands each card links to the brand's products; inside the products filter
 * (embedded) cards toggle `onToggle` so several brands can be picked.
 */
export default function BrandsBrowser({
  brands,
  embedded = false,
  selectedIds = [],
  onToggle,
}: {
  brands: BrowserBrand[];
  embedded?: boolean;
  selectedIds?: string[];
  onToggle?: (brandId: string) => void;
}) {
  const idPrefix = embedded ? "filter-brand-" : "brand-";
  const grouped = LETTERS.map((letter) => ({
    letter,
    brands: brands.filter((brand) => firstLetter(brand) === letter),
  })).filter((group) => group.brands.length > 0);

  return (
    <>
      <div className={`brand-alpha-rail ${embedded ? "embedded" : ""}`} aria-label="أحرف العلامات التجارية">
        {LETTERS.map((letter) => (
          <a
            key={letter}
            href={`#${idPrefix}${letter}`}
            onClick={
              embedded
                ? (event) => {
                    event.preventDefault();
                    document.getElementById(`${idPrefix}${letter}`)?.scrollIntoView({ block: "start" });
                  }
                : undefined
            }
          >
            {letter}
          </a>
        ))}
      </div>
      <div className="brands-groups">
        {grouped.map((group) => (
          <section key={group.letter} id={`${idPrefix}${group.letter}`} className="brands-group">
            <h2>{group.letter}</h2>
            <div className="brands-grid">
              {group.brands.map((brand) => {
                const label = brandLabel(brand);
                const iconUrl = brandIconUrl(brand);
                const content = (
                  <>
                    <span className="brand-logo-text">{iconUrl ? <img src={iconUrl} alt="" /> : label}</span>
                    <strong>{label}</strong>
                  </>
                );
                return onToggle ? (
                  <button
                    key={brand.id}
                    type="button"
                    aria-pressed={selectedIds.includes(brand.id)}
                    className={`brand-card ${selectedIds.includes(brand.id) ? "selected" : ""}`}
                    onClick={() => onToggle(brand.id)}
                  >
                    {content}
                  </button>
                ) : (
                  <Link
                    key={brand.id}
                    href={`/products/brand/${encodeURIComponent(brand.id)}/${encodeURIComponent(slugifyProductName(label) || "brand")}`}
                    className="brand-card"
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
