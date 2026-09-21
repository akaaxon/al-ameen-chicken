"use client";

import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

export default function Footer() {
  const footerRef = useRef(null);
  const socialItems = [
    { label: "Instagram", link: "https://www.instagram.com/al_amin_snack" },
    { label: "TikTok", link: "https://www.tiktok.com/@al_amin_snack" },
    { label: "WhatsApp", link: "https://wa.me/96170772324" },
  ];

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(".footer-anim", {
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 85%",
        },
        y: 20, // Reduced translation for a tighter, more subtle reveal
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power2.out",
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="bg-black pt-20 pb-8 px-6 mt-20"
    >
      <div className="max-w-[1200px] mx-auto flex flex-col items-center md:items-start">
        
        {/* Top Section: Logo */}
        <div className="footer-anim w-full flex justify-center md:justify-start mb-12">
          <div className="relative w-40 h-24 md:w-48 md:h-28">
            <Image
              src="/logo.png"
              alt="فروج الأمين - Al Amin Chicken Logo"
              fill
              className="object-contain object-center md:object-left"
              priority
            />
          </div>
        </div>

        {/* Middle Section: Editorial Social Links */}
        <div className="footer-anim w-full border-y border-white/10 py-6 md:py-8 mb-8">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-8">
            {socialItems.map((social, index) => (
              <React.Fragment key={social.label}>
                <a
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm md:text-base font-semibold uppercase tracking-[0.15em] text-white/60 hover:text-[#ff4400] transition-colors duration-300"
                >
                  {social.label}
                </a>
                
                {/* Custom Separator - hides after the last item */}
                {index !== socialItems.length - 1 && (
                  <span className="text-[#ff4400]/90 text-xs md:text-sm font-light select-none">
                    /
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Bottom Section: Dev Credit & Copyright */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          
          {/* Copyright */}
          <div className="footer-anim text-white/30 text-[11px] md:text-xs font-medium tracking-widest uppercase">
            © 2026 Al Amin Chicken. All rights reserved.
          </div>

          {/* Powered By Section */}
          <div className="footer-anim text-white/30 text-[11px] md:text-xs font-medium tracking-[0.2em] uppercase flex items-center gap-1.5">
            Powered by{" "}
            <a
              href="https://yetnext.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-[#ff4400] transition-colors duration-300 font-bold"
            >
              YetNext
            </a>
          </div>
          
        </div>
      </div>
    </footer>
  );
}