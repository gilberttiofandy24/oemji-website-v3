"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, Clock, History, Loader2, PackageSearch, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { useCart } from "@/components/cart/cart-context";
import type { OrderHistoryItem, PaginatedResponse } from "@/lib/backend";

const statusMeta: Record<string, { label: string; badge: "default" | "secondary" | "destructive" | "success"; icon: typeof Clock; accent: string }> = {
  PENDING_PAYMENT: { label: "Menunggu Bayar", badge: "secondary", icon: Clock, accent: "border-l-muted-foreground/40" },
  PENDING: { label: "Diproses", badge: "default", icon: Loader2, accent: "border-l-primary" },
  SUCCESS: { label: "Berhasil", badge: "success", icon: CheckCircle2, accent: "border-l-success" },
  FAILED: { label: "Gagal", badge: "destructive", icon: XCircle, accent: "border-l-destructive" },
};

function OrderRowSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-4 rounded-2xl border border-border bg-card p-4">
      <div className="size-10 shrink-0 rounded-full bg-background-input" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-40 rounded bg-background-input" />
        <div className="h-3 w-24 rounded bg-background-input" />
      </div>
      <div className="h-5 w-20 rounded bg-background-input" />
    </div>
  );
}

export default function RiwayatPage() {
  const router = useRouter();
  const { isLoggedIn, authChecked } = useCart();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResponse<OrderHistoryItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authChecked && !isLoggedIn) {
      router.push("/sign-in");
    }
  }, [authChecked, isLoggedIn, router]);

  useEffect(() => {
    if (!isLoggedIn) return;
    setIsLoading(true);
    fetch(`/api/order/history?page=${page}`)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setIsLoading(false));
  }, [isLoggedIn, page]);

  if (!authChecked || !isLoggedIn) return null;

  return (
    <div className="bg-background mt-15 min-h-screen">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <History className="size-5" />
          Riwayat Pesanan
        </h1>

        {isLoading ? (
          <div className="mt-6 flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <OrderRowSkeleton key={i} />
            ))}
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
            <PackageSearch className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">Belum ada pesanan</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Pesanan yang kamu buat bakal muncul di sini.
            </p>
            <Button asChild className="mt-2">
              <Link href="/">Belanja Sekarang</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-3">
            {data.data.map((order) => {
              const meta = statusMeta[order.status] ?? statusMeta.PENDING_PAYMENT;
              const Icon = meta.icon;
              return (
                <Link
                  key={order.ref_id}
                  href={`/payment/${order.ref_id}`}
                  className={cn(
                    "group flex items-center gap-4 rounded-2xl border border-border border-l-4 bg-card p-4 transition-colors hover:border-primary/40 hover:bg-card/80",
                    meta.accent,
                  )}
                >
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-full",
                      order.status === "SUCCESS" && "bg-success/15 text-success",
                      order.status === "FAILED" && "bg-destructive/15 text-destructive",
                      order.status === "PENDING" && "bg-primary/15 text-primary",
                      order.status === "PENDING_PAYMENT" && "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className={cn("size-5", order.status === "PENDING" && "animate-spin")} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{order.product_names.join(", ")}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                      <span>{order.item_count} item</span>
                      <span>·</span>
                      <span>
                        {new Date(order.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span>·</span>
                      <span className="font-mono">{order.ref_id}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <Badge variant={meta.badge}>{meta.label}</Badge>
                    <span className="text-sm font-semibold">{formatCurrency(Number(order.total_amount))}</span>
                  </div>

                  <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              );
            })}

            {data.meta.total_pages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={!data.meta.has_prev_page}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Sebelumnya
                </Button>
                <span className="text-xs text-muted-foreground">
                  Halaman {page} / {data.meta.total_pages}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={!data.meta.has_next_page}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Selanjutnya
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
