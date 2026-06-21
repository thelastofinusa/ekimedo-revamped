"use client";
import { useStore } from "zustand";
import {
  createContext,
  useState,
  useEffect,
  type ReactNode,
  useContext,
} from "react";
import {
  CartState,
  CartStore,
  createCartStore,
  defaultInitState,
} from "@/store/cart.store";

// Store API type
export type CartStoreApi = ReturnType<typeof createCartStore>;

// Context
const CartStoreContext = createContext<CartStoreApi | undefined>(undefined);

// Provider props
interface CartProviderProps {
  children: ReactNode;
  initialState?: CartState;
}

/**
 * Cart store provider - creates one store instance per provider
 * Manually triggers rehydration from localStorage on the client
 * Wrap your app/(app) layout with this provider
 * @see https://zustand.docs.pmnd.rs/guides/nextjs#hydration-and-asynchronous-storages
 */
export const CartProvider = ({ children, initialState }: CartProviderProps) => {
  const [store] = useState(() =>
    createCartStore(initialState ?? defaultInitState),
  );

  // Manually trigger rehydration on the client after mount
  // This is required to prevent SSR hydration mismatches since localStorage isn't available on server
  useEffect(() => {
    store.persist.rehydrate();
  }, [store]);

  return (
    <CartStoreContext.Provider value={store}>
      {children}
    </CartStoreContext.Provider>
  );
};

/**
 * Hook to access the cart store with a selector
 * Must be used within CartProvider
 * Handles SSR by returning default state until hydrated
 */
export const useCartStore = <T,>(selector: (store: CartStore) => T): T => {
  const cartStoreContext = useContext(CartStoreContext);

  if (!cartStoreContext) {
    throw new Error("useCartStore must be used within CartProvider");
  }

  return useStore(cartStoreContext, selector);
};

// ============================================
// Convenience Hooks
// ============================================

/**
 * Get all cart items
 */
export const useCartItems = () => useCartStore((state) => state.items);

/**
 * Get total number of items in cart
 */
export const useTotalItems = () =>
  useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );

/**
 * Get total price of cart
 */
export const useTotalPrice = () =>
  useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );

/**
 * Find a specific item in cart by itemId
 */
export const useCartItem = (itemId: string) =>
  useCartStore((state) => state.items.find((item) => item.itemId === itemId));

/**
 * Get total quantity of a product (all variants)
 */
export const useProductTotalQuantity = (productId: string) =>
  useCartStore((state) =>
    state.items
      .filter((item) => item.productId === productId)
      .reduce((sum, item) => sum + item.quantity, 0),
  );

/**
 * Get all cart actions
 * Actions are stable references from zustand, safe to destructure
 */
export const useCartActions = () => {
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  return {
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
};
