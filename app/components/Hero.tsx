"use client";

import { useRef, useLayoutEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Entrance Animation
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });

      // 1. Logo: Scale up and fade in
      tl.fromTo(logoRef.current,
        { opacity: 0, scale: 0.8, filter: "blur(10px)" },
        { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.5, ease: "power4.out" }
      );

      // 2. Subtitle: Slide up
      tl.fromTo(subtitleRef.current,
        { opacity: 0, y: 20, letterSpacing: "0em" },
        { opacity: 1, y: 0, letterSpacing: "0.2em", duration: 1, ease: "power3.out" },
        "-=1.0"
      );

      // 3. Button: Slide up
      tl.fromTo(buttonRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
        "-=0.8"
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main 
      ref={containerRef} 
      className="relative h-screen w-full bg-black flex flex-col items-center justify-center overflow-hidden px-6"
    >
      
      {/* Background Ambient Glow (Optional - adds depth behind the logo) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ff4400] opacity-[0.08] blur-[120px] rounded-full pointer-events-none" />

      {/* 1. LOGO */}
      <div ref={logoRef} className="relative w-[280px] md:w-[290px] lg:w-[320px] aspect-square mb-2 opacity-0">
        <Image 
          src="/logo.png" 
          alt="Al Amin Logo"
          fill
          priority
          className="object-contain drop-shadow-[0_0_40px_rgba(255,68,0,0.15)]"
        />
      </div>

      {/* 2. SUBTITLE */}
      <p 
        ref={subtitleRef} 
        className="text-[#F1B135] font-bold uppercase text-lg md:text-5xl mb-10 opacity-0"
      >
        نتميز بالجودة والنوعية
      </p>

      {/* 3. BUTTON */}
      <div ref={buttonRef} className="opacity-0">
        <Link href="/menu" className="group relative inline-flex flex-col items-center justify-center">
          {/* Button Glow Effect */}
          <div className="absolute inset-0 bg-[#F3494A] blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 rounded-full" />
          
          <div className="relative px-12 py-5 bg-white text-black font-black text-lg md:text-xl rounded-full flex items-center gap-3 transition-all duration-300 group-hover:bg-[#F3494A] group-hover:text-[#F1B135] group-hover:scale-105 active:scale-95 shadow-xl">
            <span>VIEW MENU</span>
          </div>
        </Link>
      </div>

    </main>
  );
}