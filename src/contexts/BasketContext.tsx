"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getStorageItem, setStorageItem } from "@/lib/storage";
import type { Product } from "@/types/product";

const BASKET_KEY = "cosmetics_basket";

export interface BasketItem {
  productId: string;
  quantity: number;
  addedAt: number;
}

type BasketContextValue = {
  basket: BasketItem[];
  addToBasket: (product: Product, quantity?: number) => boolean;
  removeFromBasket: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearBasket: () => void;
  getItemQuantity: (productId: string) => number;
  totalItems: number;
};

const BasketContext = createContext<BasketContextValue | undefined>(undefined);

export function BasketProvider({ children }: { children: React.ReactNode }) {
  const [basket, setBasket] = useState<BasketItem[]>([]);

  useEffect(() => {
    const stored = getStorageItem(BASKET_KEY);
    if (stored) {
      try {
        setBasket(JSON.parse(stored));
      } catch {
        setBasket([]);
      }
    }
  }, []);

  const persist = useCallback((nextBasket: BasketItem[]) => {
    setBasket(nextBasket);
    setStorageItem(BASKET_KEY, JSON.stringify(nextBasket));
  }, []);

  const addToBasket = useCallback((product: Product, quantity = 1) => {
    if (!Number.isFinite(product.price) || product.price <= 0) return false;

    const productId = product.id;
    const existingIndex = basket.findIndex((item) => item.productId === productId);
    let updated: BasketItem[];
    if (existingIndex >= 0) {
      updated = [...basket];
      updated[existingIndex] = { ...updated[existingIndex], quantity: updated[existingIndex].quantity + quantity };
    } else {
      updated = [...basket, { productId, quantity, addedAt: Date.now() }];
    }
    persist(updated);
    return true;
  }, [basket, persist]);

  const removeFromBasket = useCallback((productId: string) => {
    persist(basket.filter((item) => item.productId !== productId));
  }, [basket, persist]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromBasket(productId);
      return;
    }
    persist(basket.map((item) => (item.productId === productId ? { ...item, quantity } : item)));
  }, [basket, persist, removeFromBasket]);

  const clearBasket = useCallback(() => {
    persist([]);
  }, [persist]);

  const getItemQuantity = useCallback((productId: string) => {
    const item = basket.find((entry) => entry.productId === productId);
    return item ? item.quantity : 0;
  }, [basket]);

  const totalItems = useMemo(() => basket.reduce((sum, item) => sum + item.quantity, 0), [basket]);

  return (
    <BasketContext.Provider
      value={{ basket, addToBasket, removeFromBasket, updateQuantity, clearBasket, getItemQuantity, totalItems }}
    >
      {children}
    </BasketContext.Provider>
  );
}

export function useBasket() {
  const context = useContext(BasketContext);
  if (!context) throw new Error("useBasket must be used within BasketProvider");
  return context;
}
