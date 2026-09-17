"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/components/cart/cart-context";

export default function SignUpOtpPage() {
  const router = useRouter();
  const { refreshAuth } = useCart();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/sign-up-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message ?? "Verifikasi gagal");
      refreshAuth();
      router.push("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verifikasi gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full">
      <div className="flex w-full items-center justify-center px-4 py-8 md:w-1/2">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center gap-2">
            <Image src="/logo-name.png" alt="Oemji" width={40} height={40} />
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold md:text-3xl">Verifikasi Email</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Kami udah kirim kode OTP 6 digit ke email kamu
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="otp" className="text-sm font-medium">
                Kode OTP
              </label>
              <Input
                id="otp"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                autoComplete="one-time-code"
                className="h-11"
                required
              />
            </div>

            <Button type="submit" isLoading={loading} disabled={otp.length !== 6} className="w-full">
              Verifikasi
            </Button>
          </form>
        </div>
      </div>

      <div className="hidden bg-secondary-gradient md:flex md:w-1/2" />
    </div>
  );
}
