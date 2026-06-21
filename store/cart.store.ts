import { createStore } from "zustand/vanilla";
import { persist } from "zustand/middleware";

import { CART_STORAGE_KEY } from "@/constants/keys";

// Types
export interface CartItem {
  itemId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  selectedSize?: string;
  selectedColor?: string;
}

export interface CartState {
  items: CartItem[];
}

export interface CartActions {
  addItem: (
    item: Omit<CartItem, "quantity" | "itemId"> & { itemId?: string },
    quantity?: number,
  ) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

export type CartStore = CartState & CartActions;

// Default state
export const defaultInitState: CartState = {
  items: [],
};

/**
 * Cart store factory - creates new store instance per provider
 * Uses persist middleware with skipHydration for Next.js SSR compatibility
 * @see https://zustand.docs.pmnd.rs/guides/nextjs#hydration-and-asynchronous-storages
 */
export const createCartStore = (initState: CartState = defaultInitState) => {
  return createStore<CartStore>()(
    persist(
      (set) => ({
        ...initState,

        addItem: (item, quantity = 1) =>
          set((state) => {
            const itemId =
              item.itemId ||
              `${item.productId}-${item.selectedSize || ""}-${
                item.selectedColor || ""
              }`;

            const existing = state.items.find((i) => i.itemId === itemId);
            if (existing) {
              return {
                items: state.items.map((i) =>
                  i.itemId === itemId
                    ? { ...i, quantity: i.quantity + quantity }
                    : i,
                ),
              };
            }
            return {
              items: [...state.items, { ...item, itemId, quantity }],
            };
          }),

        removeItem: (itemId) =>
          set((state) => ({
            items: state.items.filter((i) => i.itemId !== itemId),
          })),

        updateQuantity: (itemId, quantity) =>
          set((state) => {
            if (quantity <= 0) {
              return {
                items: state.items.filter((i) => i.itemId !== itemId),
              };
            }
            return {
              items: state.items.map((i) =>
                i.itemId === itemId ? { ...i, quantity } : i,
              ),
            };
          }),

        clearCart: () => set({ items: [] }),
      }),
      {
        name: CART_STORAGE_KEY,
        // Skip automatic hydration - we'll trigger it manually on the client
        skipHydration: true,
        // Only persist items, not UI state like isOpen
        partialize: (state) => ({ items: state.items }),
      },
    ),
  );
};
