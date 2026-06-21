import React from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { isLowStock as checkLowStock } from "@/constants/stock";
import { useCartItem } from "../providers/cart.provider";

export const StockBadge: React.FC<{
  productId: string;
  stock: number;
  className?: string;
  showRemainingStocks?: boolean;
}> = ({ productId, stock, className, showRemainingStocks = false }) => {
  const cartItem = useCartItem(productId);

  const quantityInCart = cartItem?.quantity ?? 0;
  const isAtMax = quantityInCart >= stock && stock > 0;
  const lowStock = checkLowStock(stock);

  if (isAtMax) {
    return (
      <Badge
        variant="secondary"
        className={cn("w-fit bg-blue-100 text-blue-800", className)}
      >
        Max in cart
      </Badge>
    );
  }

  if (lowStock) {
    return (
      <Badge
        variant="secondary"
        className={cn("w-fit bg-amber-100 text-amber-800", className)}
      >
        Only {stock} left
      </Badge>
    );
  }

  if (showRemainingStocks) {
    return <Badge>{stock} available in stock</Badge>;
  }

  return null;
};
