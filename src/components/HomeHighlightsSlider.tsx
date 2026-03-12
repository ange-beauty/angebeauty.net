"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Product } from "@/types/product";
import { productHref } from "@/lib/productUrl";
import { getDisplayBrand } from "@/lib/brand";
import { formatPrice } from "@/lib/formatPrice";

type Props = {
  products: Product[];
};

export default function HomeHighlightsSlider({ products }: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [viewportWidth, setViewportWidth] = useState(1200);
  const [activeIndex, setActiveIndex] = useState(0);

  const items = useMemo(() => products.slice(0, 6), [products]);
  const highlightHeight = viewportWidth >= 1280
    ? 420
    : viewportWidth >= 900
      ? 360
      : Math.max(200, Math.round(viewportWidth * 0.52));

  const getStep = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    const first = track.children.item(0) as HTMLElement | null;
    const second = track.children.item(1) as HTMLElement | null;
    if (!first) return track.clientWidth;
    if (!second) return first.offsetWidth;
    return second.offsetLeft - first.offsetLeft;
  }, []);

  const scrollToIndex = useCallback(
    (index: number, smooth = true) => {
      const track = trackRef.current;
      if (!track || !items.length) return;
      const step = getStep();
      if (!step) return;

      const safeIndex = (index + items.length) % items.length;
      track.scrollTo({
        left: safeIndex * step,
        behavior: smooth ? "smooth" : "auto",
      });
      setActiveIndex(safeIndex);
    },
    [getStep, items.length]
  );

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!items.length) return;
    scrollToIndex(0, false);
  }, [items.length, viewportWidth, scrollToIndex]);

  useEffect(() => {
    if (items.length < 2) return;

    const timer = window.setInterval(() => {
      scrollToIndex(activeIndex + 1);
    }, 3500);

    return () => window.clearInterval(timer);
  }, [activeIndex, items.length, scrollToIndex]);

  if (!items.length) {
    return null;
  }

  const goPrev = () => scrollToIndex(activeIndex - 1);
  const goNext = () => scrollToIndex(activeIndex + 1);

  const handleTrackScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const step = getStep();
    if (!step) return;

    const index = Math.round(track.scrollLeft / step);
    const boundedIndex = Math.min(Math.max(index, 0), items.length - 1);

    if (boundedIndex !== activeIndex) {
      setActiveIndex(boundedIndex);
    }
  };

  return (
    <>
      <div className="highlights-shell">
        <button type="button" className="carousel-arrow" aria-label="السابق" onClick={goPrev}>
          {"<"}
        </button>

        <div
          ref={trackRef}
          className="highlights-track"
          onScroll={handleTrackScroll}
        >
          {items.map((product, index) => {
            const brand = getDisplayBrand(product.brand);
            return (
              <article
                key={product.id}
                className="highlight-card"
                style={{ height: `${highlightHeight}px` }}
              >
                <Link href={productHref(product)}>
                  <img
                    src={product.image || "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1000&h=1000&fit=crop"}
                    alt={product.name}
                    loading={activeIndex === index ? "eager" : "lazy"}
                    decoding="async"
                  />
                  <div className="highlight-overlay">
                    <div className="highlight-text-surface">
                      {brand ? <p className="highlight-brand">{brand}</p> : null}
                      <p className="highlight-name">{product.name}</p>
                      <p className="highlight-price">{formatPrice(product.price)}</p>
                    </div>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>

        <button type="button" className="carousel-arrow" aria-label="التالي" onClick={goNext}>
          {">"}
        </button>
      </div>

      <div className="highlight-dots">
        {items.map((product, index) => (
          <button
            key={product.id}
            type="button"
            className={`dot ${index === activeIndex ? "active" : ""}`}
            aria-label={`الانتقال إلى الشريحة ${index + 1}`}
            onClick={() => scrollToIndex(index)}
          />
        ))}
      </div>
    </>
  );
}
