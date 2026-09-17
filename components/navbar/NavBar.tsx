"use client";

import NavbarSearchInput from "@/components/navbar/NavbarSearchInput";
import NavbarCartIcon from "@/components/navbar/NavbarCartIcon";
import ProductSearchResults from "@/components/navbar/ProductSearchResults";
import { useProductSearch } from "@/components/navbar/useProductSearch";
import { useCart } from "@/components/cart/cart-context";
import { useAccount } from "@/hooks/use-account";
import { Button } from "@/components/ui/button";
import { Command, CommandList } from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Command as CommandPrimitive } from "cmdk";
import { LayoutDashboard, LogOut, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const NavBar = () => {
  const headerRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const { isLoggedIn, refreshAuth } = useCart();
  const { data: account } = useAccount(isLoggedIn);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { query, setQuery, results, isLoading, goToProduct } =
    useProductSearch();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    refreshAuth();
    router.push("/");
  };

  const closeMobileSearch = () => {
    setIsMobileSearchOpen(false);
    setQuery('');
  };

  const handleSelect = (slug: string) => {
    closeMobileSearch();
    goToProduct(slug);
  };

  return (
    <header
      ref={headerRef}
      className="fixed top-0 z-40 w-full bg-background-secondary/80 backdrop-blur border-b border-border"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative flex h-15 flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-name.png"
              alt="Oemji"
              width={40}
              height={40}
              priority
            />
          </Link>
          <NavbarSearchInput />
          <div className="flex items-center justify-end gap-2">
            {!isMobileSearchOpen && (
              <button
                type="button"
                aria-label="Cari Game atau Voucher"
                onClick={() => setIsMobileSearchOpen(true)}
                className="flex size-9 items-center justify-center rounded-lg bg-background-input md:hidden"
              >
                <Search className="size-4" />
              </button>
            )}
            {isLoggedIn ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label="Akun Saya"
                      className="flex size-9 items-center justify-center rounded-full bg-secondary-gradient text-sm font-semibold text-primary-foreground"
                    >
                      {account?.username?.charAt(0).toUpperCase() ?? "?"}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem asChild>
                      <Link href="/akun">
                        <LayoutDashboard className="size-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="size-4" />
                      Keluar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <NavbarCartIcon />
              </>
            ) : (
              <Button variant="default" size="sm" className="text-foreground" asChild>
                <Link href="/sign-in">Masuk</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {isMobileSearchOpen && (
        <div className="relative w-full px-4 py-3 sm:px-6 md:hidden">
          <Command
            shouldFilter={false}
            className="overflow-visible border-0 bg-transparent p-0"
          >
            <div className="relative w-full">
              <CommandPrimitive.Input
                autoFocus
                placeholder="Cari Game atau Voucher"
                value={query}
                onValueChange={setQuery}
                className="h-10 w-full rounded-lg border-0 bg-background-input pr-9 pl-9 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-75"
              />
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <button
                type="button"
                aria-label="Tutup pencarian"
                onClick={closeMobileSearch}
                className="absolute top-1/2 right-3 -translate-y-1/2"
              >
                <X className="size-4" />
              </button>
              {query.length > 0 && (
                <CommandList className="border-0.5 absolute inset-x-0 top-full z-40 mt-2 max-h-96 min-h-21 rounded-lg border-primary bg-background-input shadow-lg">
                  <ProductSearchResults
                    isLoading={isLoading}
                    results={results}
                    query={query}
                    onSelect={handleSelect}
                  />
                </CommandList>
              )}
            </div>
          </Command>
        </div>
      )}
    </header>
  );
};

export default NavBar;
