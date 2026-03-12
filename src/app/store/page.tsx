"use client";

import { useSellingPoint } from "@/contexts/SellingPointContext";

export default function StorePage() {
  const { sellingPoints, selectedSellingPoint, setSelectedSellingPointId, isLoadingSellingPoints } = useSellingPoint();

  return (
    <section className="store-page">
      <header className="store-header">
        <h1 className="page-title">المتجر</h1>
        <p className="muted">اختر نقطة البيع للعرض الصحيح وإتمام الطلب</p>
      </header>

      {isLoadingSellingPoints ? <p className="muted">جاري تحميل نقاط البيع...</p> : null}

      <button
        type="button"
        className={`store-option ${!selectedSellingPoint ? "selected" : ""}`}
        onClick={() => setSelectedSellingPointId("")}
      >
        <span className={`store-option-indicator ${!selectedSellingPoint ? "selected" : ""}`} aria-hidden="true" />
        <span className="store-option-text">
          <strong className="store-option-title">بدون تحديد</strong>
          <span className="store-option-subtitle">لن تستطيع إضافة منتجات إلى السلة حتى تحدد نقطة بيع</span>
        </span>
      </button>

      {sellingPoints.map((point) => {
        const isSelected = selectedSellingPoint?.id === point.id;
        const title = point.name_ar || point.name_en || point.id;
        const subtitleParts = [point.city, point.country].filter(Boolean);
        const subtitle = subtitleParts.length ? subtitleParts.join(" - ") : "غير محدد";

        return (
          <button
            key={point.id}
            type="button"
            className={`store-option ${isSelected ? "selected" : ""}`}
            onClick={() => setSelectedSellingPointId(point.id)}
          >
            <span className={`store-option-indicator ${isSelected ? "selected" : ""}`} aria-hidden="true">
              {isSelected ? "✓" : ""}
            </span>
            <span className="store-option-text">
              <strong className="store-option-title">{title}</strong>
              <span className="store-option-subtitle">{subtitle}</span>
            </span>
          </button>
        );
      })}
    </section>
  );
}
