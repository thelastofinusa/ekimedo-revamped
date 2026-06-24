"use client";

import { useEffect, useState, useMemo, useRef } from "react";

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
  const isMounted = useRef(true);

  // Memoize product IDs to use as stable dependency
  const productIds = useMemo(
    () => items.map((item) => item.productId),
    [items],
  );

  // Refetch function (exposed to the user)
  const refetch = async () => {
    if (items.length === 0) {
      if (isMounted.current) {
        setStockMap(new Map());
        setIsLoading(false);
      }
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
          ),
        });
      }

      if (isMounted.current) {
        setStockMap(newStockMap);
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Failed to fetch stock:", error);
      }
      if (isMounted.current) {
        setStockMap(new Map());
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();

    return () => {
      isMounted.current = false;
    };
  }, [items, productIds]);

  const hasStockIssues = Array.from(stockMap.values()).some(
    (info) => info.isOutOfStock || info.exceedsStock,
  );

  return {
    stockMap,
    isLoading,
    hasStockIssues,
    refetch,
  };
}
