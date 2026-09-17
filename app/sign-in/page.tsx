"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useCart } from "@/components/cart/cart-context";

export default function SignInPage() {
  const router = useRouter();
  const { refreshAuth } = useCart();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier.trim() || !password) {
      toast.error("Isi email/username dan password terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message ?? "Gagal masuk");
      refreshAuth();
      router.push("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal masuk");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full">
      <div className="flex w-full items-center justify-center px-4 py-8 md:w-1/2">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Kembali ke Beranda
          </Link>

          <Link href="/" className="mb-8 flex items-center gap-2">
            <Image src="/logo-name.png" alt="Oemji" width={40} height={40} />
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold md:text-3xl">Masuk ke Oemji</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Masuk buat pakai keranjang dan lacak pesanan kamu
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="identifier" className="text-sm font-medium">
                Email atau Username
              </label>
              <Input
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="kamu@email.com atau username"
                autoComplete="username"
                className="h-11"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="h-11"
                required
              />
            </div>

            <Button type="submit" isLoading={loading} className="w-full">
              Masuk
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link href="/sign-up" className="text-primary underline underline-offset-2">
              Daftar
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden bg-secondary-gradient md:flex md:w-1/2" />
    </div>
  );
}
