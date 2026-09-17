"use client";

import { Check, Copy, Headset, PackageSearch, PartyPopper, UserRoundCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { CheckoutStatusData } from "@/lib/backend";
import PaymentCountdown from "./PaymentCountdown";
import PaymentProgressStepper from "./PaymentProgressStepper";

interface StoredCheckoutContext {
  paymentMethodName: string;
  items: {
    productName: string;
    productImage: string | null;
    denomLabel: string;
  }[];
}

const statusLabel: Record<string, string> = {
  PENDING_PAYMENT: "MENUNGGU",
  PENDING: "DIPROSES",
  SUCCESS: "BERHASIL",
  FAILED: "GAGAL",
};

const messageByStatus: Record<string, string> = {
  PENDING_PAYMENT: "Selesaikan pembayaran kamu sebelum waktu habis.",
  PENDING: "Pesanan kamu sedang diproses. Mohon tunggu!",
  SUCCESS: "Pesanan kamu berhasil dikirim.",
  FAILED: "Pesanan ini gagal diproses. Jika sudah terpotong, dana akan otomatis dikembalikan.",
};

function StatusBadge({ status }: { status: string }) {
  if (status === "FAILED") return <Badge variant="destructive">{statusLabel[status]}</Badge>;
  if (status === "SUCCESS") return <Badge variant="success">{statusLabel[status]}</Badge>;
  if (status === "PENDING") return <Badge>{statusLabel[status]}</Badge>;
  return <Badge variant="secondary">{statusLabel[status] ?? status}</Badge>;
}

const CopyableCode = ({ value }: { value: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-background-input px-3 py-2.5 text-left"
    >
      <span className="font-mono text-sm">{value}</span>
      {copied ? <Check className="size-4 shrink-0 text-success" /> : <Copy className="size-4 shrink-0 text-muted-foreground" />}
    </button>
  );
};

const CopyIconButton = ({ value }: { value: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="shrink-0"
    >
      {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5 text-muted-foreground" />}
    </button>
  );
};

const POLL_INTERVAL_MS = 4000;

const PaymentPageClient = ({ refId }: { refId: string }) => {
  const [context, setContext] = useState<StoredCheckoutContext | null>(null);
  const [status, setStatus] = useState<CheckoutStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(`checkout:${refId}`);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setContext(stored ? JSON.parse(stored) : null);
    } catch {
      setContext(null);
    }
  }, [refId]);

  const stoppedRef = useRef(false);
  useEffect(() => {
    stoppedRef.current = false;

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/order/checkout/${refId}`, { cache: "no-store" });
        if (!res.ok) {
          if (res.status === 404) setNotFound(true);
          return;
        }
        const body = await res.json();
        setStatus(body.data);
        if (body.data.status === "SUCCESS" || body.data.status === "FAILED") {
          stoppedRef.current = true;
        }
      } catch {
        // network hiccup — keep polling
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(() => {
      if (stoppedRef.current) return;
      fetchStatus();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [refId]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Memuat status pesanan...</p>;
  }

  if (notFound || !status) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-10 text-center">
        <PackageSearch className="size-8 text-muted-foreground" />
        <p className="text-sm font-semibold">Pesanan tidak ditemukan</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          Ref ID &quot;{refId}&quot; tidak valid atau belum pernah ada.
        </p>
        <Button asChild variant="secondary" className="mt-2">
          <Link href="/">Kembali ke Beranda</Link>
        </Button>
      </div>
    );
  }

  const isPaid = status.status !== "PENDING_PAYMENT";
  const total = Number(status.total_amount);

  return (
    <div className="flex flex-col gap-4">
      <div className="px-2 py-5 sm:px-5">
        <PaymentProgressStepper status={status.status} />
      </div>

      {!isPaid && status.expired_at && <PaymentCountdown expiryTime={status.expired_at} />}

      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-5">
        <div className="flex flex-col gap-4 md:col-span-3">
          <section className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-col gap-4">
              {status.items.map((item, i) => {
                const ctxItem = context?.items[i];
                return (
                  <div key={item.ref_id} className="flex gap-4">
                    {ctxItem?.productImage && (
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={ctxItem.productImage}
                          alt={item.product_name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col gap-1">
                      <p className="text-sm font-semibold">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground">{ctxItem?.denomLabel ?? item.denom_name}</p>
                      {item.nickname && (
                        <p className="flex items-center gap-1 text-xs text-primary">
                          <UserRoundCheck className="size-3" />
                          {item.nickname}
                        </p>
                      )}
                      {item.serial_number && (
                        <p className="font-mono text-xs text-muted-foreground">SN: {item.serial_number}</p>
                      )}
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                );
              })}
            </div>
          </section>

          <div className="flex items-center justify-between rounded-lg border border-success/30 bg-success/10 px-4 py-3.5">
            <span className="text-sm font-semibold">Total Pembayaran</span>
            <span className="text-base font-bold text-success">{formatCurrency(total)}</span>
          </div>
        </div>

        <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 md:col-span-2">
          {status.status === "SUCCESS" ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <PartyPopper className="size-10 text-success" />
              <p className="text-base font-semibold">Pembayaran Berhasil!</p>
            </div>
          ) : (
            <>
              {context?.paymentMethodName && (
                <div>
                  <span className="text-xs text-muted-foreground">Metode Pembayaran</span>
                  <p className="text-base font-bold">{context.paymentMethodName}</p>
                </div>
              )}

              <div className="flex flex-col gap-2.5 border-t border-border pt-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Nomor Invoice</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs">{refId}</span>
                    <CopyIconButton value={refId} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status Pembayaran</span>
                  <Badge variant={isPaid ? "success" : "destructive"}>{isPaid ? "LUNAS" : "BELUM BAYAR"}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status Transaksi</span>
                  <StatusBadge status={status.status} />
                </div>
              </div>

              <p className="rounded-lg bg-background-input px-3 py-2.5 text-xs text-muted-foreground">
                {messageByStatus[status.status] ?? ""}
              </p>

              {status.va_number && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Nomor Virtual Account
                  </span>
                  <CopyableCode value={status.va_number.trim()} />
                </div>
              )}
            </>
          )}
        </section>

        <Link
          href="/contact-us"
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 md:col-span-2 md:col-start-4"
        >
          <Headset className="size-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold">Butuh Bantuan?</p>
            <p className="text-xs text-muted-foreground">Hubungi CS</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default PaymentPageClient;
