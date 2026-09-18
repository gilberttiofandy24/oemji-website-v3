"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, History, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { useCart } from "@/components/cart/cart-context";
import type { OrderHistoryItem, PaginatedResponse } from "@/lib/backend";

const statusMeta: Record<string, { label: string; dot: string }> = {
  PENDING_PAYMENT: { label: "Menunggu bayar", dot: "bg-muted-foreground" },
  PENDING: { label: "Diproses", dot: "bg-primary" },
  SUCCESS: { label: "Berhasil", dot: "bg-success" },
  FAILED: { label: "Gagal", dot: "bg-destructive" },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000);

  const time = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 0) return `Hari ini, ${time}`;
  if (diffDays === 1) return `Kemarin, ${time}`;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) + `, ${time}`;
}

function summarizeProductNames(names: string[]) {
  const counts = new Map<string, number>();
  for (const name of names) {
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()].map(([name, count]) => (count > 1 ? `${name} x${count}` : name)).join(", ");
}

function RowSkeleton() {
  return (
    <tr className="animate-pulse border-b border-border last:border-0">
      <td className="p-4">
        <div className="h-3.5 w-48 rounded bg-card-teritary" />
      </td>
      <td className="p-4">
        <div className="h-3.5 w-32 rounded bg-card-teritary" />
      </td>
      <td className="p-4">
        <div className="h-3.5 w-24 rounded bg-card-teritary" />
      </td>
      <td className="p-4">
        <div className="ml-auto h-3.5 w-20 rounded bg-card-teritary" />
      </td>
    </tr>
  );
}

export default function RiwayatPage() {
  const router = useRouter();
  const { isLoggedIn } = useCart();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResponse<OrderHistoryItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) return;
    setIsLoading(true);
    fetch(`/api/order/history?page=${page}`)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setIsLoading(false));
  }, [isLoggedIn, page]);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="flex items-center gap-2 text-xl font-semibold">
        <History className="size-5 text-muted-foreground" />
        Riwayat transaksi
      </h1>

      {!isLoading && data && data.data.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <PackageSearch className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium">Belum ada pesanan</p>
          <p className="max-w-xs text-xs text-muted-foreground">Pesanan yang kamu buat bakal muncul di sini.</p>
          <Button asChild className="mt-2">
            <Link href="/">Belanja sekarang</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col divide-y divide-border rounded-xl border border-border sm:hidden">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex animate-pulse items-center gap-3 p-4">
                    <div className="h-3.5 flex-1 rounded bg-card-teritary" />
                    <div className="h-3.5 w-16 rounded bg-card-teritary" />
                  </div>
                ))
              : data?.data.map((order) => {
                  const meta = statusMeta[order.status] ?? statusMeta.PENDING_PAYMENT;
                  return (
                    <Link
                      key={order.ref_id}
                      href={`/payment/${order.ref_id}`}
                      className="flex items-center gap-3 p-4 active:bg-card-secondary/40"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{summarizeProductNames(order.product_names)}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="text-sm font-semibold tabular-nums">
                          {formatCurrency(Number(order.total_amount))}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className={cn("size-1.5 rounded-full", meta.dot)} />
                          {meta.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
          </div>

          <div className="hidden overflow-x-auto rounded-xl border border-border sm:block">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-background-secondary text-left text-xs text-muted-foreground">
                  <th className="p-4 font-medium">Produk</th>
                  <th className="p-4 font-medium">Ref ID</th>
                  <th className="p-4 font-medium">Tanggal</th>
                  <th className="p-4 text-right font-medium">Status</th>
                  <th className="p-4 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
                ) : (
                  data?.data.map((order) => {
                    const meta = statusMeta[order.status] ?? statusMeta.PENDING_PAYMENT;
                    return (
                      <tr
                        key={order.ref_id}
                        onClick={() => router.push(`/payment/${order.ref_id}`)}
                        className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-card-secondary/40"
                      >
                        <td className="max-w-72 p-4">
                          <p className="truncate font-medium">{summarizeProductNames(order.product_names)}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{order.item_count} item</p>
                        </td>
                        <td className="p-4 text-muted-foreground">{order.ref_id}</td>
                        <td className="p-4 whitespace-nowrap text-muted-foreground">{formatDate(order.created_at)}</td>
                        <td className="p-4">
                          <span className="flex items-center justify-end gap-1.5 text-muted-foreground">
                            <span className={cn("size-1.5 rounded-full", meta.dot)} />
                            {meta.label}
                          </span>
                        </td>
                        <td className="p-4 text-right font-semibold tabular-nums">
                          {formatCurrency(Number(order.total_amount))}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {data && data.meta.total_pages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-1 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 rounded-full"
                disabled={!data.meta.has_prev_page}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="size-4" />
              </Button>

              <div className="flex items-center gap-1.5 px-2">
                {Array.from({ length: data.meta.total_pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full text-xs font-medium transition-colors",
                      p === page ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-card-secondary",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 rounded-full"
                disabled={!data.meta.has_next_page}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
