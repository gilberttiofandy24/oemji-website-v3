"use client";

import { ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/components/cart/cart-context";

const NavbarCartIcon = () => {
  const { items } = useCart();
  const itemCount = items.length;

  return (
    <Link
      href="/cart"
      aria-label="Keranjang"
      className="relative flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"
    >
      <motion.div whileHover={{ scale: 1.15, rotate: -8 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
        <ShoppingCart className="size-4" />
      </motion.div>
      {itemCount > 0 && (
        <Badge variant="secondary" className="absolute -top-1.5 -right-1.5 h-4 min-w-4 justify-center px-1 text-[10px]">
          {itemCount}
        </Badge>
      )}
    </Link>
  );
};

export default NavbarCartIcon;
