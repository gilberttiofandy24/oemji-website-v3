import type { Metadata } from "next";
import PaymentPageClient from "./_components/PaymentPageClient";

type Props = {
  params: Promise<{ refId: string }>;
};

export const metadata: Metadata = {
  title: "Status Pembayaran",
  robots: { index: false, follow: false },
};

export default async function PaymentPage({ params }: Props) {
  const { refId } = await params;

  return (
    <main className="mx-auto mt-15 w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="text-lg font-semibold">Status Pesanan</h1>
      <div className="mt-4">
        <PaymentPageClient refId={refId} />
      </div>
    </main>
  );
}
