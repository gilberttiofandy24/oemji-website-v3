"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { History, LayoutDashboard, LogOut, Menu, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart/cart-context";
import { useAccount } from "@/hooks/use-account";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

const navItems = [
  { href: "/akun", label: "Dashboard", icon: LayoutDashboard },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/riwayat", label: "Riwayat Transaksi", icon: History },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, authChecked, refreshAuth } = useCart();
  const { data: account } = useAccount(isLoggedIn);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (authChecked && !isLoggedIn) {
      router.push("/sign-in");
    }
  }, [authChecked, isLoggedIn, router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    refreshAuth();
    router.push("/");
  };

  if (!authChecked || !isLoggedIn) return null;

  const currentLabel = navItems.find((item) => item.href === pathname)?.label ?? "Akun";

  const navContent = (
    <>
      <div className="flex items-center gap-3 border-b border-border p-4 sm:p-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-card-teritary text-sm font-medium text-foreground">
          {account?.username?.charAt(0).toUpperCase() ?? "?"}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{account?.username ?? "Memuat..."}</p>
          <p className="truncate text-xs text-muted-foreground">{account?.email ?? ""}</p>
        </div>
      </div>

      <div className="flex flex-col gap-0.5 p-3">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileNavOpen(false)}
              className={cn(
                "flex items-center gap-2.5 border-l-2 px-3 py-2.5 text-sm transition-colors",
                active
                  ? "border-primary font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("size-4", active && "text-primary")} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto border-t border-border p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="size-4" />
          Keluar
        </button>
      </div>
    </>
  );

  return (
    <div className="bg-background mt-15 flex min-h-[calc(100vh-3.75rem)] flex-col">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-3 py-4 sm:px-6 sm:py-8">
        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-black/20">
          <div className="flex items-center gap-3 border-b border-border p-4 sm:hidden">
            <Button variant="ghost" size="icon" className="size-8 shrink-0" onClick={() => setMobileNavOpen(true)}>
              <Menu className="size-5" />
            </Button>
            <p className="text-sm font-medium">{currentLabel}</p>
          </div>

          <div className="flex flex-1 items-stretch overflow-hidden">
            <nav className="hidden shrink-0 flex-col border-r border-border bg-background-secondary sm:flex sm:w-64">
              {navContent}
            </nav>

            <div className="min-w-0 flex-1 overflow-x-auto p-4 sm:p-6">{children}</div>
          </div>
        </div>
      </div>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent className="flex w-72 flex-col gap-0 bg-background-secondary p-0">
          <SheetTitle className="sr-only">Menu akun</SheetTitle>
          {navContent}
        </SheetContent>
      </Sheet>
    </div>
  );
}
