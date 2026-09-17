import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StepCard from "./StepCard";

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
          type="number"
          min={MIN_QUANTITY}
          max={MAX_QUANTITY}
          value={quantity}
          onChange={(e) => {
            const parsed = parseInt(e.target.value, 10);
            onQuantityChange(Number.isNaN(parsed) ? MIN_QUANTITY : clamp(parsed));
          }}
          className="flex-1 bg-background-input"
        />
        <Button
          type="button"
          variant="secondary"
          size="icon"
          disabled={quantity >= MAX_QUANTITY}
          onClick={() => onQuantityChange(clamp(quantity + 1))}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="secondary"
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
