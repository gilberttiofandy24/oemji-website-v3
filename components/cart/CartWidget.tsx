"use client";

import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "./cart-context";

const MotionLink = motion.create(Link);

const FLOAT_BUTTON_CLASS =
  "fixed right-6 bottom-6 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-foreground shadow-lg";
const FLOAT_HOVER = { scale: 1.15, rotate: -8 };
const FLOAT_TRANSITION = { type: "spring", stiffness: 400, damping: 15 } as const;

export function CartWidget() {
  const { items, isLoggedIn, removeItem, setQuantity } = useCart();
  const [open, setOpen] = useState(false);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.length;

  const handleCheckout = () => {
    setOpen(false);
    toast.info("Checkout keranjang belum tersedia di storefront ini — segera hadir.");
  };

  if (!isLoggedIn) {
    return (
      <MotionLink
        href="/sign-in"
        whileHover={FLOAT_HOVER}
        transition={FLOAT_TRANSITION}
        className={FLOAT_BUTTON_CLASS}
      >
        <ShoppingCart className="h-5 w-5" />
      </MotionLink>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <motion.button
          type="button"
          whileHover={FLOAT_HOVER}
          transition={FLOAT_TRANSITION}
          className={FLOAT_BUTTON_CLASS}
        >
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge variant="secondary" className="absolute -top-1 -right-1">
              {itemCount}
            </Badge>
          )}
        </motion.button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Keranjang ({items.length})</SheetTitle>
          <SheetDescription>Review item kamu, lalu checkout sekaligus.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-3 overflow-y-auto px-4">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Keranjang masih kosong — tambahin dari halaman produk.
            </p>
          )}
          {items.map((item) => (
            <div
              key={item.id}
              className="relative flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
            >
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>

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
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="space-y-3 border-t border-border p-4">
            <div className="flex items-center justify-between text-sm font-medium">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <Button asChild variant="secondary" className="w-full text-foreground" onClick={() => setOpen(false)}>
              <Link href="/cart">Lihat Halaman Keranjang</Link>
            </Button>
            <Button className="w-full" onClick={handleCheckout}>
              Checkout {itemCount} item
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
