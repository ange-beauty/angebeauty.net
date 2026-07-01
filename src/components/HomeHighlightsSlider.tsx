"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Product } from "@/types/product";

export type OfferHeroSlide = {
  id: string;
  badge: string;
  title: string;
  description: string;
  valueLabel: string;
  href: string;
  products: Product[];
};

type Props = {
  slides: OfferHeroSlide[];
};

export default function HomeHighlightsSlider({ slides }: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const items = useMemo(() => slides.slice(0, 5), [slides]);

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
    if (!items.length) return;
    scrollToIndex(0, false);
  }, [items.length, scrollToIndex]);

  useEffect(() => {
    if (items.length < 2) return;

    const timer = window.setInterval(() => {
      scrollToIndex(activeIndex + 1);
    }, 4500);

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
    <div className="offer-hero-carousel">
      <button type="button" className="offer-arrow offer-arrow-prev" aria-label="السابق" onClick={goPrev}>
        {"<"}
      </button>

      <div ref={trackRef} className="offer-hero-track" onScroll={handleTrackScroll}>
        {items.map((slide, index) => {
          const heroProduct = slide.products[0];
          const supportingProducts = slide.products.slice(1, 4);

          return (
            <article key={slide.id} className="offer-hero-slide">
              <Link href={slide.href} className="offer-hero-link">
                <div className="offer-hero-copy">
                  <p className="offer-kicker">{slide.badge}</p>
                  <h1>{slide.title}</h1>
                  <p className="offer-title">{slide.description}</p>
                  <div className="offer-price-row">
                    <span>العرض</span>
                    <strong>{slide.valueLabel}</strong>
                  </div>
                  <span className="offer-cta">تسوقي العرض</span>
                </div>

                <div className="offer-hero-media" aria-hidden="true">
                  <div className="offer-glow offer-glow-one" />
                  <div className="offer-glow offer-glow-two" />
                  {heroProduct?.image ? (
                    <img
                      src={heroProduct.image}
                      alt=""
                      className="offer-hero-image"
                      loading={activeIndex === index ? "eager" : "lazy"}
                      decoding="async"
                    />
                  ) : (
                    <div className="offer-visual-fallback">{slide.title.slice(0, 2)}</div>
                  )}
                  {supportingProducts.length > 0 ? (
                    <div className="offer-product-thumbs">
                      {supportingProducts.map((product) =>
                        product.image ? (
                          <img key={product.id} src={product.image} alt="" loading="lazy" decoding="async" />
                        ) : null
                      )}
                    </div>
                  ) : null}
                </div>
              </Link>
            </article>
          );
        })}
      </div>

      <button type="button" className="offer-arrow offer-arrow-next" aria-label="التالي" onClick={goNext}>
        {">"}
      </button>

      <div className="offer-dots">
        {items.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            className={`offer-dot ${index === activeIndex ? "active" : ""}`}
            aria-label={`الانتقال إلى العرض ${index + 1}`}
            onClick={() => scrollToIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
