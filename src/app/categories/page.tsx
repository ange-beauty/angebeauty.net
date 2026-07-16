import Link from "next/link";
import { fetchCategoriesServer, type PublicCategory } from "@/lib/serverApi";

function categoryLabel(category: PublicCategory) {
  return category.category_name_ar || category.category_name_en || category.id;
}

function sortCategories(categories: PublicCategory[]) {
  return [...categories].sort((a, b) => categoryLabel(a).localeCompare(categoryLabel(b), "ar"));
}

function renderCategoryBranch(
  category: PublicCategory,
  childrenByParent: Map<string, PublicCategory[]>,
  depth = 0,
) {
  const children = sortCategories(childrenByParent.get(category.id) || []);
  const isRoot = depth === 0;

  return (
    <section key={category.id} className={isRoot ? "category-tree-group" : "category-subtree"}>
      <Link
        href={`/products?category=${encodeURIComponent(category.id)}`}
        className={isRoot ? "category-parent-card" : "category-child-card"}
        style={{ marginInlineEnd: depth > 1 ? Math.min((depth - 1) * 16, 48) : undefined }}
      >
        {categoryLabel(category)}
      </Link>
      {children.length ? (
        <div className={isRoot ? "category-child-grid" : "category-descendant-list"}>
          {children.map((child) => renderCategoryBranch(child, childrenByParent, depth + 1))}
        </div>
      ) : null}
    </section>
  );
}

export const metadata = {
  title: "الفئات | أنج بيوتي",
};

export default async function CategoriesPage() {
  const categories = await fetchCategoriesServer();
  const categoryIds = new Set(categories.map((category) => category.id));
  const roots = sortCategories(
    categories.filter((category) => !category.parent_category || !categoryIds.has(category.parent_category)),
  );
  const childrenByParent = new Map<string, PublicCategory[]>();

  categories.forEach((category) => {
    if (!category.parent_category || !categoryIds.has(category.parent_category)) return;
    const current = childrenByParent.get(category.parent_category) || [];
    current.push(category);
    childrenByParent.set(category.parent_category, current);
  });

  return (
    <main className="categories-page">
      <h1 className="screen-title">تسوق حسب الفئة</h1>
      <div className="categories-tree-page">
        {!roots.length ? <p className="muted categories-empty">لا توجد فئات متاحة حالياً.</p> : null}
        {roots.map((root) => renderCategoryBranch(root, childrenByParent))}
      </div>
    </main>
  );
}
