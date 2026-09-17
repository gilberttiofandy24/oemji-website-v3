"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import StepCard from "@/components/checkout/StepCard";

interface ProductPromoCodeCardProps {
  step: number;
  productId: string;
  productSupplierId: string;
  subtotal: number;
  onPromoApplied?: (promo: { code: string; discountAmount: number } | null) => void;
}

interface AppliedPromo {
  code: string;
  discountAmount: number;
  finalAmount: number;
}

async function validatePromoCode(payload: { code: string; product_id: string; subtotal: string }) {
  const res = await fetch("/api/promo-code/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Kode promo tidak valid");
  }
  return res.json();
}

const ProductPromoCodeCard = ({
  step,
  productId,
  productSupplierId,
  subtotal,
  onPromoApplied,
}: ProductPromoCodeCardProps) => {
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);

  const validateMutation = useMutation({
    mutationFn: validatePromoCode,
    onSuccess: (response) => {
      const promo: AppliedPromo = {
        code: response.data.code,
        discountAmount: Number(response.data.discount_amount),
        finalAmount: Number(response.data.final_amount),
      };
      setAppliedPromo(promo);
      onPromoApplied?.({ code: promo.code, discountAmount: promo.discountAmount });
      setPromoInput("");
      toast.success("Promo code berhasil diterapkan");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleValidatePromo = useCallback(() => {
    if (!promoInput.trim()) {
      toast.error("Masukkan kode promo terlebih dahulu");
      return;
    }
    if (!productSupplierId) {
      toast.error("Pilih nominal terlebih dahulu");
      return;
    }

    validateMutation.mutate({
      code: promoInput.trim().toUpperCase(),
      product_id: productId,
      subtotal: String(subtotal),
    });
  }, [promoInput, productId, productSupplierId, subtotal, validateMutation]);

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
    onPromoApplied?.(null);
  };

  return (
    <StepCard
      step={step}
      title="Kode Promo"
      subtitle="Gunakan kode promo untuk mendapatkan diskon"
    >
      {appliedPromo ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input value={appliedPromo.code} disabled className="flex-1" />
            <Button type="button" variant="secondary" className="h-8" onClick={handleRemovePromo}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Diskon: {formatCurrency(appliedPromo.discountAmount)}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Masukkan kode promo"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleValidatePromo();
                }
              }}
              disabled={validateMutation.isPending}
              className="flex-1"
            />
            <Button
              type="button"
              className="h-8"
              onClick={handleValidatePromo}
              disabled={!promoInput.trim() || !productSupplierId || validateMutation.isPending}
            >
              {validateMutation.isPending ? "Cek..." : "Cek"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            {productSupplierId
              ? "Belum punya kode promo? Abaikan dan lanjutkan checkout."
              : "Pilih nominal terlebih dahulu untuk pakai kode promo."}
          </p>
        </div>
      )}
    </StepCard>
  );
};

export default ProductPromoCodeCard;
