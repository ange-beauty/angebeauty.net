"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getStorageItem, setStorageItem, removeStorageItem } from "@/lib/storage";
import { withClientSourceHeader } from "@/lib/requestHeaders";

const SELECTED_SELLING_POINT_KEY = "selected_selling_point";
const DEFAULT_SELLING_POINT_ID = "0fTUIooeOt-sp";
const EMPTY_SELLING_POINTS: SellingPoint[] = [];


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
  sellingPointsError: string | null;
};

const SellingPointContext = createContext<SellingPointContextValue | undefined>(undefined);

export function SellingPointProvider({ children }: { children: React.ReactNode }) {
  const [selectedSellingPointId, setSelectedSellingPointId] = useState<string>(DEFAULT_SELLING_POINT_ID);

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

      if (!response.ok) {
        throw new Error(`Selling points request failed with status ${response.status}`);
      }

      const result = await response.json();
      if (!result || !Array.isArray(result.data)) {
        throw new Error("Selling points response did not include a data list");
      }

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
    setStorageItem(SELECTED_SELLING_POINT_KEY, DEFAULT_SELLING_POINT_ID);
  }, []);

  const setSelectedSellingPointIdAndPersist = useCallback(async (id: string) => {
    setSelectedSellingPointId(id);
    if (id) {
      setStorageItem(SELECTED_SELLING_POINT_KEY, id);
    } else {
      removeStorageItem(SELECTED_SELLING_POINT_KEY);
    }
  }, []);

  const sellingPoints = sellingPointsQuery.data || EMPTY_SELLING_POINTS;
  const selectedSellingPoint =
    sellingPoints.find((point) => point.id === selectedSellingPointId) || {
      id: DEFAULT_SELLING_POINT_ID,
      name_ar: "مركز انج بيوتي حساب جديد",
      name_en: "",
    };
  const sellingPointsError =
    sellingPointsQuery.error instanceof Error ? sellingPointsQuery.error.message : null;

  const value = useMemo(
    () => ({
      sellingPoints,
      selectedSellingPoint,
      selectedSellingPointId,
      setSelectedSellingPointId: setSelectedSellingPointIdAndPersist,
      isLoadingSellingPoints: sellingPointsQuery.isLoading,
      sellingPointsError,
    }),
    [sellingPoints, selectedSellingPoint, selectedSellingPointId, setSelectedSellingPointIdAndPersist, sellingPointsQuery.isLoading, sellingPointsError],
  );

  return <SellingPointContext.Provider value={value}>{children}</SellingPointContext.Provider>;
}

export function useSellingPoint() {
  const context = useContext(SellingPointContext);
  if (!context) throw new Error("useSellingPoint must be used within SellingPointProvider");
  return context;
}

