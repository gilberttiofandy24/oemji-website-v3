"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { PublicProductDenomItem, PublicProductItem } from "@/lib/backend";
import { useCart } from "@/components/cart/cart-context";
import { useBuyNowStore } from "@/components/checkout/buy-now-store";
import ProductInfoCard from "./ProductInfoCard";
import ProductInputCard, { type AccountValidationResult } from "./ProductInputCard";
import ProductDenomPicker from "./ProductDenomPicker";
import ProductQuantityCard from "./ProductQuantityCard";
import ProductPromoCodeCard from "./ProductPromoCodeCard";
import ProductOrderSummary from "./ProductOrderSummary";

interface ProductOrderFormProps {
  product: PublicProductItem;
  title: string;
  denoms: PublicProductDenomItem[];
}

export type CheckoutFormValues = Record<string, string>;

function buildSchema(fields: PublicProductItem["input_fields"]) {
  const shape: Record<string, z.ZodTypeAny> = {
    product_supplier_id: z.string().min(1, "Pilih nominal terlebih dahulu"),
  };

  for (const field of fields) {
    shape[field.key] =
      field.type === "select"
        ? z
            .string()
            .refine(
              (value) => field.options?.some((option) => option.value === value),
              `Pilih ${field.label}`,
            )
        : z.string().min(1, `${field.label} wajib diisi`);
  }

  return z.object(shape);
}

const ProductOrderForm = ({ product, title, denoms }: ProductOrderFormProps) => {
  const router = useRouter();
  const { addItem, isLoggedIn } = useCart();
  const setBuyNowItem = useBuyNowStore((state) => state.setItem);
  const [quantity, setQuantity] = useState(1);
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [accountResult, setAccountResult] = useState<AccountValidationResult | null>(null);

  const visibleInputFields = useMemo(
    () => product.input_fields.filter((field) => field.show).sort((a, b) => a.sort_order - b.sort_order),
    [product.input_fields],
  );

  const schema = useMemo(() => buildSchema(visibleInputFields), [visibleInputFields]);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(schema) as Resolver<CheckoutFormValues>,
    defaultValues: {
      product_supplier_id: "",
      ...Object.fromEntries(visibleInputFields.map((field) => [field.key, ""])),
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedDenomId = form.watch("product_supplier_id");
  const selectedDenom = denoms.find((denom) => denom.id === selectedDenomId);

  const unitPrice = selectedDenom ? Math.round(Number(selectedDenom.sell_price)) : 0;
  const basePrice = unitPrice * quantity;
  const discountAmount = Math.round(appliedPromo?.discountAmount ?? 0);
  const total = Math.max(0, basePrice - discountAmount);

  let stepCounter = 0;
  const inputStep = visibleInputFields.length > 0 ? ++stepCounter : 0;
  const denomStep = ++stepCounter;
  const quantityStep = ++stepCounter;
  const promoStep = ++stepCounter;

  const watchedValues = form.watch();
  const isInputFieldsComplete = visibleInputFields.every((field) =>
    Boolean(watchedValues[field.key]?.trim()),
  );
  const isDenomSelected = Boolean(watchedValues.product_supplier_id);

  const inputCardRef = useRef<HTMLDivElement>(null);
  const denomPickerRef = useRef<HTMLDivElement>(null);
  const promoCardRef = useRef<HTMLDivElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) =>
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  useEffect(() => {
    if (selectedDenomId) {
      scrollTo(promoCardRef);
    }
  }, [selectedDenomId]);

  useEffect(() => {
    setAppliedPromo(null);
    setQuantity(1);
  }, [selectedDenomId]);

  const checkDenomPrerequisites = () => {
    if (!isInputFieldsComplete) {
      toast.error("Isi data akun terlebih dahulu");
      scrollTo(inputCardRef);
      return false;
    }
    return true;
  };

  const buildInputs = () => {
    const inputs: Record<string, string> = {};
    for (const field of visibleInputFields) {
      inputs[field.key] = watchedValues[field.key];
    }
    return inputs;
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      toast.error("Mohon masuk untuk memakai fitur keranjang");
      return;
    }
    if (!checkDenomPrerequisites() || !selectedDenom) return;

    try {
      await addItem({ denomId: selectedDenom.id, quantity, inputs: buildInputs() });
      toast.success("Ditambahkan ke keranjang");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menambah ke keranjang");
    }
  };

  const handleBuyNow = () => {
    if (!checkDenomPrerequisites() || !selectedDenom) return;

    setBuyNowItem({
      productName: title,
      productImage: product.image_url,
      denomId: selectedDenom.id,
      denomLabel: selectedDenom.denom,
      price: unitPrice,
      quantity,
      inputs: buildInputs(),
      promoCode: appliedPromo?.code,
      discountAmount: appliedPromo?.discountAmount,
      nickname: accountResult?.nickname,
      region: accountResult?.region,
    });
    router.push("/checkout");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="order-2 flex flex-col gap-4 md:order-1 md:col-span-2">
          {visibleInputFields.length > 0 && (
            <div ref={inputCardRef} className="scroll-mt-20">
              <ProductInputCard
                form={form}
                step={inputStep}
                fields={visibleInputFields}
                productDenomId={selectedDenom?.id ?? denoms[0]?.id}
                onResult={setAccountResult}
              />
            </div>
          )}
          <div ref={denomPickerRef} className="scroll-mt-20">
            <ProductDenomPicker
              form={form}
              step={denomStep}
              denoms={denoms}
              checkPrerequisites={checkDenomPrerequisites}
            />
          </div>
          {isDenomSelected && (
            <ProductQuantityCard step={quantityStep} quantity={quantity} onQuantityChange={setQuantity} />
          )}
          <div ref={promoCardRef} className="scroll-mt-20">
            <ProductPromoCodeCard
              key={selectedDenomId}
              step={promoStep}
              productId={product.id}
              productSupplierId={selectedDenomId}
              subtotal={basePrice}
              onPromoApplied={setAppliedPromo}
            />
          </div>
        </div>

        <div className="order-1 md:order-2">
          <ProductInfoCard product={product} title={title} />
        </div>
      </div>

      {isDenomSelected && (
        <ProductOrderSummary
          denomLabel={selectedDenom ? `${selectedDenom.denom} × ${quantity}` : ""}
          basePrice={basePrice}
          discountAmount={discountAmount}
          total={total}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      )}
    </div>
  );
};

export default ProductOrderForm;
