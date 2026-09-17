import { create } from "zustand";

interface CartCheckoutState {
  ids: string[];
  setIds: (ids: string[]) => void;
  clear: () => void;
}

export const useCartCheckoutStore = create<CartCheckoutState>((set) => ({
  ids: [],
  setIds: (ids) => set({ ids }),
  clear: () => set({ ids: [] }),
}));
