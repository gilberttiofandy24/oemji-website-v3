"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Minus, Plus, UserRoundCheck } from "lucide-react";
import { toast } from "sonner";
import NumberFlow from "@number-flow/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CheckoutData, PaymentMethodGroup } from "@/lib/backend";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/components/cart/cart-context";
import { useBuyNowStore } from "@/components/checkout/buy-now-store";
import { useCartCheckoutStore } from "@/components/checkout/cart-checkout-store";
import CheckoutPaymentPicker from "./CheckoutPaymentPicker";
import StepCard from "@/components/checkout/StepCard";

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 10;

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

interface CheckoutItem {
  key: string;
  denomId: string;
  productName: string;
  productImage: string | null;
  denomLabel: string;
  price: number;
  quantity: number;
  inputs: Record<string, string>;
  nickname?: string | null;
  onQuantityChange: (quantity: number) => void;
}

interface CheckoutFormProps {
  paymentMethodGroups: PaymentMethodGroup[];
}

const CheckoutForm = ({ paymentMethodGroups }: CheckoutFormProps) => {
  const router = useRouter();
  const {
    items: cartItems,
    isLoggedIn,
    authChecked,
    setQuantity: setCartQuantity,
    removeItem: removeCartItem,
  } = useCart();
  const buyNowItem = useBuyNowStore((state) => state.item);
  const setBuyNowItem = useBuyNowStore((state) => state.setItem);
  const clearBuyNow = useBuyNowStore((state) => state.clear);
  const cartCheckoutIds = useCartCheckoutStore((state) => state.ids);
  const clearCartCheckoutIds = useCartCheckoutStore((state) => state.clear);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [cartNicknames, setCartNicknames] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authChecked && !isLoggedIn && !buyNowItem) {
      router.push("/sign-in");
    }
  }, [authChecked, isLoggedIn, buyNowItem, router]);

  const didCheckoutRef = useRef(false);
  const hasSelection = Boolean(buyNowItem) || cartCheckoutIds.length > 0;
  useEffect(() => {
    if (!hasSelection && !didCheckoutRef.current) {
      router.replace("/cart");
    }
  }, [hasSelection, router]);

  const items: CheckoutItem[] = useMemo(() => {
    if (buyNowItem) {
      return [
        {
          key: "buy-now",
          denomId: buyNowItem.denomId,
          productName: buyNowItem.productName,
          productImage: buyNowItem.productImage,
          denomLabel: buyNowItem.denomLabel,
          price: buyNowItem.price,
          quantity: buyNowItem.quantity,
          inputs: buyNowItem.inputs,
          nickname: buyNowItem.nickname ?? null,
          onQuantityChange: (quantity: number) => setBuyNowItem({ ...buyNowItem, quantity }),
        },
      ];
    }

    const ids = new Set(cartCheckoutIds);
    return cartItems
      .filter((item) => ids.has(item.id))
      .map((item) => ({
        key: item.id,
        denomId: item.denomId,
        productName: item.productName,
        productImage: item.productImage,
        denomLabel: item.denomLabel,
        price: item.price,
        quantity: item.quantity,
        inputs: item.inputs,
        nickname: cartNicknames[item.id] ?? null,
        onQuantityChange: (quantity: number) => setCartQuantity(item.id, quantity),
      }));
  }, [buyNowItem, cartItems, cartCheckoutIds, cartNicknames, setBuyNowItem, setCartQuantity]);

  useEffect(() => {
    if (buyNowItem) return;
    const ids = new Set(cartCheckoutIds);
    const targets = cartItems.filter((item) => ids.has(item.id) && !(item.id in cartNicknames));
    if (targets.length === 0) return;

    let cancelled = false;
    (async () => {
      for (const item of targets) {
        try {
          const res = await fetch("/api/order/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product_denom_id: item.denomId, inputs: item.inputs }),
          });
          if (!res.ok || cancelled) continue;
          const body = await res.json();
          if (body.data?.nickname) {
            setCartNicknames((prev) => ({ ...prev, [item.id]: body.data.nickname }));
          }
        } catch {
          // silently skip — nickname is a nice-to-have, not a blocker
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyNowItem, cartItems, cartCheckoutIds]);

  const selectedMethod = paymentMethodGroups
    .flatMap((group) => group.methods)
    .find((method) => method.id === selectedMethodId);

  const discountAmount = buyNowItem?.discountAmount ?? 0;
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const priceAfterDiscount = Math.max(0, subtotal - discountAmount);
  const feeFlat = selectedMethod ? Math.round(Number(selectedMethod.fee_flat)) : 0;
  const feePercent = selectedMethod ? Number(selectedMethod.fee_percent) : 0;
  const total = selectedMethod
    ? Math.round(priceAfterDiscount + feeFlat + (priceAfterDiscount * feePercent) / 100)
    : priceAfterDiscount;

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error("Gak ada item buat di-checkout");
      return;
    }
    if (!selectedMethod) {
      toast.error("Pilih metode pembayaran terlebih dahulu");
      return;
    }
    if (!/^08[0-9]{8,11}$/.test(phoneNumber)) {
      toast.error("Isi nomor WhatsApp yang valid terlebih dahulu");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/order/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            product_denom_id: item.denomId,
            inputs: item.inputs,
            quantity: item.quantity,
          })),
          payment_method_id: selectedMethodId,
          phone_number: phoneNumber,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.message ?? "Checkout gagal");
        return;
      }

      const data: CheckoutData = body.data;
      try {
        sessionStorage.setItem(
          `checkout:${data.ref_id}`,
          JSON.stringify({
            paymentMethodName: selectedMethod.name,
            items: items.map((item) => ({
              productName: item.productName,
              productImage: item.productImage,
              denomLabel: item.denomLabel,
            })),
          }),
        );
      } catch {
        // sessionStorage unavailable — payment page falls back to backend-only data
      }

      didCheckoutRef.current = true;
      if (!buyNowItem) {
        for (const id of cartCheckoutIds) {
          removeCartItem(id);
        }
      }
      clearBuyNow();
      clearCartCheckoutIds();
      router.push(`/payment/${data.ref_id}`);
    } catch {
      toast.error("Checkout gagal, coba lagi");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hasSelection || items.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px] lg:items-start">
      <div className="flex flex-col gap-4">
        <StepCard step={1} title="Nomor WhatsApp">
          <Input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            placeholder="08xxxxxxxxxx"
            className="h-9"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">*Nomor ini dipakai jika terjadi kendala.</p>
        </StepCard>

        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.key} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                {item.productImage && (
                  <Image src={item.productImage} alt={item.productName} fill unoptimized className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{item.productName}</p>
                <p className="truncate text-xs text-muted-foreground">{Object.values(item.inputs).join(" | ")}</p>
                {item.nickname && (
                  <p className="flex items-center gap-1 truncate text-xs text-primary">
                    <UserRoundCheck className="size-3 shrink-0" />
                    {item.nickname}
                  </p>
                )}
                <p className="truncate text-xs text-muted-foreground">
                  {item.denomLabel.replace(new RegExp(`^${escapeRegExp(item.productName)}\\s*`, "i"), "")} ·{" "}
                  {formatCurrency(item.price)} x{item.quantity}
                </p>
                <p className="truncate text-xs font-semibold">
                  Subtotal: {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  type="button"
                  variant="default"
                  size="icon"
                  className="size-7"
                  disabled={item.quantity <= MIN_QUANTITY}
                  onClick={() => item.onQuantityChange(Math.max(MIN_QUANTITY, item.quantity - 1))}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-5 text-center text-sm font-medium">{item.quantity}</span>
                <Button
                  type="button"
                  variant="default"
                  size="icon"
                  className="size-7"
                  disabled={item.quantity >= MAX_QUANTITY}
                  onClick={() => item.onQuantityChange(Math.min(MAX_QUANTITY, item.quantity + 1))}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:sticky lg:top-20">
        <StepCard step={2} title="Pilih Metode Pembayaran">
          <CheckoutPaymentPicker
            groups={paymentMethodGroups}
            selectedMethodId={selectedMethodId}
            onSelect={setSelectedMethodId}
            basePrice={priceAfterDiscount}
          />
        </StepCard>

        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-lg">
          <p className="text-sm font-semibold">Ringkasan Pesanan</p>
          <div className="flex flex-col gap-2.5">
            {items.map((item) => (
              <div key={item.key} className="flex flex-col gap-0.5">
                <p className="truncate text-xs font-semibold">{item.productName}</p>
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="truncate">
                    {item.denomLabel.replace(new RegExp(`^${escapeRegExp(item.productName)}\\s*`, "i"), "")} x
                    {item.quantity}
                  </span>
                  <span className="shrink-0 font-medium text-foreground">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1 border-t border-border pt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Diskon</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            {selectedMethod && (feeFlat > 0 || feePercent > 0) && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Biaya Admin ({selectedMethod.name})</span>
                <span>
                  {formatCurrency(feeFlat + Math.round((priceAfterDiscount * feePercent) / 100))}
                </span>
              </div>
            )}
            <div className="mt-1 flex items-center justify-between text-sm font-semibold">
              <span>Total</span>
              <NumberFlow value={total} locales="id-ID" format={{ maximumFractionDigits: 0 }} prefix="IDR " />
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Memproses..." : "Bayar Sekarang"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
