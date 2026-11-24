import { useState } from "react";
import { Plus } from "lucide-react";

export interface Product { id: string; category_id: string; name: string; price: number; image_url: string; description: string; }

export default function ProductCard({ product, onAdd }: { product: Product, onAdd: () => void }) {
  const [isImageLoading, setIsImageLoading] = useState(true);

  // A simple helper function to swap the domain
const getCdnUrl = (originalUrl: string) => {
  if (!originalUrl) return "https://placehold.co/600x600/171717/FFFFFF/webp?text=MenuItem";
  
  // This replaces the Supabase domain with your CDN domain
  return originalUrl.replace(
    /https:\/\/[^/]+/, 
    "https://cdn.akaaxon.workers.dev"
  );
};

  return (
    <div className="menu-card group relative flex flex-col bg-neutral-900/20 rounded-[1.5rem] md:rounded-[2.5rem] p-2.5 pb-3 md:p-4 md:pb-5 border border-white/5 hover:border-[#F3494A]/40 transition-all duration-500 hover:bg-neutral-900/40 h-full">
      
      {/* IMAGE CONTAINER */}
      <div className="relative aspect-square w-full overflow-hidden rounded-[1.2rem] md:rounded-[2rem] bg-neutral-900 shadow-xl shrink-0">
        <img
          src={getCdnUrl(product.image_url)}
          alt={product.name}
          loading="lazy"
          // absolute inset-0 w-full h-full makes it act exactly like next/image fill
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 ${
            isImageLoading ? 'scale-110 blur-2xl opacity-0' : 'scale-100 blur-0 opacity-100'
          }`}
          onLoad={() => setIsImageLoading(false)}
          onError={(e) => { e.currentTarget.src = "https://placehold.co/600x600/171717/A594F9/webp?text=Error"; }}
        />
      </div>

      {/* CONTENT */}
      <div className="pt-3 px-1 md:pt-5 md:px-2 flex flex-col flex-grow">
        <h3 className="font-black text-sm md:text-xl uppercase tracking-tighter text-[#F1B135] group-hover:text-[#F3494A] transition-colors mb-1 leading-tight">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-white text-[10px] md:text-xs font-medium leading-relaxed opacity-70">
            {product.description}
          </p>
        )}

        {/* PRICE + ADD: pinned to the bottom so prices line up across a row */}
        <div className="mt-auto pt-3 md:pt-4 flex items-center justify-between gap-2 border-t border-white/5">
          <p className="font-black leading-none text-white">
            <span className="text-[#F3494A] text-xs md:text-base align-top mr-0.5">$</span>
            <span className="text-lg md:text-3xl tracking-tighter">{Math.trunc(product.price)}</span>
            <span className="text-xs md:text-base text-neutral-400">.{product.price.toFixed(2).split(".")[1]}</span>
          </p>

          <button
            onClick={(e) => { e.preventDefault(); onAdd(); }}
            aria-label={`Add ${product.name} to bag`}
            className="shrink-0 bg-[#F3494A] text-black w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-[0_6px_20px_-6px_rgba(243,73,74,0.6)] hover:scale-105 active:scale-90 transition-transform"
          >
            <Plus size={18} strokeWidth={3} className="md:w-6 md:h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
