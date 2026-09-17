"use client";

import { Controller, UseFormReturn } from "react-hook-form";
import type { PublicProductInputField } from "@/lib/backend";
import type { CheckoutFormValues } from "./ProductOrderForm";
import StepCard from "./StepCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductInputCardProps {
  form: UseFormReturn<CheckoutFormValues>;
  step: number;
  fields: PublicProductInputField[];
}

const ProductInputCard = ({ form, step, fields }: ProductInputCardProps) => {
  return (
    <StepCard step={step} title="Masukkan Data Akun">
      <div className="grid grid-cols-2 gap-4">
        {fields.map((inputField) => (
          <Controller
            key={inputField.key}
            name={inputField.key}
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-1.5">
                <label htmlFor={inputField.key} className="text-xs">
                  {inputField.label}
                </label>
                {inputField.type === "select" ? (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id={inputField.key} className="w-full bg-background-input/70">
                      <SelectValue placeholder={`Pilih ${inputField.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {inputField.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    {...field}
                    id={inputField.key}
                    placeholder={inputField.label}
                    autoComplete={inputField.key}
                    className="bg-background-input"
                  />
                )}
                {fieldState.error && (
                  <span className="text-xs text-destructive">{fieldState.error.message}</span>
                )}
              </div>
            )}
          />
        ))}
      </div>
    </StepCard>
  );
};

export default ProductInputCard;
