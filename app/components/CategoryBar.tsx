"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Category {
  id: string;
  title: string;
}

interface Props {
  categories: Category[];
  active: string;
  onSelect: (id: string) => void;
}

// One swipeable row on mobile (with edge fades + arrows so it's obvious more
// categories are off-screen); wraps normally on desktop.
export default function CategoryBar({ categories, active, onSelect }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  // Track whether there's more to scroll on each side
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const update = () =>
      setEdges({
        left: el.scrollLeft > 4,
        right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
      });

    const observer = new ResizeObserver(update);
    observer.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, [categories.length]);

  // Keep the selected category visible
  useEffect(() => {
    scrollerRef.current
      ?.querySelector<HTMLElement>(`[data-id="${active}"]`)
      ?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
  }, [active, categories.length]);

  const nudge = (direction: 1 | -1) =>
    scrollerRef.current?.scrollBy({
      left: direction * 200,
      behavior: "smooth",
    });

  return (
    <div className="-mx-6 md:mx-0">
      <div className="relative">
        <div
          ref={scrollerRef}
          className="no-scrollbar flex flex-nowrap md:flex-wrap gap-2 pb-2 px-6 md:px-0 overflow-x-auto md:overflow-visible scroll-smooth"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              data-id={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`shrink-0 px-4 md:px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border ${
                active === cat.id
                  ? "bg-[#F1B135] text-[#F3494A] border-[#F1B135] shadow-[0_0_20px_rgba(255,68,0,0.3)]"
                  : "bg-neutral-900/50 text-[#F1B135] border-white/5 hover:border-white/20"
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>

        {/* MOBILE EDGE HINTS */}
        <div
          className={`md:hidden pointer-events-none absolute left-0 top-0 bottom-2 w-14 bg-gradient-to-r from-black via-black/80 to-transparent flex items-center transition-opacity ${
            edges.left ? "opacity-100" : "opacity-0 invisible"
          }`}
        >
          <button
            onClick={() => nudge(-1)}
            aria-label="Scroll categories left"
            className="pointer-events-auto ml-1 w-7 h-7 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-[#F1B135]"
          >
            <ChevronLeft size={16} strokeWidth={3} />
          </button>
        </div>
        <div
          className={`md:hidden pointer-events-none absolute right-0 top-0 bottom-2 w-16 bg-gradient-to-l from-black via-black/80 to-transparent flex items-center justify-end transition-opacity ${
            edges.right ? "opacity-100" : "opacity-0 invisible"
          }`}
        >
          <button
            onClick={() => nudge(1)}
            aria-label="Scroll categories right"
            className="pointer-events-auto mr-1 w-7 h-7 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-[#F1B135] animate-pulse"
          >
            <ChevronRight size={16} strokeWidth={3} />
          </button>
        </div>
      </div>

      {edges.right && !edges.left && (
        <p className="md:hidden px-6 text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-500">
          Swipe for more categories →
        </p>
      )}
    </div>
  );
}
