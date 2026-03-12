"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getStorageItem, setStorageItem } from "@/lib/storage";

const FAVORITES_KEY = "cosmetics_favorites";

type FavoritesContextValue = {
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const stored = getStorageItem(FAVORITES_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch {
        setFavorites([]);
      }
    }
  }, []);

  const persist = useCallback((nextFavorites: string[]) => {
    setFavorites(nextFavorites);
    setStorageItem(FAVORITES_KEY, JSON.stringify(nextFavorites));
  }, []);

  const toggleFavorite = useCallback((productId: string) => {
    const updated = favorites.includes(productId)
      ? favorites.filter((id) => id !== productId)
      : [...favorites, productId];
    persist(updated);
  }, [favorites, persist]);

  const isFavorite = useCallback((productId: string) => favorites.includes(productId), [favorites]);

  return <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites must be used within FavoritesProvider");
  return context;
}
