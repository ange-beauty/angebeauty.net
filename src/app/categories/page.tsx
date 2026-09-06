import CategorySelector from "@/components/CategorySelector";
import { fetchCategoriesServer } from "@/lib/serverApi";

export const metadata = {
  title: "\u062a\u0635\u0646\u064a\u0641\u0627\u062a | \u0623\u0646\u062c \u0628\u064a\u0648\u062a\u064a",
};

export default async function CategoriesPage() {
  const categories = await fetchCategoriesServer();

  return (
    <main className="categories-page">
      <CategorySelector categories={categories} />
    </main>
  );
}
