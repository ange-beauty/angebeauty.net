"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { CloseIcon, SearchIcon } from "@/components/Icons";
import type { PublicCategory } from "@/lib/serverApi";

type CategoryNode = {
  id: string;
  label: string;
  parent: CategoryNode | null;
  children: CategoryNode[];
  /** Ids of every leaf category under this node (the node itself when it is a leaf). */
  leafIds: string[];
  /** Full path of ancestor labels, e.g. "العناية بالشعر › الشامبو". */
  pathLabel: string;
};

type CheckState = "none" | "some" | "all";

function categoryLabel(category: PublicCategory) {
  return category.category_name_ar || category.category_name_en || category.id;
}

function formatNumber(value: number) {
  return value.toLocaleString("ar-IQ");
}

function sectionsLabel(count: number) {
  if (count === 1) return "قسم واحد";
  if (count === 2) return "قسمان";
  if (count <= 10) return `${formatNumber(count)} أقسام`;
  return `${formatNumber(count)} قسماً`;
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .trim();
}

function buildModel(categories: PublicCategory[]) {
  const byId = new Map<string, CategoryNode>();
  categories.forEach((category) =>
    byId.set(category.id, {
      id: category.id,
      label: categoryLabel(category),
      parent: null,
      children: [],
      leafIds: [],
      pathLabel: "",
    }),
  );

  const roots: CategoryNode[] = [];
  categories.forEach((category) => {
    const node = byId.get(category.id)!;
    const parent = category.parent_category ? byId.get(category.parent_category) : undefined;
    if (parent && parent !== node) {
      node.parent = parent;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortNodes = (nodes: CategoryNode[]) => {
    nodes.sort((a, b) => a.label.localeCompare(b.label, "ar"));
    nodes.forEach((node) => sortNodes(node.children));
  };
  sortNodes(roots);

  const visited = new Set<string>();
  const finalize = (node: CategoryNode, trail: string[]) => {
    if (visited.has(node.id)) return;
    visited.add(node.id);
    node.pathLabel = trail.join(" › ");
    if (!node.children.length) {
      node.leafIds = [node.id];
      return;
    }
    node.children.forEach((child) => {
      finalize(child, [...trail, child.label]);
      node.leafIds.push(...child.leafIds);
    });
  };
  roots.forEach((root) => finalize(root, [root.label]));

  // The catalog usually has one generic wrapper root: use its children as the main column.
  const rootsWithChildren = roots.filter((root) => root.children.length);
  let mains = roots;
  if (rootsWithChildren.length === 1) {
    const wrapper = rootsWithChildren[0];
    mains = [...wrapper.children, ...roots.filter((root) => root !== wrapper)];
  }
  const mainSet = new Set(mains.map((node) => node.id));
  // Search paths should not include the hidden wrapper.
  byId.forEach((node) => {
    const parts: string[] = [];
    for (let current: CategoryNode | null = node; current; current = current.parent) {
      parts.unshift(current.label);
      if (mainSet.has(current.id)) break;
    }
    node.pathLabel = parts.join(" › ");
  });

  const allNodes = Array.from(byId.values()).filter((node) => {
    for (let current: CategoryNode | null = node; current; current = current.parent) {
      if (mainSet.has(current.id)) return true;
    }
    return false;
  });

  return { byId, mains, allNodes };
}

export default function CategorySelector({ categories }: { categories: PublicCategory[] }) {
  const router = useRouter();
  const model = useMemo(() => buildModel(categories), [categories]);
  const { mains, allNodes } = model;

  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [activeMainId, setActiveMainId] = useState<string | null>(null);
  const [drillPath, setDrillPath] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const activeMain = mains.find((node) => node.id === activeMainId) || mains[0] || null;
  const currentNode = drillPath.length ? model.byId.get(drillPath[drillPath.length - 1]) || activeMain : activeMain;

  const stateOf = (node: CategoryNode): CheckState => {
    if (!node.leafIds.length) return "none";
    let count = 0;
    for (const id of node.leafIds) if (selected.has(id)) count += 1;
    if (count === 0) return "none";
    return count === node.leafIds.length ? "all" : "some";
  };
  const selectedCountIn = (node: CategoryNode) => node.leafIds.reduce((sum, id) => sum + (selected.has(id) ? 1 : 0), 0);

  const toggleNode = (node: CategoryNode) => {
    setSelected((current) => {
      const next = new Set(current);
      const allSelected = node.leafIds.every((id) => next.has(id));
      node.leafIds.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  };

  const selectedCount = selected.size;

  // Chips: the highest fully-selected branches, plus selected leaves under partly selected parents.
  const chips = useMemo(() => {
    const result: CategoryNode[] = [];
    const walk = (node: CategoryNode) => {
      if (!node.leafIds.length) return;
      const count = node.leafIds.filter((id) => selected.has(id)).length;
      if (count === 0) return;
      if (count === node.leafIds.length) {
        result.push(node);
        return;
      }
      node.children.forEach(walk);
    };
    mains.forEach(walk);
    return result;
  }, [mains, selected]);

  const selectMain = (node: CategoryNode) => {
    setActiveMainId(node.id);
    setDrillPath([]);
  };

  const openNode = (node: CategoryNode) => {
    const chain: CategoryNode[] = [];
    for (let current: CategoryNode | null = node; current; current = current.parent) {
      chain.unshift(current);
      if (mains.some((main) => main.id === current!.id)) break;
    }
    setActiveMainId(chain[0].id);
    setDrillPath(chain.slice(1).map((item) => item.id));
    setQuery("");
  };

  const goBack = () => setDrillPath((current) => current.slice(0, -1));

  const showProducts = () => {
    // The products API does not expand a parent category to its descendants, so send every
    // selected leaf plus each fully selected parent branch (products can be attached to either).
    const ids = new Set<string>(selected);
    allNodes.forEach((node) => {
      if (node.children.length && node.leafIds.length && node.leafIds.every((id) => selected.has(id))) ids.add(node.id);
    });
    const params = new URLSearchParams();
    if (ids.size) params.set("category", Array.from(ids).join(","));
    router.push(params.size ? `/products?${params.toString()}` : "/products");
  };

  const normalizedQuery = normalize(query);
  const searchResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return allNodes
      .filter((node) => normalize(node.label).includes(normalizedQuery))
      .slice(0, 60);
  }, [allNodes, normalizedQuery]);

  const checkbox = (node: CategoryNode, state: CheckState) => (
    <button
      type="button"
      role="checkbox"
      aria-checked={state === "all" ? true : state === "some" ? "mixed" : false}
      aria-label={node.label}
      className={`cs-check cs-check-${state}`}
      onClick={() => toggleNode(node)}
    >
      <span aria-hidden="true" className="cs-check-mark">
        {state === "all" ? "✓" : state === "some" ? "−" : ""}
      </span>
    </button>
  );

  const renderRow = (node: CategoryNode, showPath: boolean) => {
    const state = stateOf(node);
    const hasChildren = node.children.length > 0;
    const count = selectedCountIn(node);
    let sub = "";
    if (state === "some") sub = `محدد ${formatNumber(count)} من ${formatNumber(node.leafIds.length)}`;
    else if (hasChildren) sub = sectionsLabel(node.children.length);
    return (
      <li key={node.id} className={`cs-row${state !== "none" ? " is-selected" : ""}`}>
        {checkbox(node, state)}
        <button
          type="button"
          className="cs-row-text"
          onClick={() => (hasChildren && !showPath ? setDrillPath((current) => [...current, node.id]) : toggleNode(node))}
          tabIndex={-1}
          aria-hidden="true"
        >
          <span className="cs-row-name">{node.label}</span>
          {showPath && node.parent ? (
            <span className="cs-row-sub">{node.pathLabel}</span>
          ) : sub ? (
            <span className={`cs-row-sub${state === "some" ? " is-partial" : ""}`}>{sub}</span>
          ) : null}
        </button>
        {hasChildren ? (
          <button
            type="button"
            className="cs-open"
            onClick={() => openNode(node)}
            aria-label={`فتح أقسام ${node.label}`}
          >
            <span aria-hidden="true">{"‹"}</span>
          </button>
        ) : null}
      </li>
    );
  };

  const breadcrumb: CategoryNode[] = [];
  if (activeMain) {
    breadcrumb.push(activeMain);
    drillPath.forEach((id) => {
      const node = model.byId.get(id);
      if (node) breadcrumb.push(node);
    });
  }

  const isSearching = Boolean(normalizedQuery);

  return (
    <div className="cs-root" dir="rtl">
      <header className="cs-header">
        <button type="button" className="cs-close" onClick={() => router.back()} aria-label="إغلاق">
          <CloseIcon size={22} />
        </button>
        <h1 className="cs-title">التصنيفات</h1>
        <button type="button" className="cs-clear-all" onClick={() => setSelected(new Set())} disabled={!selectedCount}>
          مسح الكل
        </button>
      </header>

      <div className="cs-search">
        <SearchIcon size={18} />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ابحث في كل المستويات..."
          aria-label="ابحث في التصنيفات"
        />
        {query ? (
          <button type="button" className="cs-search-clear" onClick={() => setQuery("")} aria-label="مسح البحث">
            <CloseIcon size={16} />
          </button>
        ) : null}
      </div>

      {chips.length ? (
        <ul className="cs-chips" aria-label="التصنيفات المحددة">
          {chips.map((chip) => (
            <li key={chip.id}>
              <button
                type="button"
                className="cs-chip"
                onClick={() =>
                  setSelected((current) => {
                    const next = new Set(current);
                    chip.leafIds.forEach((id) => next.delete(id));
                    return next;
                  })
                }
                aria-label={`إزالة ${chip.label}`}
              >
                <span>{chip.label}</span>
                <CloseIcon size={13} strokeWidth={2.4} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {!mains.length ? (
        <p className="cs-empty">لا توجد تصنيفات متاحة حالياً.</p>
      ) : (
        <div className="cs-body">
          <div className="cs-pane">
            {isSearching ? (
              <>
                <div className="cs-pane-head">
                  <span className="cs-crumb-current">
                    {searchResults.length ? `نتائج البحث (${formatNumber(searchResults.length)})` : "نتائج البحث"}
                  </span>
                </div>
                {searchResults.length ? (
                  <ul className="cs-list">{searchResults.map((node) => renderRow(node, true))}</ul>
                ) : (
                  <p className="cs-empty">لا توجد نتائج مطابقة.</p>
                )}
              </>
            ) : currentNode ? (
              <>
                <div className="cs-pane-head">
                  {drillPath.length ? (
                    <button type="button" className="cs-back" onClick={goBack} aria-label="رجوع">
                      <span aria-hidden="true">{"›"}</span>
                    </button>
                  ) : null}
                  <nav className="cs-crumbs" aria-label="المسار">
                    {breadcrumb.map((node, index) => {
                      const isLast = index === breadcrumb.length - 1;
                      return (
                        <span key={node.id} className="cs-crumb-item">
                          {index > 0 ? <span className="cs-crumb-sep" aria-hidden="true">{"‹"}</span> : null}
                          {isLast ? (
                            <span className="cs-crumb-current" aria-current="page">{node.label}</span>
                          ) : (
                            <button type="button" className="cs-crumb" onClick={() => setDrillPath(drillPath.slice(0, index))}>
                              {node.label}
                            </button>
                          )}
                        </span>
                      );
                    })}
                  </nav>
                </div>
                <ul className="cs-list">
                  {currentNode.children.length ? (
                    <li className={`cs-row cs-row-all${stateOf(currentNode) !== "none" ? " is-selected" : ""}`}>
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={
                          stateOf(currentNode) === "all" ? true : stateOf(currentNode) === "some" ? "mixed" : false
                        }
                        className={`cs-check cs-check-${stateOf(currentNode)}`}
                        onClick={() => toggleNode(currentNode)}
                        aria-label={`تحديد الكل في ${currentNode.label}`}
                      >
                        <span aria-hidden="true" className="cs-check-mark">
                          {stateOf(currentNode) === "all" ? "✓" : stateOf(currentNode) === "some" ? "−" : ""}
                        </span>
                      </button>
                      <span className="cs-row-text">
                        <span className="cs-row-name">تحديد الكل</span>
                        {stateOf(currentNode) === "some" ? (
                          <span className="cs-row-sub is-partial">
                            {`محدد ${formatNumber(selectedCountIn(currentNode))} من ${formatNumber(currentNode.leafIds.length)}`}
                          </span>
                        ) : null}
                      </span>
                    </li>
                  ) : (
                    renderRow(currentNode, false)
                  )}
                  {currentNode.children.map((child) => renderRow(child, false))}
                </ul>
              </>
            ) : null}
          </div>

          <ul className="cs-mains" aria-label="التصنيفات الرئيسية">
            {mains.map((node) => {
              const count = selectedCountIn(node);
              const isActive = !isSearching && activeMain?.id === node.id;
              return (
                <li key={node.id}>
                  <button
                    type="button"
                    className={`cs-main${isActive ? " is-active" : ""}`}
                    onClick={() => {
                      selectMain(node);
                      setQuery("");
                    }}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <span>{node.label}</span>
                    {count ? (
                      <span className="cs-badge" aria-label={`${formatNumber(count)} محدد`}>
                        {formatNumber(count)}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="cs-bar">
        <button type="button" className="cs-bar-clear" onClick={() => setSelected(new Set())} disabled={!selectedCount}>
          مسح
        </button>
        <button type="button" className="cs-bar-apply" onClick={showProducts}>
          <span>{selectedCount ? "عرض النتائج" : "عرض كل المنتجات"}</span>
          {selectedCount ? <span className="cs-bar-count">{`${formatNumber(selectedCount)} تصنيفات`}</span> : null}
        </button>
      </div>
    </div>
  );
}
