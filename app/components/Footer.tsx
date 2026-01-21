"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Footer() {
  const footerRef = useRef(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Create a simple reveal for footer elements
      gsap.from(".footer-anim", {
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 70%", // Starts when the footer enters the bottom of the screen
        },
        y: 30,
        opacity: 0,
        duration: 2,
        stagger: 0.15,
        ease: "power3.out",
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer 
      ref={footerRef} 
      className="bg-white/5 border-t border-white/10 pt-20 pb-10 px-6 mt-20"
      dir="rtl"
    >
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
        
        {/* Brand Section */}
        <div className="footer-anim text-center md:text-right">
          <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">
            فروج <span className="text-[#ff4400]">الأمين</span>
          </h2>
          <p className="text-xl text-white/60 font-medium">أمين بطعمتو.</p>
        </div>

        {/* Social Links */}
        <div className="footer-anim flex flex-col gap-3 text-center md:text-left">
          {["Instagram", "TikTok", "WhatsApp"].map((social) => (
            <a 
              key={social}
              href="#" 
              className="text-2xl font-bold hover:text-[#ff4400] transition-colors flex items-center justify-center md:justify-start gap-2 group"
            >
              {social} 
              <span className="text-sm opacity-50 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300">
                ↗
              </span>
            </a>
          ))}
        </div>

      </div>
      
      {/* Copyright */}
      <div className="footer-anim text-center text-white/30 mt-24 text-sm tracking-widest uppercase font-bold">
        © 2026 Al Amin Chicken. All rights reserved.
      </div>
    </footer>
  );
}