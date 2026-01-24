"use client";

import {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  Suspense,
  useMemo,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ShoppingBag, Search, X } from "lucide-react";

import ProductCard from "../components/ProductCard";
import CartDrawer from "../components/CartDrawer";
import type { Product } from "../components/ProductCard";
import { useCart } from "@/hooks/useCart";

// --- TYPES ---
interface Category {
  id: string;
  title: string;
}

function MenuGrid() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);

  // --- DATA STATE ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const activeCategory = searchParams.get("category") || "all";

  // --- CART (HOOK) ---
  const {
    cart,
    cartTotal,
    cartCount,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
  } = useCart();

  // --- FETCH DATA ---
  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/categories/get"),
          fetch("/api/products/get"),
        ]);

        if (!catRes.ok || !prodRes.ok) throw new Error("Fetch failed");

        const catData = await catRes.json();
        const prodData = await prodRes.json();

        setCategories([{ id: "all", title: "All Items" }, ...catData]);
        setProducts(prodData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // --- FILTER PRODUCTS (Search + Category) ---
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = activeCategory === "all" || p.category_id === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  // --- GSAP ANIMATION ---
  useLayoutEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".menu-card",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.05, duration: 0.6, ease: "power4.out", overwrite: true },
      );
    }, containerRef);

    return () => ctx.revert();
  }, [loading, activeCategory, searchQuery]); // Re-run animation when search changes

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-black text-white pb-32 pt-28 relative selection:bg-[#F3494A] selection:text-black">
      {/* CATEGORY & SEARCH HEADER */}
      <header
        className="sticky top-[var(--header-height)] z-[50] bg-black/90 backdrop-blur-xl border-b border-white/5 py-4 transition-all"
        style={{ "--header-height": "80px" } as React.CSSProperties}
      >
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
              The <span className="text-[#F3494A]">Menu</span>
            </h1>

            {/* SEARCH BAR */}
            <div className="relative w-full md:w-72 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-[#F3494A] transition-colors" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900/50 border border-white/10 rounded-full py-2.5 pl-11 pr-10 text-sm focus:outline-none focus:border-[#F3494A]/50 focus:ring-1 focus:ring-[#F3494A]/50 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* CATEGORIES */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  router.replace(
                    cat.id === "all" ? "/menu" : `/menu?category=${cat.id}`,
                    { scroll: false }
                  )
                }
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border ${
                  activeCategory === cat.id
                    ? "bg-[#F1B135] text-[#F3494A] border-[#F1B135] shadow-[0_0_20px_rgba(255,68,0,0.3)]"
                    : "bg-neutral-900/50 text-[#F1B135] border-white/5 hover:border-white/20"
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* PRODUCT GRID */}
      <main
        ref={containerRef}
        className="max-w-[1400px] mx-auto px-4 md:px-6 pt-8 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8 min-h-[400px]"
      >
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={() => addToCart(product)}
            />
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-neutral-500 font-bold uppercase tracking-widest">No items found matching "{searchQuery}"</p>
          </div>
        )}
      </main>

      {/* FLOATING CART BUTTON */}
      {cartCount > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-8 right-6 md:right-12 z-[60] bg-[#F3494A] text-black p-5 md:p-6 rounded-full shadow-[0_10px_40px_rgba(243,73,74,0.4)] hover:scale-110 active:scale-90 transition-all group"
        >
          <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-4 border-black group-hover:bg-black group-hover:text-white transition-colors">
            {cartCount}
          </span>
          <ShoppingBag size={24} strokeWidth={2.5} className="md:w-7 md:h-7" />
        </button>
      )}

      {/* CART DRAWER */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        cartTotal={cartTotal}
        cartCount={cartCount}
        updateQty={updateQty}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
      />
    </div>
  );
}

// --- SKELETON ---
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-black pt-40 px-6 max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div
          key={i}
          className="aspect-square bg-neutral-900/40 rounded-[2rem] animate-pulse border border-white/5"
        />
      ))}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <MenuGrid />
    </Suspense>
  );
}