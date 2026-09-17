"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !username.trim()) {
      toast.error("Isi email dan username terlebih dahulu");
      return;
    }
    if (!/^08[0-9]{8,11}$/.test(phone)) {
      toast.error("Nomor WhatsApp tidak valid (contoh: 08xxxxxxxxxx)");
      return;
    }
    if (password.length < 8) {
      toast.error("Password minimal 8 karakter");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, phone, password }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message ?? "Gagal mendaftar");
      router.push("/sign-up-otp");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mendaftar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full">
      <div className="flex w-full items-center justify-center px-4 py-8 md:w-3/5">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-2">
            <Image src="/logo-name.png" alt="Oemji" width={40} height={40} />
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold md:text-3xl">Daftar Akun</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Buat akun buat pakai keranjang dan lacak pesanan kamu
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kamu@email.com"
                autoComplete="email"
                className="h-11"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  className="h-11"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="phone" className="text-sm font-medium">
                  Nomor WhatsApp
                </label>
                <Input
                  id="phone"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="08xxxxxxxxxx"
                  autoComplete="tel"
                  className="h-11"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="h-11"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirm-password" className="text-sm font-medium">
                Konfirmasi Password
              </label>
              <PasswordInput
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="h-11"
                required
              />
            </div>

            <Button type="submit" isLoading={loading} className="w-full">
              Daftar
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Udah punya akun?{" "}
            <Link href="/sign-in" className="text-primary underline underline-offset-2">
              Masuk
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden bg-secondary-gradient md:flex md:w-2/5" />
    </div>
  );
}
