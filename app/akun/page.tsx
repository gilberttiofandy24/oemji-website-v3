"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { History, KeyRound, LogOut, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/components/cart/cart-context";
import { useAccount } from "@/hooks/use-account";

export default function AkunPage() {
  const router = useRouter();
  const { isLoggedIn, authChecked, refreshAuth } = useCart();
  const { data: account, isLoading } = useAccount(isLoggedIn);

  useEffect(() => {
    if (authChecked && !isLoggedIn) {
      router.push("/sign-in");
    }
  }, [authChecked, isLoggedIn, router]);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Lengkapi semua field password");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.message ?? "Gagal mengganti password");
        return;
      }
      toast.success("Password berhasil diganti");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Gagal mengganti password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogoutAll = async () => {
    setIsLoggingOutAll(true);
    try {
      await fetch("/api/auth/logout-all", { method: "POST" });
      refreshAuth();
      router.push("/");
    } finally {
      setIsLoggingOutAll(false);
    }
  };

  if (!authChecked || !isLoggedIn) return null;

  return (
    <div className="bg-background mt-15 min-h-screen">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6 sm:px-6">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <User className="size-5" />
          Akun Saya
        </h1>

        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-secondary-gradient text-xl font-semibold text-primary-foreground">
              {account?.username?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              {isLoading ? (
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
            <div>
              <span className="text-xs text-muted-foreground">Nomor HP</span>
              <p className="font-medium">{account?.phone || "-"}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Tipe Akun</span>
              <p className="font-medium">{account?.is_reseller ? "Reseller" : "Customer"}</p>
            </div>
          </div>
        </section>

        <Link
          href="/riwayat"
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 hover:border-primary/40"
        >
          <History className="size-5 shrink-0 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Riwayat Pesanan</p>
            <p className="text-xs text-muted-foreground">Lihat semua pesanan kamu</p>
          </div>
        </Link>

        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <KeyRound className="size-4 text-primary" />
            <p className="text-sm font-semibold">Ganti Password</p>
          </div>
          <div className="mt-3 flex flex-col gap-2.5">
            <Input
              type="password"
              placeholder="Password lama"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="h-9"
            />
            <Input
              type="password"
              placeholder="Password baru"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-9"
            />
            <Input
              type="password"
              placeholder="Konfirmasi password baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-9"
            />
            <Button onClick={handleChangePassword} disabled={isChangingPassword} className="mt-1">
              {isChangingPassword ? "Menyimpan..." : "Simpan Password Baru"}
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-destructive/30 bg-card p-5">
          <div className="flex items-center gap-2">
            <LogOut className="size-4 text-destructive" />
            <p className="text-sm font-semibold">Keluar dari Semua Perangkat</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Ini akan mengeluarkan kamu dari semua device yang sedang login, termasuk perangkat ini.
          </p>
          <Button
            variant="destructive"
            onClick={handleLogoutAll}
            disabled={isLoggingOutAll}
            className="mt-3"
          >
            {isLoggingOutAll ? "Memproses..." : "Keluar dari Semua Perangkat"}
          </Button>
        </section>
      </div>
    </div>
  );
}
