"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LogOut, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { useCart } from "@/components/cart/cart-context";
import { useAccount } from "@/hooks/use-account";
import { TwoFactorSection } from "./TwoFactorSection";

export default function SettingsPage() {
  const router = useRouter();
  const { isLoggedIn, refreshAuth } = useCart();
  const { data: account, refetch: refetchAccount } = useAccount(isLoggedIn);

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

  return (
    <div className="flex flex-col gap-4">
      <h1 className="flex items-center gap-2 text-xl font-semibold">
        <SettingsIcon className="size-5" />
        Settings
      </h1>

      <section className="rounded-2xl border border-border bg-card-secondary p-5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <KeyRound className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Ganti Password</p>
            <p className="text-xs text-muted-foreground">Perbarui password akun kamu secara berkala</p>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2.5">
          <PasswordInput
            placeholder="Password lama"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <PasswordInput
            placeholder="Password baru"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <PasswordInput
            placeholder="Konfirmasi password baru"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button onClick={handleChangePassword} disabled={isChangingPassword} className="mt-1">
            {isChangingPassword ? "Menyimpan..." : "Simpan Password Baru"}
          </Button>
        </div>
      </section>

      <TwoFactorSection account={account} onChanged={() => refetchAccount()} />

      <section className="rounded-2xl border border-destructive/30 bg-card-secondary p-5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
            <LogOut className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Keluar dari Semua Perangkat</p>
            <p className="text-xs text-muted-foreground">
              Mengeluarkan kamu dari semua device yang sedang login, termasuk perangkat ini
            </p>
          </div>
        </div>
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
  );
}
