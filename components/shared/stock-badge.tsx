import React from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { isLowStock as checkLowStock } from "@/constants/stock";
import { useProductTotalQuantity } from "../providers/cart.provider";

export const StockBadge: React.FC<{
  productId: string;
  stock: number;
  className?: string;
  showRemainingStocks?: boolean;
}> = ({ productId, stock, className, showRemainingStocks = false }) => {
  const quantityInCart = useProductTotalQuantity(productId);

  const isAtMax = quantityInCart >= stock && stock > 0;
  const lowStock = checkLowStock(stock);

  if (isAtMax) {
    return (
      <Badge variant="secondary" className={cn(className)}>
        Maximum quantity reached
      </Badge>
    );
  }

  if (lowStock) {
    return (
      <Badge variant="destructive" className={cn(className)}>
        Only ({stock}) left in stock
      </Badge>
    );
  }

  if (showRemainingStocks) {
    return (
      <Badge variant="default" className={cn(className)}>
        Stock available ({stock})
      </Badge>
    );
  }

  return null;
};
