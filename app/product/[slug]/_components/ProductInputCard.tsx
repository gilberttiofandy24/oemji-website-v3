"use client";

import { useEffect, useState } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { Loader2, UserRoundCheck } from "lucide-react";
import type { PublicProductInputField } from "@/lib/backend";
import type { CheckoutFormValues } from "./ProductOrderForm";
import StepCard from "@/components/checkout/StepCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface AccountValidationResult {
  nickname: string;
  region: string | null;
}

interface ProductInputCardProps {
  form: UseFormReturn<CheckoutFormValues>;
  step: number;
  fields: PublicProductInputField[];
  productDenomId?: string;
  onResult?: (result: AccountValidationResult | null) => void;
}

const ProductInputCard = ({ form, step, fields, productDenomId, onResult }: ProductInputCardProps) => {
  const [result, setResult] = useState<AccountValidationResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // eslint-disable-next-line react-hooks/incompatible-library
  const values = form.watch();
  const inputsKey = fields.map((f) => values[f.key] ?? "").join("|");

  useEffect(() => {
    setResult(null);
    onResult?.(null);
    setIsChecking(false);
    if (!productDenomId) return;
    if (!fields.every((f) => (values[f.key] ?? "").trim())) return;

    const inputs: Record<string, string> = {};
    for (const f of fields) inputs[f.key] = values[f.key];

    setIsChecking(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch("/api/order/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_denom_id: productDenomId, inputs }),
        });
        if (!res.ok) return;
        const body = await res.json();
        if (body.data?.nickname) {
          const next = { nickname: body.data.nickname, region: body.data.region ?? null };
          setResult(next);
          onResult?.(next);
        }
      } catch {
        // silently skip — nickname is a nice-to-have, not a blocker
      } finally {
        setIsChecking(false);
      }
    }, 1000);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputsKey, productDenomId]);

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
      {isChecking && (
        <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-border bg-background-input/70 px-3 py-2 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          Mengecek akun...
        </div>
      )}
      {!isChecking && result && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary">
          <UserRoundCheck className="size-3.5 shrink-0" />
          <span>
            Akun ditemukan, <span className="font-semibold">{result.nickname}</span>
            {result.region && (
              <>
                {" "}
                berasal dari <span className="font-semibold">{result.region}</span>
              </>
            )}
          </span>
        </div>
      )}
    </StepCard>
  );
};

export default ProductInputCard;
