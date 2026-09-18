"use client";

import NumberFlow from "@number-flow/react";
import { CheckCircle2, Clock, ListOrdered, Phone, ShieldCheck, Sparkles, Store, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/components/cart/cart-context";
import { useAccount } from "@/hooks/use-account";
import { useOrderStats } from "@/hooks/use-order-stats";

const statCards = [
  {
    key: "total" as const,
    label: "Total Transaksi",
    icon: ListOrdered,
    iconClassName: "bg-primary/15 text-primary",
  },
  {
    key: "pending" as const,
    label: "Pending",
    icon: Clock,
    iconClassName: "bg-secondary/15 text-secondary",
  },
  {
    key: "success" as const,
    label: "Berhasil",
    icon: CheckCircle2,
    iconClassName: "bg-success/15 text-success",
  },
  {
    key: "failed" as const,
    label: "Gagal",
    icon: XCircle,
    iconClassName: "bg-destructive/15 text-destructive",
  },
];

export default function AkunPage() {
  const { isLoggedIn } = useCart();
  const { data: account, isLoading: isAccountLoading } = useAccount(isLoggedIn);
  const { data: stats, isLoading: isStatsLoading } = useOrderStats(isLoggedIn);

  return (
    <div className="flex flex-col gap-4">
      <section className="bg-secondary-gradient relative overflow-hidden rounded-2xl p-5 text-secondary-foreground">
        <div className="hot-product-shine" aria-hidden="true" />
        <div className="relative flex items-center gap-3">
          <Sparkles className="size-5" />
          <div>
            <p className="text-xs font-medium opacity-80">Selamat datang kembali,</p>
            <p className="truncate text-lg font-bold">
              {isAccountLoading ? "..." : (account?.username ?? "Pengguna")}
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map(({ key, label, icon: Icon, iconClassName }) => (
          <div
            key={key}
            className="rounded-2xl border border-border bg-card-secondary p-4 transition-colors hover:border-primary/40"
          >
            <div className={`flex size-9 items-center justify-center rounded-xl ${iconClassName}`}>
              <Icon className="size-4" />
            </div>
            <p className="mt-3 text-2xl font-bold">
              {isStatsLoading ? (
                <span className="text-muted-foreground">-</span>
              ) : (
                <NumberFlow value={stats?.[key] ?? 0} />
              )}
            </p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-border bg-card-secondary p-5">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-secondary-gradient text-xl font-semibold text-secondary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-card">
            {account?.username?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0 flex-1">
            {isAccountLoading ? (
              <p className="text-sm text-muted-foreground">Memuat...</p>
            ) : (
              <>
                <p className="truncate text-base font-semibold">{account?.username}</p>
                <p className="truncate text-xs text-muted-foreground">{account?.email}</p>
              </>
            )}
          </div>
          {account?.is_verified && (
            <Badge variant="success" className="shrink-0 gap-1">
              <ShieldCheck className="size-3" />
              Terverifikasi
            </Badge>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
          <div className="flex items-center gap-2">
            <Phone className="size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <span className="block text-xs text-muted-foreground">Nomor HP</span>
              <p className="truncate font-medium">{account?.phone || "-"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Store className="size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <span className="block text-xs text-muted-foreground">Tipe Akun</span>
              <p className="truncate font-medium">{account?.is_reseller ? "Reseller" : "Customer"}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
