"use client";

import { usePathname } from "next/navigation";
import NavBar from "@/components/navbar/NavBar";
import Footer from "@/components/Footer";
import { CartWidget } from "@/components/cart/CartWidget";

const AUTH_ROUTES = ["/sign-in", "/sign-up", "/sign-up-otp"];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isAuthRoute) {
    return <main className="min-h-screen bg-background">{children}</main>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NavBar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartWidget />
    </div>
  );
}
