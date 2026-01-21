"use client";

import { useLayoutEffect, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

interface Category {
  id: string;
  title: string;
  image_url: string;
  description: string;
}

export default function Categories() {
  const containerRef = useRef<HTMLElement | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(0);

  /* --------------------------------
     FETCH ONLY 2 CATEGORIES
  -------------------------------- */
  useEffect(() => {
    async function getCategories() {
      try {
        const response = await fetch("/api/categories/get");
        const data: Category[] = await response.json();

        // client-side limit (safe fallback)
        setCategories(data.slice(0, 2));
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    }

    getCategories();
  }, []);

  /* --------------------------------
     GSAP ANIMATIONS
  -------------------------------- */
  useLayoutEffect(() => {
    if (loading || categories.length === 0) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Title animation
      gsap.from(".anim-title-line", {
        scrollTrigger: {
          trigger: ".anim-title-line",
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        y: 100,
        skewY: -7,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "power4.out",
      });

      // Cards animation
      const cards = gsap.utils.toArray(".anim-card");
      cards.forEach((card: any) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
          y: 60,
          opacity: 0,
          scale: 0.98,
          duration: 1,
          ease: "expo.out",
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [loading, categories]);

  if (loading) return null;

  return (
    <section
      ref={containerRef}
      dir="rtl"
      id="categories"
      className="py-24 px-6 max-w-[1400px] mx-auto overflow-hidden"
    >
      {/* --------------------------------
         HEADER
      -------------------------------- */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-8">
        <h2 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter uppercase">
          <span className="anim-title-line block overflow-hidden pb-2 text-neutral-500">
            قائمة
          </span>
          <span className="anim-title-line block overflow-hidden pb-2 text-[#ff4400]">
            الأصناف
          </span>
        </h2>

        <Link
          href="/menu"
          className="
    flex items-center gap-4 text-lg md:text-xl font-bold
    hover:text-[#ff4400] transition-all group flex-row-reverse
    self-start md:self-auto
  "
        >
          <span>عرض الكل</span>
          <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[#ff4400] group-hover:text-black transition-all">
            <span className="group-hover:translate-x-1 transition-transform">
              →
            </span>
          </div>
        </Link>
      </div>

      {/* --------------------------------
         GRID
      -------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map((cat, idx) => {
          const safeSrc = cat.image_url || "/placeholder.jpg";

          return (
            <Link
              key={cat.id}
              href={`/menu?category=${cat.id}`}
              className="anim-card group relative h-[70vh] min-h-[550px] w-full overflow-hidden rounded-[2.5rem] border border-white/5 bg-neutral-900 will-change-transform"
            >
              {/* IMAGE */}
              <div className="absolute inset-0 z-0">
                <div
                  className={`absolute inset-0 bg-white/5 animate-pulse z-10 transition-opacity duration-700 ${
                    imagesLoaded > idx ? "opacity-0" : "opacity-100"
                  }`}
                />

                <Image
                  src={safeSrc}
                  alt={cat.title}
                  fill
                  priority={idx < 2}
                  onLoad={() => setImagesLoaded((prev) => prev + 1)}
                  className="object-cover sm:opacity-50 sm:grayscale sm:group-hover:grayscale-0 sm:group-hover:scale-105 sm:group-hover:opacity-70 transition-all duration-1000 ease-out"
                />

                <div className="absolute inset-0 bg-linear-to-t from-black via-black/80 to-transparent z-20" />
              </div>

              {/* --------------------------------
                 CONTENT (PB RESERVED FOR BUTTON)
              -------------------------------- */}
              <div className="absolute inset-0 z-30 p-10 md:p-14 pb-32 flex flex-col justify-end items-start text-right">
                <div className="w-full">
                  <h3 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-tight mb-1 group-hover:text-[#ff4400] transition-colors break-words">
                    {cat.title}
                  </h3>

                  <p className="text-lg md:text-xl text-white max-w-md font-medium leading-relaxed ">
                    {cat.description}
                  </p>
                </div>

                {/* BUTTON */}
                <div className="absolute bottom-10 left-10 h-16 w-16 rounded-full border border-white/20 flex items-center justify-center text-white backdrop-blur-md transition-all duration-500 group-hover:bg-[#ff4400] group-hover:border-[#ff4400] group-hover:text-black group-hover:-rotate-45">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M17 17L7 7M7 7H17M7 7V17" />
                  </svg>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
