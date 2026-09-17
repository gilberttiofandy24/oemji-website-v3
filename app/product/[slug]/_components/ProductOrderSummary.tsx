import { Button } from "@/components/ui/button";
import NumberFlow from "@number-flow/react";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface ProductOrderSummaryProps {
  denomLabel: string;
  paymentMethodName: string | null;
  feeLabel: string | null;
  basePrice: number;
  discountAmount: number;
  total: number;
  isSubmitting: boolean;
  canCheckout: boolean;
  onAddToCart: () => void;
}

const ProductOrderSummary = ({
  denomLabel,
  paymentMethodName,
  feeLabel,
  basePrice,
  discountAmount,
  total,
  isSubmitting,
  canCheckout,
  onAddToCart,
}: ProductOrderSummaryProps) => {
  const [displayTotal, setDisplayTotal] = useState(0);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplayTotal(total);
  }, [total]);

  return (
    <div className="sticky bottom-3 z-10 flex items-center justify-between gap-4 rounded-xl border border-border bg-background p-4 shadow-lg">
      <div className="flex flex-col gap-1 overflow-hidden">
        <p className="truncate text-sm font-semibold">{denomLabel}</p>
        <div className="flex items-center gap-1.5 overflow-hidden text-xs text-muted-foreground">
          <span className="min-w-0 truncate">
            {paymentMethodName ?? "Belum pilih pembayaran"}
            {feeLabel && <span className="text-muted-foreground/70"> ({feeLabel})</span>}
          </span>
          <span className="shrink-0">·</span>
          <span className="flex shrink-0 items-center gap-1">
            {discountAmount > 0 && (
              <>
                <span className="line-through text-muted-foreground/60">
                  {formatCurrency(basePrice)}
                </span>
                <span>-{formatCurrency(discountAmount)}</span>
              </>
            )}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-foreground mt-1">
          <span>Total: IDR</span>
          <NumberFlow value={displayTotal} locales="id-ID" format={{ maximumFractionDigits: 0 }} />
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button
          type="button"
          variant="secondary"
          className="rounded-lg text-sm font-semibold text-foreground"
          onClick={onAddToCart}
        >
          Masukin Keranjang
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !canCheckout}
          className="rounded-lg bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {isSubmitting ? "Memproses..." : "Bayar Sekarang"}
        </Button>
      </div>
    </div>
  );
};

export default ProductOrderSummary;
