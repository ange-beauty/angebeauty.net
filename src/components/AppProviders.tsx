"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { BasketProvider } from "@/contexts/BasketContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { SellingPointProvider } from "@/contexts/SellingPointContext";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SellingPointProvider>
        <AuthProvider>
          <FavoritesProvider>
            <BasketProvider>{children}</BasketProvider>
          </FavoritesProvider>
        </AuthProvider>
      </SellingPointProvider>
    </QueryClientProvider>
  );
}
