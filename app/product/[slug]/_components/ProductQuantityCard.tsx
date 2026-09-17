import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StepCard from "@/components/checkout/StepCard";

interface ProductQuantityCardProps {
  step: number;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 10;

const clamp = (value: number) => Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, value));

const ProductQuantityCard = ({ step, quantity, onQuantityChange }: ProductQuantityCardProps) => {
  return (
    <StepCard step={step} title="Masukkan Jumlah Pembelian">
      <div className="flex items-center gap-2">
        <Input
          type="text"
          inputMode="numeric"
          value={quantity}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "");
            if (!digits) {
              onQuantityChange(MIN_QUANTITY);
              return;
            }
            onQuantityChange(clamp(parseInt(digits, 10)));
          }}
          className="flex-1 bg-background-input"
        />
        <Button
          type="button"
          variant="default"
          size="icon"
          disabled={quantity >= MAX_QUANTITY}
          onClick={() => onQuantityChange(clamp(quantity + 1))}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="default"
          size="icon"
          disabled={quantity <= MIN_QUANTITY}
          onClick={() => onQuantityChange(clamp(quantity - 1))}
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>
    </StepCard>
  );
};

export default ProductQuantityCard;
