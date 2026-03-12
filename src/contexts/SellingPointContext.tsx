"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getStorageItem, setStorageItem, removeStorageItem } from "@/lib/storage";
import { withClientSourceHeader } from "@/lib/requestHeaders";

const SELECTED_SELLING_POINT_KEY = "selected_selling_point";


export interface SellingPoint {
  id: string;
  name_ar?: string | null;
  name_en?: string | null;
  city?: string | null;
  country?: string | null;
}

type SellingPointContextValue = {
  sellingPoints: SellingPoint[];
  selectedSellingPoint: SellingPoint | null;
  selectedSellingPointId: string;
  setSelectedSellingPointId: (id: string) => Promise<void>;
  isLoadingSellingPoints: boolean;
};

const SellingPointContext = createContext<SellingPointContextValue | undefined>(undefined);

export function SellingPointProvider({ children }: { children: React.ReactNode }) {
  const [selectedSellingPointId, setSelectedSellingPointId] = useState<string>("");

  const sellingPointsQuery = useQuery({
    queryKey: ["selling-points"],
    queryFn: async (): Promise<SellingPoint[]> => {
      const query = new URLSearchParams({ is_active: "true", is_sales_enabled: "true" });
      const response = await fetch(`/api/v1/selling-points?${query.toString()}`, {
        method: "GET",
        headers: withClientSourceHeader({
          Accept: "application/json",
          "Content-Type": "application/json",
        }),
      });

      if (!response.ok) return [];
      const result = await response.json();
      if (!result || !Array.isArray(result.data)) return [];

      return result.data
        .filter((point: any) => point && point.id)
        .map((point: any) => ({
          id: point.id?.toString(),
          name_ar: point.name_ar ?? null,
          name_en: point.name_en ?? null,
          city: point.city ?? null,
          country: point.country ?? null,
        }));
    },
  });

  useEffect(() => {
    const stored = getStorageItem(SELECTED_SELLING_POINT_KEY);
    if (stored) {
      setSelectedSellingPointId(stored);
    }
  }, []);

  const setSelectedSellingPointIdAndPersist = useCallback(async (id: string) => {
    setSelectedSellingPointId(id);
    if (id) {
      setStorageItem(SELECTED_SELLING_POINT_KEY, id);
    } else {
      removeStorageItem(SELECTED_SELLING_POINT_KEY);
    }
  }, []);

  const sellingPoints = sellingPointsQuery.data || [];
  const selectedSellingPoint = sellingPoints.find((point) => point.id === selectedSellingPointId) || null;

  const value = useMemo(
    () => ({
      sellingPoints,
      selectedSellingPoint,
      selectedSellingPointId,
      setSelectedSellingPointId: setSelectedSellingPointIdAndPersist,
      isLoadingSellingPoints: sellingPointsQuery.isLoading,
    }),
    [sellingPoints, selectedSellingPoint, selectedSellingPointId, setSelectedSellingPointIdAndPersist, sellingPointsQuery.isLoading],
  );

  return <SellingPointContext.Provider value={value}>{children}</SellingPointContext.Provider>;
}

export function useSellingPoint() {
  const context = useContext(SellingPointContext);
  if (!context) throw new Error("useSellingPoint must be used within SellingPointProvider");
  return context;
}

