"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1 });

      // Clean, fast transitions without filters
      tl.fromTo(logoRef.current,
        { opacity: 0, y: 10, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power2.out" }
      )
      .fromTo(subtitleRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.4"
      )
      .fromTo(buttonRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.4"
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main 
      ref={containerRef} 
      className="relative h-[100dvh] w-full bg-black flex flex-col items-center justify-center overflow-hidden px-6"
    >
      {/* 1. LOGO - Priority loading, no shadow/glow */}
      <div 
        ref={logoRef} 
        className="relative w-[250px] md:w-[290px] lg:w-[320px] aspect-square mb-6 opacity-0"
      >
        <Image 
          src="/logo.png" 
          alt="Al Amin Logo"
          fill
          priority

          className="object-contain"
        />
      </div>

      {/* 2. SUBTITLE */}
      <p 
        ref={subtitleRef} 
        className="text-[#F1B135] font-bold uppercase text-2xl md:text-5xl mb-12 opacity-0 text-center leading-tight"
        dir="rtl"
      >
        نتميز بالجودة والنوعية
      </p>

      {/* 3. BUTTON */}
      <div ref={buttonRef} className="opacity-0">
        <Link href="/menu" className="group">
          <div className="px-12 py-5 bg-[#F1B135] text-[#F3494A] font-black text-lg md:text-xl rounded-full transition-transform active:scale-95">
            VIEW MENU
          </div>
        </Link>
      </div>
    </main>
  );
}