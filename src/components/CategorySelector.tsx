"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { CloseIcon, SearchIcon } from "@/components/Icons";
import type { PublicCategory } from "@/lib/serverApi";

type CategoryNode = {
  category: PublicCategory;
  children: CategoryNode[];
};

function categoryLabel(category: PublicCategory) {
  return category.category_name_ar || category.category_name_en || category.id;
}

function sortNodes(nodes: CategoryNode[]) {
  nodes.sort((a, b) => categoryLabel(a.category).localeCompare(categoryLabel(b.category), "ar"));
  nodes.forEach((node) => sortNodes(node.children));
  return nodes;
}

function buildTree(categories: PublicCategory[]) {
  const nodes = new Map<string, CategoryNode>();
  categories.forEach((category) => nodes.set(category.id, { category, children: [] }));

  const roots: CategoryNode[] = [];
  nodes.forEach((node) => {
    const parent = node.category.parent_category ? nodes.get(node.category.parent_category) : undefined;
    if (parent && parent.category.id !== node.category.id) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return sortNodes(roots);
}

export default function CategorySelector({ categories }: { categories: PublicCategory[] }) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const tree = useMemo(() => buildTree(categories), [categories]);
  const categoryById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );
  const childIdsByParent = useMemo(() => {
    const children = new Map<string, string[]>();
    categories.forEach((category) => {
      if (!category.parent_category) return;
      const ids = children.get(category.parent_category) || [];
      ids.push(category.id);
      children.set(category.parent_category, ids);
    });
    return children;
  }, [categories]);

  const visibleRoots = tree.length === 1 && tree[0].children.length ? tree[0].children : tree;

  const toggleCategory = (categoryId: string) => {
    setSelectedIds((current) => {
      if (current.includes(categoryId)) return current.filter((id) => id !== categoryId);

      const conflictingIds = new Set<string>();
      let parentId = categoryById.get(categoryId)?.parent_category;
      while (parentId) {
        conflictingIds.add(parentId);
        parentId = categoryById.get(parentId)?.parent_category;
      }

      const descendants = [...(childIdsByParent.get(categoryId) || [])];
      while (descendants.length) {
        const descendantId = descendants.pop();
        if (!descendantId) continue;
        conflictingIds.add(descendantId);
        descendants.push(...(childIdsByParent.get(descendantId) || []));
      }

      return [...current.filter((id) => !conflictingIds.has(id)), categoryId];
    });
  };

  const showProducts = () => {
    const query = new URLSearchParams();
    if (selectedIds.length) query.set("category", selectedIds.join(","));
    router.push(query.size ? `/products?${query.toString()}` : "/products");
  };

  const renderNode = (node: CategoryNode, isRoot = false) => {
    const isSelected = selectedIds.includes(node.category.id);
    return (
      <section key={node.category.id} className={isRoot ? "category-tree-group" : "category-subtree"}>
        <button
          type="button"
          className={`${isRoot ? "category-parent-card" : "category-child-card"}${isSelected ? " selected" : ""}`}
          onClick={() => toggleCategory(node.category.id)}
          role="checkbox"
          aria-checked={isSelected}
        >
          <span>{categoryLabel(node.category)}</span>
          <span className="category-select-indicator" aria-hidden="true">{isSelected ? "\u2713" : ""}</span>
        </button>
        {node.children.length ? (
          <div className={isRoot ? "category-child-grid" : "category-descendant-list"}>
            {node.children.map((child) => renderNode(child))}
          </div>
        ) : null}
      </section>
    );
  };

  return (
    <>
      <header className="categories-page-header">
        <h1 className="screen-title">{"\u0627\u0644\u062a\u0635\u0646\u064a\u0641\u0627\u062a"}</h1>
        <p>{"\u0627\u062e\u062a\u0631 \u062a\u0635\u0646\u064a\u0641\u0627\u064b \u0623\u0648 \u0623\u0643\u062b\u0631 \u0644\u0639\u0631\u0636 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a"}</p>
      </header>

      <div className="categories-selection-bar">
        <div className="categories-selection-status">
          <strong>{"\u0627\u062e\u062a\u064a\u0627\u0631\u0627\u062a\u0643"}</strong>
          <span>
            {selectedIds.length
              ? `${selectedIds.length.toLocaleString("ar-IQ")} \u062a\u0635\u0646\u064a\u0641\u0627\u062a \u0645\u062d\u062f\u062f\u0629`
              : "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u062a\u062d\u062f\u064a\u062f"}
          </span>
        </div>
        <div className="categories-selection-actions">
          {selectedIds.length ? (
            <button
              type="button"
              className="categories-clear-button"
              onClick={() => setSelectedIds([])}
              aria-label="\u0625\u0644\u063a\u0627\u0621 \u0643\u0644 \u0627\u0644\u0627\u062e\u062a\u064a\u0627\u0631\u0627\u062a"
            >
              <CloseIcon size={19} />
            </button>
          ) : null}
          <button type="button" className="categories-apply-button" onClick={showProducts}>
            <SearchIcon size={18} />
            <span>{"\u0639\u0631\u0636 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a"}</span>
          </button>
        </div>
      </div>

      <div className="categories-tree-page">
        {!visibleRoots.length ? (
          <p className="muted categories-empty">
            {"\u0644\u0627 \u062a\u0648\u062c\u062f \u062a\u0635\u0646\u064a\u0641\u0627\u062a \u0645\u062a\u0627\u062d\u0629 \u062d\u0627\u0644\u064a\u0627\u064b."}
          </p>
        ) : null}
        {visibleRoots.map((root) => renderNode(root, true))}
      </div>
    </>
  );
}
