import { create } from "zustand";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

interface POSState {
  cart: CartItem[];
  addItem: (item: Omit<CartItem, "qty">) => void;
  increaseQty: (id: string) => void;
  decreaseQty: (id: string) => void;
  removeItem: (id: string) => void;
  clear: () => void;
}

export const usePOSStore = create<POSState>((set) => ({
  cart: [],

  addItem: (item) =>
    set((state) => {
      const existing = state.cart.find((i) => i.id === item.id);

      if (existing) {
        return {
          cart: state.cart.map((i) =>
            i.id === item.id ? { ...i, qty: i.qty + 1 } : i,
          ),
        };
      }

      return {
        cart: [...state.cart, { ...item, qty: 1 }],
      };
    }),

  increaseQty: (id) =>
    set((state) => ({
      cart: state.cart.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)),
    })),

  decreaseQty: (id) =>
    set((state) => ({
      cart: state.cart
        .map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0),
    })),

  removeItem: (id) =>
    set((state) => ({
      cart: state.cart.filter((i) => i.id !== id),
    })),

  clear: () => set({ cart: [] }),
}));
