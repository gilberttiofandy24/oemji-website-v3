"use client";

import { Check, ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { PaymentMethodGroup } from "@/lib/backend";
import { cn, formatCurrency } from "@/lib/utils";

interface CheckoutPaymentPickerProps {
  groups: PaymentMethodGroup[];
  selectedMethodId: string;
  onSelect: (id: string) => void;
  basePrice: number;
}

const BODY_DURATION = 0.3;
const STRIP_DURATION = 0.25;

const CheckoutPaymentPicker = ({
  groups,
  selectedMethodId,
  onSelect,
  basePrice,
}: CheckoutPaymentPickerProps) => {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(groups[0]?.group ?? null);

  const toggleGroup = (groupName: string) => {
    setExpandedGroup((prev) => (prev === groupName ? null : groupName));
  };

  const [layoutAnimationsEnabled, setLayoutAnimationsEnabled] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setLayoutAnimationsEnabled(true), 600);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => {
        const isExpanded = expandedGroup === group.group;

        return (
          <motion.div
            key={group.group}
            layout={layoutAnimationsEnabled}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative overflow-hidden rounded-lg border border-border"
          >
            <button
              type="button"
              onClick={() => toggleGroup(group.group)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left bg-card/80"
            >
              <span className="text-xs font-semibold text-muted-foreground">{group.group}</span>
              <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="size-4 text-muted-foreground" />
              </motion.span>
            </button>

            <div className="relative">
              <motion.div
                initial={false}
                animate={{
                  height: isExpanded ? "auto" : 0,
                  opacity: isExpanded ? 1 : 0,
                }}
                transition={{
                  duration: BODY_DURATION,
                  ease: "easeInOut",
                  delay: isExpanded ? 0 : STRIP_DURATION,
                }}
                className="overflow-hidden bg-card/80"
              >
                <div className="grid grid-cols-2 gap-3 p-3">
                  {group.methods.map((method) => {
                    const isSelected = selectedMethodId === method.id;
                    const feeFlat = Number(method.fee_flat);
                    const feePercent = Number(method.fee_percent);
                    const total = basePrice > 0 ? basePrice + feeFlat + (basePrice * feePercent) / 100 : 0;
                    const feeLabel =
                      feePercent > 0
                        ? `+${feePercent}%`
                        : feeFlat > 0
                          ? `+${formatCurrency(feeFlat)}`
                          : null;

                    return (
                      <motion.button
                        key={method.id}
                        type="button"
                        onClick={() => onSelect(method.id)}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                        className={cn(
                          "relative flex flex-col overflow-hidden rounded-lg border-2 bg-card-secondary text-left",
                          isSelected ? "border-primary" : "border-border",
                          group.methods.length === 1 && "col-span-2",
                        )}
                      >
                        <div className="flex flex-col gap-2 p-3">
                          {method.image_url ? (
                            <div className="relative h-8 w-full">
                              <Image
                                src={method.image_url}
                                alt={method.name}
                                fill
                                unoptimized
                                loading="eager"
                                className="object-contain object-left"
                              />
                            </div>
                          ) : (
                            <p className="text-sm font-medium">{method.name}</p>
                          )}
                        </div>
                        {(total > 0 || feeLabel) && (
                          <div className="relative mt-auto flex items-center px-3 py-2">
                            <div className="absolute inset-x-3 top-0 border-t border-border" />
                            {isSelected && (
                              <span className="absolute inset-y-0 right-0 flex w-8 items-center justify-center rounded-tl-lg bg-primary text-primary-foreground">
                                <Check className="size-4" />
                              </span>
                            )}
                            {total > 0 ? (
                              <p className="text-xs font-medium">{formatCurrency(total)}</p>
                            ) : (
                              <p className="text-xs font-medium text-muted-foreground">{feeLabel}</p>
                            )}
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div
                initial={false}
                animate={{
                  height: isExpanded ? 0 : "auto",
                  opacity: isExpanded ? 0 : 1,
                }}
                transition={{
                  duration: STRIP_DURATION,
                  ease: "easeInOut",
                  delay: isExpanded ? BODY_DURATION : 0,
                }}
                className="overflow-hidden bg-card-tertiary"
              >
                <div className="flex flex-nowrap items-center gap-2 p-3 bg-background-secondary/80">
                  {group.methods.map((method) => (
                    <div
                      key={method.id}
                      className={cn(
                        "relative flex h-6 min-w-0 flex-1 items-center justify-center",
                        method.image_url ? "max-w-16" : "max-w-24",
                      )}
                    >
                      {method.image_url ? (
                        <Image
                          src={method.image_url}
                          alt={method.name}
                          fill
                          unoptimized
                          loading="eager"
                          className="object-contain"
                        />
                      ) : (
                        <span className="truncate text-xs text-muted-foreground">{method.name}</span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default CheckoutPaymentPicker;
