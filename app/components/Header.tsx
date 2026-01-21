"use client";

import { useEffect, useState, useRef, useCallback, useLayoutEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const openRef = useRef(false);

  // Refs for GSAP
  const panelRef = useRef<HTMLElement>(null);
  const preLayersRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const textInnerRef = useRef<HTMLSpanElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);

  const menuItems = [
    { label: "Home", link: "/" },
    { label: "Menu", link: "/menu" },
    { label: "Location", link: "/about" },
    { label: "Contact Us", link: "/contact" },
  ];

  const socialItems = [
    { label: "Instagram", link: "#" },
    { label: "TikTok", link: "#" },
    { label: "WhatsApp", link: "#" },
  ];

  const colors = ["#111111", "#1a1a1a"];

// 1. Optimized Handle Scroll (Conditional Update)
useEffect(() => {
  let ticking = false;

  const handleScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const isPastThreshold = window.scrollY > 50;
        
        // ONLY update state if the value actually flips
        // This prevents thousands of unnecessary re-renders
        setScrolled((prev) => {
          if (prev !== isPastThreshold) return isPastThreshold;
          return prev;
        });
        
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

// 2. Body Scroll Lock (Standard & Clean)
useEffect(() => {
  document.body.style.overflow = isOpen ? "hidden" : "";
  
  // Cleanup to ensure scroll is restored if component unmounts unexpectedly
  return () => { document.body.style.overflow = ""; };
}, [isOpen]);

  // 3. GSAP Initial State
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const layers = preLayersRef.current?.querySelectorAll(".prelayer");
      if (!panel || !layers) return;

      // Ensure panel is hidden to the right initially
      gsap.set([panel, ...Array.from(layers)], { xPercent: 100 });
      gsap.set(iconRef.current, { rotate: 0 });
    });
    return () => ctx.revert();
  }, []);

  const toggleMenu = useCallback(() => {
    const target = !openRef.current;
    openRef.current = target;
    setIsOpen(target);

    const panel = panelRef.current;
    const layers = Array.from(preLayersRef.current?.querySelectorAll(".prelayer") || []);
    // Select strictly the labels inside the panel to avoid selecting other text
    const items = Array.from(panel?.querySelectorAll(".menu-item-label") || []);
    const icon = iconRef.current;
    const textInner = textInnerRef.current;

    if (target) {
      // OPEN ANIMATION
      const tl = gsap.timeline();
      
      // Layers slide in
      layers.forEach((layer, i) => {
        tl.to(layer, { xPercent: 0, duration: 0.5, ease: "power4.out" }, i * 0.07);
      });

      // Panel slides in
      tl.to(panel, { xPercent: 0, duration: 0.65, ease: "power4.out" }, "-=0.4");
      
      // Text reveals (staggered)
      tl.fromTo(items, 
        { yPercent: 140, rotate: 5 }, 
        { yPercent: 0, rotate: 0, duration: 0.8, stagger: 0.1, ease: "power4.out" }, 
        "-=0.3"
      );

      // Icon & Button Text Animations
      gsap.to(icon, { rotate: 225, duration: 0.8, ease: "power4.out" });
      gsap.to(textInner, { yPercent: -50, duration: 0.5, ease: "power4.out" }); 
    } else {
      // CLOSE ANIMATION
      gsap.to([panel, ...layers], { xPercent: 100, duration: 0.4, ease: "power3.in", stagger: 0.05 });
      gsap.to(icon, { rotate: 0, duration: 0.4, ease: "power3.inOut" });
      gsap.to(textInner, { yPercent: 0, duration: 0.5, ease: "power4.out" });
    }
  }, []);

  return (
    <>
      <header
        // FIX: Used z-[100] instead of z-100 (which doesn't exist in Tailwind)
        className={`fixed top-0 left-0 right-0 z-100 transition-all duration-500 ${
          scrolled || isOpen ? "bg-black/90 backdrop-blur-md py-4" : "bg-transparent py-8"
        }`}
      >
        <div className="max-w-350 mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="relative z-110">
            <Image 
              src="/chimkin.jpg" 
              alt="Logo" 
              width={120} 
              height={50} 
              className={`h-10 w-auto transition-all duration-500 ${isOpen ? "brightness-100" : ""}`} 
            />
          </Link>

          <div className="flex items-center gap-8">
            {/* Custom Toggle Button */}
            <button
              ref={toggleBtnRef}
              onClick={toggleMenu}
              className="relative z-110 flex items-center gap-3 group outline-none cursor-pointer"
            >
              <div className="h-5 overflow-hidden text-xs uppercase tracking-widest font-bold text-white sm:block">
                <span ref={textInnerRef} className="flex flex-col transition-transform duration-500">
                  <span className="h-5">Menu</span>
                  <span className="h-5 text-[#ff4400]">Close</span>
                </span>
              </div>
              
              <span ref={iconRef} className="relative w-6 h-6 flex items-center justify-center">
                <span className="absolute w-full h-0.5 bg-white rounded-full"></span>
                <span className="absolute w-full h-0.5 bg-white rounded-full rotate-90"></span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Dim Overlay - Added to separate menu from page content visually */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-70 transition-opacity duration-500 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleMenu} // Click outside to close
      />

      {/* Pre-layers (The staggered background panels) */}
      <div ref={preLayersRef} className="fixed inset-0 z-80 pointer-events-none">
        {colors.map((c, i) => (
          // FIX: Changed md:w-112.5 to md:w-[450px]
          <div key={i} className="prelayer absolute inset-y-0 right-0 w-full md:w-450px" style={{ background: c }} />
        ))}
      </div>

      {/* Main Menu Panel */}
      <aside
        ref={panelRef}
        // FIX: Changed z-90 to z-[90] and added specific width
        className="fixed inset-y-0 right-0 w-full md:w-112.5 bg-black z-90 p-10 pt-32 flex flex-col shadow-2xl"
      >
        <nav className="flex-1">
          <ul className="space-y-4">
            {menuItems.map((item, i) => (
              <li key={i} className="overflow-hidden">
                <Link 
                  href={item.link} 
                  onClick={toggleMenu}
                  className="menu-item-label block text-5xl md:text-6xl font-black text-white hover:text-[#ff4400] transition-colors uppercase tracking-tighter"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Socials Section */}
        <div className="mt-auto border-t border-white/10 pt-8">
          <h3 className="text-[#ff4400] uppercase text-xs font-bold tracking-widest mb-4">Find Us</h3>
          <div className="flex gap-6">
            {socialItems.map((s, i) => (
              <a key={i} href={s.link} className="text-white font-bold hover:text-[#ff4400] transition-colors uppercase text-sm">
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}