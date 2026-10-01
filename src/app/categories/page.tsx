import CategorySelector from "@/components/CategorySelector";
import { fetchCategoriesServer } from "@/lib/serverApi";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "\u062a\u0635\u0646\u064a\u0641\u0627\u062a | \u0623\u0646\u062c \u0628\u064a\u0648\u062a\u064a",
  description: "\u062a\u0635\u0641\u062d \u062a\u0635\u0646\u064a\u0641\u0627\u062a \u0645\u0646\u062a\u062c\u0627\u062a \u0623\u0646\u062c \u0628\u064a\u0648\u062a\u064a \u0648\u0627\u062e\u062a\u0631 \u0627\u0644\u0641\u0626\u0629 \u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0629 \u0644\u0643.",
  path: "/categories",
});

export default async function CategoriesPage() {
  const categories = await fetchCategoriesServer();

  return (
    <main className="categories-page">
      <CategorySelector categories={categories} />
    </main>
  );
}
