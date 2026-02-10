"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
        y: 30,
        opacity: 0,
        duration: 1.2,
        stagger: 0.1,
        ease: "power3.out",
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer 
      ref={footerRef} 
      className="bg-white/5 border-t border-white/10 pt-20 pb-10 px-6 mt-20"
    >
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
        
        {/* Brand Section */}
        <div className="footer-anim text-center md:text-right" dir="rtl">
          <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">
            فروج <span className="text-[#ff4400]">الأمين</span>
          </h2>
          <p className="text-xl text-white/60 font-medium">أمين بطعمتو.</p>
        </div>

        {/* Social Links */}
        <div className="footer-anim flex flex-col gap-3 text-center md:text-left">
          {socialItems.map((social) => (
            <a 
              key={social.label}
              href={social.link}   
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl font-bold hover:text-[#ff4400] transition-colors flex items-center justify-center md:justify-start gap-2 group"
            >
              { social.label } 
              <span className="text-sm opacity-50 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300">
                ↗
              </span>
            </a>
          ))}
        </div>
      </div>
      
      {/* Bottom Section: Dev Credit & Copyright */}
      <div className="pt-2 border-t border-white/5 flex flex-col items-center gap-4">
        {/* Powered By Section */}
        <div className="footer-anim text-white/40 text-xs md:text-sm font-bold uppercase tracking-[0.2em]">
          Powered by{" "}
          <a 
            href="https://axondevs.work" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#FAF9F6] hover:text-[#ff4400] transition-colors duration-300 underline underline-offset-4 decoration-white/20 hover:decoration-[#ff4400]"
          >
            Axon Devs
          </a>
        </div>

        {/* Copyright */}
        <div className="footer-anim text-center text-white/20 text-[10px] md:text-xs tracking-widest uppercase font-medium">
          © 2026 Al Amin Chicken. All rights reserved.
        </div>
      </div>
    </footer>
  );
}