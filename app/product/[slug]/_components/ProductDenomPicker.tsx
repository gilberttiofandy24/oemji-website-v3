import { Check } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { UseFormReturn } from "react-hook-form";
import type { PublicProductDenomItem } from "@/lib/backend";
import { cn, formatCurrency } from "@/lib/utils";
import type { CheckoutFormValues } from "./ProductOrderForm";
import StepCard from "@/components/checkout/StepCard";

interface ProductDenomPickerProps {
  form: UseFormReturn<CheckoutFormValues>;
  step: number;
  denoms: PublicProductDenomItem[];
  checkPrerequisites: () => boolean;
}

interface DenomGroup {
  name: string;
  sortOrder: number;
  items: PublicProductDenomItem[];
}

function groupDenoms(denoms: PublicProductDenomItem[]): DenomGroup[] {
  const groups = new Map<string, DenomGroup>();
  for (const denom of denoms) {
    const key = denom.group_name ?? "Lainnya";
    const group = groups.get(key) ?? {
      name: key,
      sortOrder: denom.group_sort_order,
      items: [],
    };
    group.items.push(denom);
    groups.set(key, group);
  }
  return Array.from(groups.values())
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((group) => ({
      ...group,
      items: [...group.items].sort((a, b) => a.sort_order - b.sort_order),
    }));
}

const ProductDenomPicker = ({ form, step, denoms, checkPrerequisites }: ProductDenomPickerProps) => {
  const selectedId = form.watch("product_supplier_id");
  const groups = groupDenoms(denoms);

  return (
    <StepCard step={step} title="Pilih Nominal">
      <div className="flex flex-col gap-4">
        {groups.map((group) => (
          <div key={group.name}>
            <p className="mb-2 text-xs font-semibold text-muted-foreground">{group.name}</p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
              {group.items.map((denom) => {
                const isSelected = selectedId === denom.id;
                return (
                  <motion.button
                    key={denom.id}
                    type="button"
                    disabled={!denom.stock_status}
                    onClick={() => {
                      if (!checkPrerequisites()) return;
                      form.setValue("product_supplier_id", denom.id, {
                        shouldValidate: true,
                      });
                    }}
                    whileHover={denom.stock_status ? { y: -4 } : undefined}
                    whileTap={denom.stock_status ? { scale: 0.95, y: 0 } : undefined}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className={cn(
                      "relative flex flex-col overflow-hidden rounded-lg border-2 bg-card/80 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                      isSelected ? "border-primary" : "border-transparent hover:border-primary/50",
                    )}
                  >
                    <div className="flex items-center gap-2 p-2.5">
                      {denom.image_url && (
                        <div className="relative h-9 w-9 shrink-0">
                          <Image
                            src={denom.image_url}
                            alt={denom.denom}
                            fill
                            loading="eager"
                            unoptimized
                            className="object-contain"
                          />
                        </div>
                      )}
                      <p className="line-clamp-2 text-xs font-medium">{denom.denom}</p>
                    </div>
                    <div className="relative mt-auto flex items-center justify-end gap-2 px-2.5 py-2">
                      <div className="absolute inset-x-2.5 top-0 border-t border-border" />
                      {isSelected && (
                        <span className="absolute inset-y-0 left-0 flex w-8 items-center justify-center rounded-tr-lg bg-primary text-primary-foreground">
                          <Check className="size-4" />
                        </span>
                      )}
                      {denom.stock_status ? (
                        <p className="text-xs font-medium">
                          {formatCurrency(Number(denom.sell_price))}
                        </p>
                      ) : (
                        <p className="text-xs font-medium text-destructive">Stok habis</p>
                      )}
                      <Image
                        src="/logo.png"
                        alt=""
                        loading="eager"
                        width={16}
                        height={16}
                        className="shrink-0 opacity-80"
                      />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {form.formState.errors.product_supplier_id && (
        <p className="mt-3 text-xs text-destructive">
          {form.formState.errors.product_supplier_id.message}
        </p>
      )}
    </StepCard>
  );
};

export default ProductDenomPicker;
