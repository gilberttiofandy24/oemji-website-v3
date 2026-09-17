"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FieldErrors, Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { PublicProductDenomItem, PublicProductItem, PaymentMethodGroup } from "@/lib/backend";
import { useCart } from "@/components/cart/cart-context";
import ProductInfoCard from "./ProductInfoCard";
import ProductInputCard from "./ProductInputCard";
import ProductDenomPicker from "./ProductDenomPicker";
import ProductQuantityCard from "./ProductQuantityCard";
import ProductPromoCodeCard from "./ProductPromoCodeCard";
import ProductPaymentMethodPicker from "./ProductPaymentMethodPicker";
import ProductPhoneNumberCard from "./ProductPhoneNumberCard";
import ProductOrderSummary from "./ProductOrderSummary";
import CheckoutConfirmDialog from "./CheckoutConfirmDialog";
import { formatCurrency } from "@/lib/utils";

interface ProductOrderFormProps {
  product: PublicProductItem;
  title: string;
  denoms: PublicProductDenomItem[];
  paymentMethodGroups: PaymentMethodGroup[];
}

export type CheckoutFormValues = Record<string, string>;

function buildSchema(fields: PublicProductItem["input_fields"]) {
  const shape: Record<string, z.ZodTypeAny> = {
    product_supplier_id: z.string().min(1, "Pilih nominal terlebih dahulu"),
    payment_method_id: z.string().min(1, "Pilih metode pembayaran"),
    phone_number: z.string().regex(/^08[0-9]{8,11}$/, "Nomor WhatsApp tidak valid (contoh: 08xxx)"),
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

const ProductOrderForm = ({ product, title, denoms, paymentMethodGroups }: ProductOrderFormProps) => {
  const { addItem, isLoggedIn } = useCart();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);

  const visibleInputFields = useMemo(
    () => product.input_fields.filter((field) => field.show).sort((a, b) => a.sort_order - b.sort_order),
    [product.input_fields],
  );

  const schema = useMemo(() => buildSchema(visibleInputFields), [visibleInputFields]);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(schema) as Resolver<CheckoutFormValues>,
    defaultValues: {
      product_supplier_id: "",
      payment_method_id: "",
      phone_number: "",
      ...Object.fromEntries(visibleInputFields.map((field) => [field.key, ""])),
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedDenomId = form.watch("product_supplier_id");
  const selectedDenom = denoms.find((denom) => denom.id === selectedDenomId);
  const selectedMethodId = form.watch("payment_method_id");
  const selectedMethod = paymentMethodGroups
    .flatMap((group) => group.methods)
    .find((method) => method.id === selectedMethodId);

  const unitPrice = selectedDenom ? Math.round(Number(selectedDenom.sell_price)) : 0;
  const basePrice = unitPrice * quantity;
  const discountAmount = Math.round(appliedPromo?.discountAmount ?? 0);
  const priceAfterDiscount = Math.max(0, basePrice - discountAmount);
  const feeFlat = selectedMethod ? Math.round(Number(selectedMethod.fee_flat)) : 0;
  const feePercent = selectedMethod ? Number(selectedMethod.fee_percent) : 0;
  const total = selectedMethod
    ? Math.round(priceAfterDiscount + feeFlat + (priceAfterDiscount * feePercent) / 100)
    : priceAfterDiscount;
  const feeLabel = selectedMethod
    ? feePercent > 0
      ? `+${feePercent}%`
      : feeFlat > 0
        ? `+${formatCurrency(feeFlat)}`
        : null
    : null;

  let stepCounter = 0;
  const inputStep = visibleInputFields.length > 0 ? ++stepCounter : 0;
  const denomStep = ++stepCounter;
  const quantityStep = ++stepCounter;
  const promoStep = ++stepCounter;
  const paymentStep = ++stepCounter;
  const phoneStep = ++stepCounter;

  const watchedValues = form.watch();
  const isInputFieldsComplete = visibleInputFields.every((field) =>
    Boolean(watchedValues[field.key]?.trim()),
  );
  const isDenomSelected = Boolean(watchedValues.product_supplier_id);
  const isPaymentMethodSelected = Boolean(watchedValues.payment_method_id);

  const inputCardRef = useRef<HTMLDivElement>(null);
  const denomPickerRef = useRef<HTMLDivElement>(null);
  const promoCardRef = useRef<HTMLDivElement>(null);
  const paymentMethodRef = useRef<HTMLDivElement>(null);
  const phoneNumberRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (selectedMethodId) {
      scrollTo(phoneNumberRef);
    }
  }, [selectedMethodId]);

  const checkDenomPrerequisites = () => {
    if (!isInputFieldsComplete) {
      toast.error("Isi data akun terlebih dahulu");
      scrollTo(inputCardRef);
      return false;
    }
    return true;
  };

  const checkPaymentMethodPrerequisites = () => {
    if (!isInputFieldsComplete) {
      toast.error("Isi data akun terlebih dahulu");
      scrollTo(inputCardRef);
      return false;
    }
    if (!isDenomSelected) {
      toast.error("Pilih nominal terlebih dahulu");
      scrollTo(denomPickerRef);
      return false;
    }
    return true;
  };

  const onInvalid = (errors: FieldErrors<CheckoutFormValues>) => {
    if (errors.phone_number) {
      scrollTo(phoneNumberRef);
    }
  };

  const onSubmit = form.handleSubmit(() => {
    if (!selectedDenom || !selectedMethod) return;
    setConfirmOpen(true);
  }, onInvalid);

  const handleConfirmOrder = () => {
    setConfirmOpen(false);
    toast.info("Checkout belum tersedia di storefront ini — segera hadir.");
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      toast.error("Mohon masuk untuk memakai fitur keranjang");
      return;
    }

    if (!checkDenomPrerequisites() || !selectedDenom) return;
    if (!isDenomSelected) {
      toast.error("Pilih nominal terlebih dahulu");
      scrollTo(denomPickerRef);
      return;
    }

    const phoneNumber = watchedValues.phone_number ?? "";
    if (!/^08[0-9]{8,11}$/.test(phoneNumber)) {
      toast.error("Isi nomor WhatsApp yang valid terlebih dahulu");
      scrollTo(phoneNumberRef);
      return;
    }

    const inputs: Record<string, string> = {};
    for (const field of visibleInputFields) {
      inputs[field.key] = watchedValues[field.key];
    }

    try {
      await addItem({ denomId: selectedDenom.id, quantity, inputs });
      toast.success("Ditambahkan ke keranjang");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menambah ke keranjang");
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="order-2 flex flex-col gap-4 md:order-1 md:col-span-2">
          {visibleInputFields.length > 0 && (
            <div ref={inputCardRef} className="scroll-mt-20">
              <ProductInputCard form={form} step={inputStep} fields={visibleInputFields} />
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
          <div ref={paymentMethodRef} className="scroll-mt-20">
            <ProductPaymentMethodPicker
              form={form}
              step={paymentStep}
              groups={paymentMethodGroups}
              basePrice={priceAfterDiscount}
              checkPrerequisites={checkPaymentMethodPrerequisites}
            />
          </div>
          <div ref={phoneNumberRef} className="scroll-mt-20">
            <ProductPhoneNumberCard form={form} step={phoneStep} />
          </div>
        </div>

        <div className="order-1 md:order-2">
          <ProductInfoCard product={product} title={title} />
        </div>
      </div>

      {isDenomSelected && (
        <ProductOrderSummary
          denomLabel={selectedDenom ? `${selectedDenom.denom} × ${quantity}` : ""}
          paymentMethodName={selectedMethod?.name ?? null}
          feeLabel={feeLabel}
          basePrice={basePrice}
          discountAmount={discountAmount}
          total={total}
          isSubmitting={false}
          canCheckout={isPaymentMethodSelected}
          onAddToCart={handleAddToCart}
        />
      )}

      <CheckoutConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        productName={title}
        denomLabel={selectedDenom ? `${selectedDenom.denom} × ${quantity}` : ""}
        paymentMethodName={selectedMethod?.name ?? ""}
        promoCode={appliedPromo}
        onConfirm={handleConfirmOrder}
      />
    </form>
  );
};

export default ProductOrderForm;
