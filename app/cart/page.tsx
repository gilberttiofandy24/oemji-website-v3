"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import { toast } from "sonner";
import NumberFlow from "@number-flow/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/utils";
import { useCart, type CartItem } from "@/components/cart/cart-context";
import { useCartCheckoutStore } from "@/components/checkout/cart-checkout-store";

const SELECTION_STORAGE_KEY = "oemji-cart-selected";

type SelectionMap = Record<string, boolean>;

function readStoredSelectionMap(): SelectionMap {
  try {
    const raw = localStorage.getItem(SELECTION_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function groupByProduct(items: CartItem[]) {
  const groups = new Map<string, CartItem[]>();
  for (const item of items) {
    const list = groups.get(item.productName) ?? [];
    list.push(item);
    groups.set(item.productName, list);
  }
  return Array.from(groups.entries()).map(([productName, groupItems]) => ({ productName, items: groupItems }));
}

export default function CartPage() {
  const router = useRouter();
  const { items, isLoggedIn, authChecked, isLoading, removeItem, setQuantity } = useCart();
  const setCartCheckoutIds = useCartCheckoutStore((state) => state.setIds);
  const knownSelectionRef = useRef<SelectionMap>({});
  const [hydrated, setHydrated] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (authChecked && !isLoggedIn) {
      router.push("/sign-in");
    }
  }, [authChecked, isLoggedIn, router]);

  useEffect(() => {
    knownSelectionRef.current = readStoredSelectionMap();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  const itemIdsKey = items
    .map((item) => item.id)
    .sort()
    .join(",");

  useEffect(() => {
    if (!hydrated) return;
    const map = knownSelectionRef.current;
    setSelected(() => {
      const next = new Set<string>();
      for (const item of items) {
        const isKnown = item.id in map;
        if (!isKnown) map[item.id] = false;
        if (map[item.id]) next.add(item.id);
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemIdsKey, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    for (const item of items) {
      knownSelectionRef.current[item.id] = selected.has(item.id);
    }
    try {
      localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(knownSelectionRef.current));
    } catch {
      // localStorage unavailable — selection just won't persist across reloads.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, hydrated]);

  const toggleItem = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGroup = (groupItems: CartItem[]) => {
    const groupSelected = groupItems.every((item) => selected.has(item.id));
    setSelected((prev) => {
      const next = new Set(prev);
      for (const item of groupItems) {
        if (groupSelected) next.delete(item.id);
        else next.add(item.id);
      }
      return next;
    });
  };

  const allSelected = items.length > 0 && items.every((item) => selected.has(item.id));
  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(items.map((item) => item.id)));
  };

  const selectedItems = items.filter((item) => selected.has(item.id));
  const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const groups = groupByProduct(items);

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("Pilih minimal 1 item buat checkout");
      return;
    }
    setCartCheckoutIds(selectedItems.map((item) => item.id));
    router.push("/checkout");
  };

  const handleDeleteSelected = () => {
    for (const item of selectedItems) {
      removeItem(item.id);
    }
    setSelected(new Set());
  };

  if (!authChecked || !isLoggedIn) return null;

  return (
    <div className="bg-background mt-15 flex min-h-screen flex-col">
      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          Keranjang
        </h1>

        {isLoading ? (
          <p className="mt-8 text-sm text-muted-foreground">Memuat keranjang...</p>
        ) : items.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm text-muted-foreground">Keranjang kamu masih kosong.</p>
            <Button asChild>
              <Link href="/">Belanja Sekarang</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                <span className="text-sm font-semibold">Pilih Semua</span>
              </div>
              {selectedItems.length > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="text-sm font-medium text-destructive hover:underline"
                >
                  Hapus
                </button>
              )}
            </div>

            {groups.map((group) => {
              const groupSelected = group.items.every((item) => selected.has(item.id));
              return (
                <div key={group.productName} className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={groupSelected} onCheckedChange={() => toggleGroup(group.items)} />
                    <span className="text-sm font-semibold">{group.productName}</span>
                  </div>

                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="relative flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
                    >
                      <Checkbox checked={selected.has(item.id)} onCheckedChange={() => toggleItem(item.id)} />

                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                        {item.productImage && (
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 pr-5">
                        <p className="truncate text-sm font-semibold">{item.productName}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {Object.values(item.inputs).join(" | ")}
                        </p>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <p className="truncate text-xs">
                            <span className="font-medium">{item.denomLabel}</span>{" "}
                            <span className="text-muted-foreground">{formatCurrency(item.price)}</span>
                          </p>
                          <div className="flex shrink-0 items-center gap-1.5">
                            <Button
                              type="button"
                              size="sm-icon"
                              disabled={item.quantity <= 1}
                              onClick={() => setQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-4 text-center text-sm font-semibold">{item.quantity}</span>
                            <Button
                              type="button"
                              size="sm-icon"
                              disabled={item.quantity >= 10}
                              onClick={() => setQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="sticky bottom-0 z-30 mt-6 border-t border-border bg-background p-4">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">{selectedItems.length} item dipilih</span>
              <span className="flex items-center gap-1 text-sm font-semibold">
                Total: IDR
                <NumberFlow value={total} locales="id-ID" format={{ maximumFractionDigits: 0 }} />
              </span>
            </div>
            <Button onClick={handleCheckout} className="shrink-0">
              Checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
