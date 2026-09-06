"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

type Props = {
  children: ReactNode;
  trackClassName: string;
  label: string;
};

export default function HorizontalScroller({ children, trackClassName, label }: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  const updateOverflow = useCallback(() => {
    const track = trackRef.current;
    setHasOverflow(!!track && track.scrollWidth > track.clientWidth + 1);
  }, []);

  useEffect(() => {
    updateOverflow();
    const track = trackRef.current;
    if (!track) return;

    const observer = new ResizeObserver(updateOverflow);
    observer.observe(track);
    Array.from(track.children).forEach((child) => observer.observe(child));
    window.addEventListener("resize", updateOverflow);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateOverflow);
    };
  }, [children, updateOverflow]);

  const scroll = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.75, behavior: "smooth" });
  };

  return (
    <div className="home-horizontal-scroller" aria-label={label}>
      {hasOverflow ? (
        <button
          type="button"
          className="home-strip-arrow home-strip-arrow-left"
          aria-label="\u0627\u0644\u062a\u0645\u0631\u064a\u0631 \u0625\u0644\u0649 \u0627\u0644\u064a\u0633\u0627\u0631"
          onClick={() => scroll(-1)}
        >
          &lsaquo;
        </button>
      ) : null}

      <div ref={trackRef} className={trackClassName}>
        {children}
      </div>

      {hasOverflow ? (
        <button
          type="button"
          className="home-strip-arrow home-strip-arrow-right"
          aria-label="\u0627\u0644\u062a\u0645\u0631\u064a\u0631 \u0625\u0644\u0649 \u0627\u0644\u064a\u0645\u064a\u0646"
          onClick={() => scroll(1)}
        >
          &rsaquo;
        </button>
      ) : null}
    </div>
  );
}
