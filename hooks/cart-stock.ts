"use client";

import { useEffect, useState, useCallback, useMemo } from "react";

import { client } from "@/sanity/lib/client";
import { QUERY_PRODUCT_BY_IDS } from "@/sanity/queries/product.query";
import { CartItem } from "@/store/cart.store";

export interface StockInfo {
  productId: string;
  currentStock: number;
  isOutOfStock: boolean;
  exceedsStock: boolean;
  availableQuantity: number;
}

export type StockMap = Map<string, StockInfo>;

interface UseCartStockReturn {
  stockMap: StockMap;
  isLoading: boolean;
  hasStockIssues: boolean;
  refetch: () => void;
}

/**
 * Fetches current stock levels for cart items
 * Returns stock info map and loading state
 */
export function useCartStock(items: CartItem[]): UseCartStockReturn {
  const [stockMap, setStockMap] = useState<StockMap>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  // Memoize product IDs to use as stable dependency
  const productIds = useMemo(
    () => items.map((item) => item.productId),
    [items],
  );

  const fetchStock = useCallback(async () => {
    if (items.length === 0) {
      setStockMap(new Map());
      return;
    }

    setIsLoading(true);

    try {
      const products = await client.fetch(QUERY_PRODUCT_BY_IDS, {
        ids: productIds,
      });

      const newStockMap = new Map<string, StockInfo>();
      const productQuantities = new Map<string, number>();

      // Calculate total quantity per product
      for (const item of items) {
        const current = productQuantities.get(item.productId) || 0;
        productQuantities.set(item.productId, current + item.quantity);
      }

      for (const item of items) {
        // If we already processed this product (and stockMap is keyed by productId), we might overwrite.
        // But stockMap should report status for the PRODUCT.
        // Wait, if I have 2 variants, both map to same productId.
        // stockMap.set(productId, ...) will overwrite.
        // So I should iterate unique productIds or ensure consistent status.

        // Actually, the status (isOutOfStock, exceedsStock) depends on the TOTAL quantity.
        // So it is the same for all variants of that product.

        const product = products.find(
          (p: { _id: string }) => p._id === item.productId,
        );
        const currentStock = product?.stock ?? 0;
        const totalQuantity = productQuantities.get(item.productId) || 0;

        newStockMap.set(item.productId, {
          productId: item.productId,
          currentStock,
          isOutOfStock: currentStock === 0,
          exceedsStock: totalQuantity > currentStock,
          availableQuantity: Math.max(
            0,
            currentStock - (totalQuantity - item.quantity),
          ), // approximate?
          // availableQuantity is tricky if multiple variants.
          // If I have 3 S and 3 M. Stock 5.
          // Total 6. Exceeds.
          // availableQuantity?
          // This field might be used to show "Only X left".
          // If we show "Only 5 left" on both lines, it's fine.
        });
      }

      setStockMap(newStockMap);
    } catch (error) {
      console.error("Failed to fetch stock:", error);
    } finally {
      setIsLoading(false);
    }
  }, [items, productIds]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStock();
  }, [fetchStock]);

  const hasStockIssues = Array.from(stockMap.values()).some(
    (info) => info.isOutOfStock || info.exceedsStock,
  );

  return {
    stockMap,
    isLoading,
    hasStockIssues,
    refetch: fetchStock,
  };
}
