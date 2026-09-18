"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { CheckCircle2, ShieldCheck, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import type { MeUserData } from "@/lib/backend";

type Stage = "idle" | "setup" | "recovery-codes";

export function TwoFactorSection({
  account,
  onChanged,
}: {
  account: MeUserData | undefined;
  onChanged: () => void;
}) {
  const [stage, setStage] = useState<Stage>("idle");
  const [qrImage, setQrImage] = useState("");
  const [secret, setSecret] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [isDisabling, setIsDisabling] = useState(false);
  const [showDisableForm, setShowDisableForm] = useState(false);

  const handleStartSetup = async () => {
    setIsSettingUp(true);
    try {
      const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message ?? "Gagal memulai setup 2FA");
      setQrImage(body.data.qr_image);
      setSecret(body.data.secret);
      setStage("setup");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memulai setup 2FA");
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyCode.trim()) return;
    setIsVerifying(true);
    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verifyCode.trim() }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message ?? "Kode tidak valid");
      setRecoveryCodes(body.data.recovery_codes);
      setStage("recovery-codes");
      setVerifyCode("");
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kode tidak valid");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisable = async () => {
    if (!disablePassword || !disableCode.trim()) {
      toast.error("Isi password dan kode verifikasi");
      return;
    }
    setIsDisabling(true);
    try {
      const res = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: disablePassword, code: disableCode.trim() }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message ?? "Gagal menonaktifkan 2FA");
      toast.success("2FA dinonaktifkan");
      setDisablePassword("");
      setDisableCode("");
      setShowDisableForm(false);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menonaktifkan 2FA");
    } finally {
      setIsDisabling(false);
    }
  };

  const finishSetup = () => {
    setStage("idle");
    setQrImage("");
    setSecret("");
    setRecoveryCodes([]);
  };

  if (stage === "recovery-codes") {
    return (
      <section className="rounded-2xl border border-success/30 bg-card-secondary p-5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-success/15 text-success">
            <CheckCircle2 className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">2FA Berhasil Diaktifkan</p>
            <p className="text-xs text-muted-foreground">
              Simpan recovery code ini baik-baik — hanya ditampilkan sekali
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-background-secondary p-4 font-mono text-sm sm:grid-cols-4">
          {recoveryCodes.map((code) => (
            <span key={code}>{code}</span>
          ))}
        </div>
        <Button onClick={finishSetup} className="mt-4">
          Selesai
        </Button>
      </section>
    );
  }

  if (stage === "setup") {
    return (
      <section className="rounded-2xl border border-border bg-card-secondary p-5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
            <ShieldCheck className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Scan QR Code</p>
            <p className="text-xs text-muted-foreground">
              Gunakan Google Authenticator atau aplikasi authenticator lainnya
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-col items-center gap-3">
          {qrImage && (
            <Image
              src={qrImage}
              alt="QR Code 2FA"
              width={200}
              height={200}
              unoptimized
              className="rounded-xl border border-border bg-white p-2"
            />
          )}
          <p className="text-center text-xs text-muted-foreground">
            Atau masukkan kode manual: <span className="font-mono text-foreground">{secret}</span>
          </p>
        </div>
        <div className="mt-4 flex flex-col gap-2.5">
          <Input
            placeholder="Masukkan kode 6 digit"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
            maxLength={6}
          />
          <div className="flex gap-2">
            <Button onClick={handleVerify} disabled={isVerifying} className="flex-1">
              {isVerifying ? "Memverifikasi..." : "Verifikasi & Aktifkan"}
            </Button>
            <Button variant="secondary" onClick={finishSetup}>
              Batal
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (account?.totp_enabled) {
    return (
      <section className="rounded-2xl border border-success/30 bg-card-secondary p-5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-success/15 text-success">
            <ShieldCheck className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Verifikasi 2 Langkah (2FA) Aktif</p>
            <p className="text-xs text-muted-foreground">
              {account.recovery_codes_remaining} recovery code tersisa
            </p>
          </div>
        </div>

        {showDisableForm ? (
          <div className="mt-4 flex flex-col gap-2.5">
            <PasswordInput
              placeholder="Password"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
            />
            <Input
              placeholder="Kode 2FA"
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value)}
              maxLength={6}
            />
            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleDisable} disabled={isDisabling} className="flex-1">
                {isDisabling ? "Menonaktifkan..." : "Nonaktifkan 2FA"}
              </Button>
              <Button variant="secondary" onClick={() => setShowDisableForm(false)}>
                Batal
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="destructive" onClick={() => setShowDisableForm(true)} className="mt-3 gap-2">
            <ShieldOff className="size-4" />
            Nonaktifkan 2FA
          </Button>
        )}
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card-secondary p-5">
      <div className="flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
          <ShieldCheck className="size-4" />
        </div>
        <div>
          <p className="text-sm font-semibold">Verifikasi 2 Langkah (2FA)</p>
          <p className="text-xs text-muted-foreground">
            Tambah lapisan keamanan ekstra dengan aplikasi authenticator
          </p>
        </div>
      </div>
      <Button onClick={handleStartSetup} disabled={isSettingUp} className="mt-3">
        {isSettingUp ? "Memuat..." : "Aktifkan 2FA"}
      </Button>
    </section>
  );
}
