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
  heroImage?: string;
  hideText?: boolean;
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
    [getStep, items.length],
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

  const handleTrackScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const step = getStep();
    if (!step) return;

    const index = Math.round(track.scrollLeft / step);
    const boundedIndex = Math.min(Math.max(index, 0), items.length - 1);
    if (boundedIndex !== activeIndex) setActiveIndex(boundedIndex);
  };

  return (
    <div className="offer-hero-carousel">
      <button type="button" className="offer-arrow offer-arrow-prev" aria-label="السابق" onClick={() => scrollToIndex(activeIndex - 1)}>
        {">"}
      </button>

      <div ref={trackRef} className="offer-hero-track" onScroll={handleTrackScroll}>
        {items.map((slide, index) => {
          const heroImage = slide.heroImage || slide.products[0]?.image;

          return (
            <article key={slide.id} className="offer-hero-slide">
              <Link href={slide.href} className={`offer-hero-link ${slide.hideText ? "offer-hero-image-only" : ""}`}>
                {!slide.hideText ? (
                  <div className="offer-hero-copy">
                    <h1>{slide.title}</h1>
                    <p className="offer-title">{slide.description}</p>
                    <div className="offer-price-row">
                      <span>العرض</span>
                      <strong>{slide.valueLabel}</strong>
                    </div>
                    <span className="offer-cta">تسوقي العرض</span>
                  </div>
                ) : null}

                <div className="offer-hero-media" aria-hidden="true">
                  {heroImage ? (
                    <img
                      src={heroImage}
                      alt=""
                      className="offer-hero-image"
                      loading={activeIndex === index ? "eager" : "lazy"}
                      decoding="async"
                    />
                  ) : (
                    <div className="offer-visual-fallback">{slide.title.slice(0, 2)}</div>
                  )}
                </div>
              </Link>
            </article>
          );
        })}
      </div>

      <button type="button" className="offer-arrow offer-arrow-next" aria-label="التالي" onClick={() => scrollToIndex(activeIndex + 1)}>
        {"<"}
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
