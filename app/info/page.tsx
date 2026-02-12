"use client";

import React from "react";
import { Phone, MapPin, Clock, Instagram, Twitter } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 selection:bg-[#F3494A] selection:text-black">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* HEADER */}
        <div className="mb-16 md:mb-24">
          <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-none mb-6">
            Find <span className="text-[#F3494A]">Us</span>
          </h1>
          <p className="text-neutral-500 max-w-xl font-medium uppercase tracking-[0.2em] text-xs md:text-sm">
            Visit our flagship location or give us a call. We're open late every
            day.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
          {/* LEFT: DIRECT INFO */}
          <div className="space-y-12">
            {/* LARGE CONTACT INFO */}
            <div className="space-y-8">
              <div className="group">
                <h3 className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mb-4">
                  Phone Number
                </h3>
                <a
                  href="tel:+15550001234"
                  className="text-4xl md:text-5xl font-bold hover:text-[#F3494A] transition-colors duration-300 tracking-tight"
                >
                  +961 70 772 324
                </a>
              </div>

              <div className="group">
                <h3 className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mb-4">
                  Location
                </h3>
                <p className="text-3xl md:text-4xl font-bold leading-tight">
                  <span className="text-white">
                    اوتستراد السيد هادي جنب نمر الوادي
                  </span>
                </p>
              </div>
            </div>

            <hr className="border-white/10" />

        {/* SECONDARY INFO GRID */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-[#F3494A]">
      <Clock size={16} />
      <h4 className="text-[10px] font-black uppercase tracking-widest">
        Opening Hours
      </h4>
    </div>
    
    <div className="space-y-1.5 border-l border-white/5 pl-4">
      {[
        "Friday", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"
      ].map((day) => (
        <div key={day} className="flex justify-between items-center gap-8 group">
          <span className="text-neutral-500 group-hover:text-neutral-300 transition-colors text-[16px] font-bold uppercase tracking-tight">
            {day}
          </span>
          <span className="text-white/90 font-mono text-[16px] font-medium">
            Open 24 hours
          </span>
        </div>
      ))}
    </div>
  </div>
</div>
</div>

          {/* RIGHT: THE MAP */}
         <div className="relative">
  <div className="rounded-[3rem] overflow-hidden border border-white/10 bg-neutral-900 aspect-square relative group shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
 

    {/* THE ACTUAL MAP: Interactivity disabled via pointer-events-none */}
    <iframe
      src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3313.4666036190742!2d35.51238247570792!3d33.85186387323308!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzPCsDUxJzA2LjciTiAzNcKwMzAnNTMuOSJF!5e0!3m2!1sen!2slb!4v1770901503089!5m2!1sen!2slb"
      className="absolute inset-0 w-full h-full "
      style={{ border: 0 }}
      allowFullScreen={true}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />

    {/* DESIGN DECORATION */}
    <div className="absolute bottom-10 left-10 z-10 pointer-events-none">
       <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Hadi Nasrallah Blvd</p>
    </div>
  </div>
</div>
        </div>
      </div>
    </div>
  );
}
