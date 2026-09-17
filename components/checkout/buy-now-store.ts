import { create } from "zustand";

export interface BuyNowItem {
  productName: string;
  productImage: string | null;
  denomId: string;
  denomLabel: string;
  price: number;
  quantity: number;
  inputs: Record<string, string>;
  promoCode?: string;
  discountAmount?: number;
  nickname?: string;
  region?: string | null;
}

interface BuyNowState {
  item: BuyNowItem | null;
  setItem: (item: BuyNowItem) => void;
  clear: () => void;
}

export const useBuyNowStore = create<BuyNowState>((set) => ({
  item: null,
  setItem: (item) => set({ item }),
  clear: () => set({ item: null }),
}));
