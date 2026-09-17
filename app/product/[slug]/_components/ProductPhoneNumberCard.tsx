import { Controller, UseFormReturn } from "react-hook-form";
import type { CheckoutFormValues } from "./ProductOrderForm";
import StepCard from "./StepCard";
import { Input } from "@/components/ui/input";

interface ProductPhoneNumberCardProps {
  form: UseFormReturn<CheckoutFormValues>;
  step: number;
}

const ProductPhoneNumberCard = ({ form, step }: ProductPhoneNumberCardProps) => {
  return (
    <StepCard step={step} title="Nomor WhatsApp">
      <Controller
        name="phone_number"
        control={form.control}
        render={({ field, fieldState }) => (
          <div className="flex flex-col gap-1.5">
            <Input
              {...field}
              onChange={(event) => field.onChange(event.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              autoComplete="tel"
              placeholder="08xxxxxxxxxx"
              className="h-9 w-full rounded-md border border-border px-3 text-sm"
            />
            <p className="text-xs text-muted-foreground">
              *Nomor ini dipakai jika terjadi kendala.
            </p>
            {fieldState.error && (
              <span className="text-xs text-destructive">{fieldState.error.message}</span>
            )}
          </div>
        )}
      />
    </StepCard>
  );
};

export default ProductPhoneNumberCard;
