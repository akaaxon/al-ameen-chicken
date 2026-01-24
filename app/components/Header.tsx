"use client";

import { useState, useEffect, useRef, useLayoutEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // Ensure menu only renders on client

  const panelRef = useRef<HTMLElement>(null);
  const layersRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);

  const menuItems = [
    { label: "Home", link: "/" },
    { label: "Menu", link: "/menu" },
    { label: "Location", link: "/about" },
    { label: "Contact Us", link: "/contact" },
  ];

  const socialItems = [
    { label: "Instagram", link: "https://www.instagram.com/al_amin_snack" },
    { label: "TikTok", link: "https://www.tiktok.com/@al_amin_snack" },
    { label: "WhatsApp", link: "https://wa.me/96170772324" },
  ];

  const colors = ["#F3494A", "#1a1a1a"];

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Only render menu on client to prevent flash
  useEffect(() => setMounted(true), []);

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  // GSAP initial setup
  useLayoutEffect(() => {
    if (!mounted) return;

    // Initial positions
    gsap.set(panelRef.current, { xPercent: 100 });
    gsap.set(gsap.utils.toArray(layersRef.current?.children || []), { xPercent: 100 });
  }, [mounted]);

  const toggleMenu = useCallback(() => {
    const targetState = !isOpen;
    setIsOpen(targetState);

    const panel = panelRef.current;
    const layers = gsap.utils.toArray(layersRef.current?.children || []);
    const items = gsap.utils.toArray(".menu-item-label");
    const icon = iconRef.current;

    if (targetState) {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      // Animate layers
      tl.to(layers, { xPercent: 0, duration: 0.6, stagger: 0.1 });

      // Animate main panel
      tl.to(panel, { xPercent: 0, duration: 0.8 }, "-=0.5");

      // Animate menu items
      tl.fromTo(
        items,
        { y: 100, opacity: 0, rotate: 5 },
        { y: 0, opacity: 1, rotate: 0, duration: 0.8, stagger: 0.1 },
        "-=0.4"
      );

      // Rotate icon to X
      gsap.to(icon, { rotate: 225, duration: 0.6 });
    } else {
      // Close timeline
      const tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });
      tl.to(items, { y: -50, opacity: 0, duration: 0.3 });
      tl.to([panel, ...layers], { xPercent: 100, duration: 0.5, stagger: 0.05 });
      gsap.to(icon, { rotate: 0, duration: 0.5 });
    }
  }, [isOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[110] transition-all duration-500 ${
          scrolled || isOpen ? "bg-black/80 backdrop-blur-xl py-4" : "bg-transparent py-8"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="relative z-[120]">
            <Image
              src="/logo.png"
              alt="Logo"
              width={120}
              height={50}
              priority
              className={`h-10 w-auto transition-all duration-500`}
            />
          </Link>

          <button
            onClick={toggleMenu}
            className="relative z-[120] w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-full hover:bg-[#F3494A] hover:text-black transition-all group"
          >
            <span ref={iconRef} className="relative w-5 h-5 flex items-center justify-center pointer-events-none">
              <span className="absolute w-full h-0.5 bg-current rounded-full"></span>
              <span className="absolute w-full h-0.5 bg-current rounded-full rotate-90"></span>
            </span>
          </button>
        </div>
      </header>

      {mounted && (
        <>
          {/* Overlay */}
          <div
            className={`fixed inset-0 bg-black/70 backdrop-blur-md z-[80] transition-opacity duration-700 ${
              isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            onClick={toggleMenu}
          />

          {/* Layers */}
          <div ref={layersRef} className="fixed inset-0 z-[90] pointer-events-none">
            {colors.map((c, i) => (
              <div
                key={i}
                className="absolute inset-y-0 right-0 w-full md:w-[500px] shadow-2xl"
                style={{ background: c }}
              />
            ))}
          </div>

          {/* Main Panel */}
          <aside
            ref={panelRef}
            className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-black z-[100] p-8 md:p-16 pt-32 flex flex-col"
          >
            <nav className="flex-1">
              <ul className="mt-4 space-y-6">
                {menuItems.map((item, i) => (
                  <li key={i} className="overflow-hidden">
                    <Link
                      href={item.link}
                      onClick={toggleMenu}
                      className="menu-item-label block text-5xl md:text-7xl font-black text-white hover:text-[#F3494A] transition-colors uppercase tracking-tighter leading-[0.9]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-auto border-t border-white/10 pt-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-6">Connect with us</p>
              <div className="flex gap-8">
                {socialItems.map((s, i) => (
                  <a
                    key={i}
                    href={s.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white font-black hover:text-[#F3494A] transition-colors uppercase text-xs tracking-widest"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}