"use client";

import { BadgeCheck } from "@/components/animate-ui/icons/badge-check";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface CheckoutConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  denomLabel: string;
  paymentMethodName: string;
  promoCode?: { code: string; discountAmount: number } | null;
  onConfirm: () => void;
}

const CheckoutConfirmDialog = ({
  open,
  onOpenChange,
  productName,
  denomLabel,
  paymentMethodName,
  promoCode,
  onConfirm,
}: CheckoutConfirmDialogProps) => {
  const [agreed, setAgreed] = useState(true);

  const rows = [
    { label: "Item", value: denomLabel },
    { label: "Produk", value: productName },
    { label: "Pembayaran", value: paymentMethodName },
    ...(promoCode ? [{ label: "Kode Promo", value: promoCode.code, badge: true }] : []),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 450, damping: 25 }}
          className="flex flex-col gap-5"
        >
          <DialogHeader className="items-center text-center">
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: [0.5, 1.15, 0.9, 1.05, 1] }}
              transition={{ duration: 0.6, times: [0, 0.4, 0.6, 0.8, 1] }}
              className="mb-1 flex size-25 items-center justify-center rounded-full bg-primary"
            >
              <BadgeCheck
                size={40}
                className="text-primary-foreground"
                animate={"path"}
                animateOnHover
                delay={300}
              />
            </motion.div>
            <DialogTitle className="text-lg">Buat Pesanan</DialogTitle>
            <DialogDescription>
              Pastikan data akun kamu dan produk yang kamu pilih valid dan sesuai.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 rounded-lg border border-border bg-card-secondary p-3">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">{row.label}</span>
                {row.badge ? (
                  <Badge variant="default">{row.value}</Badge>
                ) : (
                  <span className="truncate font-medium">{row.value}</span>
                )}
              </div>
            ))}
          </div>

          {promoCode && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <p className="text-xs text-green-700">
                <span className="font-semibold">Diskon diterapkan:</span>{" "}
                {formatCurrency(promoCode.discountAmount)}
              </p>
            </div>
          )}

          <label className="flex cursor-pointer items-start gap-2 text-xs text-muted-foreground">
            <Checkbox
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
              className="mt-0.5"
            />
            <span>
              Dengan mengklik <span className="text-primary">Pesan Sekarang</span>, kamu sudah
              menyetujui{" "}
              <Link
                href="/terms"
                target="_blank"
                onClick={(event) => event.stopPropagation()}
                className="text-primary underline underline-offset-2"
              >
                Syarat &amp; Ketentuan
              </Link>{" "}
              yang berlaku
            </span>
          </label>

          <div className="mx-0 mb-0 flex-row rounded-none border-t border-border bg-transparent p-0 flex gap-2">
            <Button
              className="flex-1 bg-background-input hover:bg-background-input/80"
              onClick={() => onOpenChange(false)}
            >
              Batalkan
            </Button>
            <Button className="flex-1" disabled={!agreed} onClick={onConfirm}>
              Pesan Sekarang!
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutConfirmDialog;
