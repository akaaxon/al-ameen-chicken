import Image from "next/image";
import { useState } from "react";
import { Plus } from "lucide-react";

export interface Product { id: string; category_id: string; name: string; price: number; image_url: string; description: string; }

export default function ProductCard({ product, onAdd }: { product: Product, onAdd: () => void }) {
  const [isImageLoading, setIsImageLoading] = useState(true);

  return (
    // Removed fixed heights to allow content expansion
    <div className="menu-card group relative flex flex-col bg-neutral-900/20 rounded-[1.5rem] md:rounded-[2.5rem] p-2.5 md:p-4 border border-white/5 hover:border-[#ff4400]/40 transition-all duration-500 hover:bg-neutral-900/40 h-full">
      
      {/* IMAGE CONTAINER */}
      <div className="relative aspect-square w-full overflow-hidden rounded-[1.2rem] md:rounded-[2rem] bg-neutral-900 shadow-xl shrink-0">
        <Image
          src={product.image_url || "/placeholder.jpg"}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className={`object-cover transition-all duration-1000 group-hover:scale-110 ${isImageLoading ? 'scale-110 blur-2xl opacity-0' : 'scale-100 blur-0 opacity-100'}`}
          onLoadingComplete={() => setIsImageLoading(false)}
        />
        
        {/* PRICE TAG */}
        <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-black/60 backdrop-blur-xl px-2.5 py-1 md:px-4 md:py-1.5 rounded-lg md:rounded-xl border border-white/10 z-20">
          <span className="text-[#ff4400] font-black font-mono text-xs md:text-base">${product.price.toFixed(2)}</span>
        </div>

        {/* ADD BUTTON OVERLAY */}
        <button 
          onClick={(e) => { e.preventDefault(); onAdd(); }}
          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-sm z-30"
        >
          <div className="bg-[#F3494A] text-black w-10 h-10 md:w-16 md:h-16 rounded-full flex items-center justify-center scale-50 group-hover:scale-100 transition-all duration-500 shadow-[0_0_40px_rgba(255,68,0,0.5)]">
            <Plus size={18} strokeWidth={3} className="md:w-7 md:h-7" />
          </div>
        </button>
      </div>

      {/* CONTENT */}
      <div className="pt-3 px-1 md:pt-5 md:px-2 pb-2 flex flex-col flex-grow">
        {/* Title: Still clamped to 1 line to keep headings consistent */}
        <h3 className="font-black text-sm md:text-xl uppercase tracking-tighter text-[#F1B135] group-hover:text-[#F3494A] transition-colors line-clamp-1 mb-1">
          {product.name}
        </h3>
        
        {/* Description: Removed line-clamp-2 to show full text */}
        <p className="text-white text-[10px] md:text-xs font-medium leading-relaxed opacity-80 min-h-[40px]">
          {product.description}
        </p>
      </div>
    </div>
  );
}