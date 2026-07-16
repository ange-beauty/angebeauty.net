import Link from "next/link";
import { fetchBrandsServer } from "@/lib/serverApi";
import { slugifyProductName } from "@/lib/productUrl";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function brandLabel(brand: { id: string; brand_name_ar: string; brand_name_en?: string }) {
  return brand.brand_name_ar || brand.brand_name_en || brand.id;
}

function firstLetter(brand: { id: string; brand_name_ar: string; brand_name_en?: string }) {
  const label = (brand.brand_name_en || brand.brand_name_ar || brand.id).trim();
  return (label[0] || "#").toUpperCase();
}

export const metadata = {
  title: "تسوق حسب الماركة | أنج بيوتي",
};

export default async function BrandsPage() {
  const brands = await fetchBrandsServer();
  const grouped = LETTERS.map((letter) => ({
    letter,
    brands: brands.filter((brand) => firstLetter(brand) === letter),
  })).filter((group) => group.brands.length > 0);

  return (
    <main className="brands-page">
      <h1 className="screen-title">تسوق حسب الماركة</h1>
      <div className="brand-alpha-rail" aria-label="أحرف العلامات التجارية">
        {LETTERS.map((letter) => (
          <a key={letter} href={`#brand-${letter}`}>
            {letter}
          </a>
        ))}
      </div>
      <div className="brands-groups">
        {grouped.map((group) => (
          <section key={group.letter} id={`brand-${group.letter}`} className="brands-group">
            <h2>{group.letter}</h2>
            <div className="brands-grid">
              {group.brands.map((brand) => {
                const label = brandLabel(brand);
                return (
                  <Link
                    key={brand.id}
                    href={`/products/brand/${encodeURIComponent(brand.id)}/${encodeURIComponent(slugifyProductName(label) || "brand")}`}
                    className="brand-card"
                  >
                    <span className="brand-logo-text">{label}</span>
                    <strong>{label}</strong>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
