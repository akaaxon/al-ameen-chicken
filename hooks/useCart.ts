"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/app/components/ProductCard";

export interface CartItem extends Product {
  quantity: number;
}

const LS_KEY = "chimkin_cart";

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Init cart
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Persist cart
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(LS_KEY, JSON.stringify(cart));
    }
  }, [cart, isMounted]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      if (exists) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;
          const qty = item.quantity + delta;
          if (qty <= 0) return null;
          return { ...item, quantity: qty };
        })
        .filter(Boolean) as CartItem[],
    );
  };

  const removeFromCart = (id: string) =>
    setCart((prev) => prev.filter((i) => i.id !== id));

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem(LS_KEY);
  };

  const cartTotal = useMemo(
    () => cart.reduce((a, i) => a + i.price * i.quantity, 0),
    [cart],
  );

  const cartCount = useMemo(
    () => cart.reduce((a, i) => a + i.quantity, 0),
    [cart],
  );

  return {
    cart,
    cartTotal,
    cartCount,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
  };
}
