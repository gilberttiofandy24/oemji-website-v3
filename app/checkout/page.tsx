import { Suspense } from "react";
import { getPublicPaymentMethods } from "@/lib/backend";
import CheckoutForm from "./_components/CheckoutForm";

export default async function CheckoutPage() {
  const { data: paymentMethodGroups } = await getPublicPaymentMethods();

  return (
    <div className="bg-background mt-15 min-h-screen">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
        <h1 className="text-xl font-semibold">Checkout</h1>
        <Suspense>
          <CheckoutForm paymentMethodGroups={paymentMethodGroups} />
        </Suspense>
      </div>
    </div>
  );
}
