"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/components/cart/cart-context";

export default function CartPage() {
  const router = useRouter();
  const { items, isLoggedIn, authChecked, isLoading, removeItem, setQuantity } = useCart();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (authChecked && !isLoggedIn) {
      router.push("/sign-in");
    }
  }, [authChecked, isLoggedIn, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected(new Set(items.map((item) => item.id)));
  }, [items]);

  const toggleItem = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allSelected = items.length > 0 && selected.size === items.length;
  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(items.map((item) => item.id)));
  };

  const selectedItems = items.filter((item) => selected.has(item.id));
  const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("Pilih minimal 1 item buat checkout");
      return;
    }
    toast.info("Checkout keranjang belum tersedia di storefront ini — segera hadir.");
  };

  if (!authChecked || !isLoggedIn) return null;

  return (
    <div className="bg-background mt-15">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 pb-32 sm:px-6">
        <h1 className="text-xl font-semibold">Keranjang</h1>

        {isLoading ? (
          <p className="mt-8 text-sm text-muted-foreground">Memuat keranjang...</p>
        ) : items.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm text-muted-foreground">Keranjang kamu masih kosong.</p>
            <Button asChild>
              <Link href="/product">Belanja Sekarang</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-6 flex items-center gap-2">
              <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              <span className="text-sm font-medium">Pilih Semua ({items.length})</span>
            </div>

            <div className="mt-3 flex flex-col gap-3">
              {items.map((item) => (
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
          </>
        )}
      </div>

      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background p-4">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">{selectedItems.length} item dipilih</span>
              <span className="text-sm font-semibold">Total: {formatCurrency(total)}</span>
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
