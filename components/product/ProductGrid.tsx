"use client";

import ProductCard from "@/components/product/productCard";
import { PAGE_SIZE } from "@/components/product/constants";
import type { PublicProductItem } from "@/lib/backend";
import { motion, useReducedMotion } from "motion/react";

interface ProductGridProps {
  products: PublicProductItem[];
}

const ProductGrid = ({ products }: ProductGridProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.25,
            delay: shouldReduceMotion ? 0 : (index % PAGE_SIZE) * 0.04,
          }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </div>
  );
};

export default ProductGrid;
