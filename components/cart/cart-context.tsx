"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface CartItem {
  id: string;
  denomId: string;
  productName: string;
  productImage: string | null;
  denomLabel: string;
  price: number;
  inputs: Record<string, string>;
  quantity: number;
}

interface AddCartItemInput {
  denomId: string;
  quantity: number;
  inputs: Record<string, string>;
}

interface CartContextValue {
  items: CartItem[];
  isLoading: boolean;
  isLoggedIn: boolean;
  authChecked: boolean;
  addItem: (item: AddCartItemInput) => Promise<void>;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  refreshAuth: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function hasLoggedInCookie() {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c.startsWith("oemji_logged_in="));
}

interface RawCartItem {
  id: string;
  product_denom_id: string;
  product_name: string;
  denom_name: string;
  image_url: string | null;
  sell_price: string;
  quantity: number;
  inputs: Record<string, string> | null;
}

async function fetchCart(): Promise<CartItem[]> {
  const res = await fetch("/api/cart");
  if (res.status === 401) return [];
  if (!res.ok) throw new Error("Gagal memuat keranjang");
  const body: { data?: RawCartItem[] } = await res.json();
  const data = body.data ?? [];
  return data.map((item) => ({
    id: item.id,
    denomId: item.product_denom_id,
    productName: item.product_name,
    productImage: item.image_url,
    denomLabel: item.denom_name,
    price: Number(item.sell_price),
    inputs: item.inputs ?? {},
    quantity: item.quantity,
  }));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoggedIn(hasLoggedInCookie());
    setAuthChecked(true);
  }, []);

  const refreshAuth = () => {
    setIsLoggedIn(hasLoggedInCookie());
    queryClient.invalidateQueries({ queryKey: ["cart"] });
  };

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: fetchCart,
    enabled: isLoggedIn,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["cart"] });

  const addMutation = useMutation({
    mutationFn: async (item: AddCartItemInput) => {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_denom_id: item.denomId,
          quantity: item.quantity,
          inputs: item.inputs,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Gagal menambah item");
      }
    },
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/cart/${id}`, { method: "DELETE" });
    },
    onSuccess: invalidate,
  });

  const quantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      await fetch(`/api/cart/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
    },
    onSuccess: invalidate,
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/cart", { method: "DELETE" });
    },
    onSuccess: invalidate,
  });

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        isLoggedIn,
        authChecked,
        addItem: (item) => addMutation.mutateAsync(item),
        removeItem: (id) => removeMutation.mutate(id),
        setQuantity: (id, quantity) => quantityMutation.mutate({ id, quantity: Math.max(1, Math.min(10, quantity)) }),
        clear: () => clearMutation.mutate(),
        refreshAuth,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
