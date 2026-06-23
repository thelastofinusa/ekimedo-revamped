"use client";

import { useEffect } from "react";
import { useCartActions } from "@/components/providers/cart.provider";

interface ClearCartOnSuccessProps {
  sessionId: string | string[];
  orderExists: boolean;
}

export function ClearCartOnSuccess({
  sessionId,
  orderExists,
}: ClearCartOnSuccessProps) {
  const { clearCart } = useCartActions();

  useEffect(() => {
    // Only clear if we have a session ID and the order exists (payment confirmed)
    if (sessionId && orderExists) {
      clearCart();
    }
  }, [sessionId, orderExists, clearCart]);

  return null;
}
