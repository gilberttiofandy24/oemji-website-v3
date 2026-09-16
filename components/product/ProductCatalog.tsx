"use client";

import { useState } from "react";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import ProductGrid from "@/components/product/ProductGrid";
import { PAGE_SIZE } from "@/components/product/constants";
import { cn } from "@/lib/utils";
import type { PublicProductItem } from "@/lib/backend";

const ALL_TAB = "Semua";

interface PaginatedProducts {
  data: PublicProductItem[];
  meta: { has_next_page: boolean };
}

async function fetchProducts(page: number, category?: string): Promise<PaginatedProducts> {
  const params = new URLSearchParams({ limit: String(PAGE_SIZE), page: String(page) });
  if (category) params.set("category", category);
  const res = await fetch(`/api/products?${params.toString()}`);
  if (!res.ok) throw new Error("failed to fetch products");
  return res.json();
}

interface ProductCatalogProps {
  categories: string[];
  initialCatalog: PaginatedProducts;
}

const ProductCatalog = ({ categories, initialCatalog }: ProductCatalogProps) => {
  const [activeCategory, setActiveCategory] = useState(ALL_TAB);
  const tabs = [ALL_TAB, ...categories];

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["products", activeCategory],
    queryFn: ({ pageParam }) =>
      fetchProducts(pageParam, activeCategory === ALL_TAB ? undefined : activeCategory),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.meta.has_next_page ? allPages.length + 1 : undefined,
    initialData:
      activeCategory === ALL_TAB ? { pages: [initialCatalog], pageParams: [1] } : undefined,
    placeholderData: keepPreviousData,
  });

  const products = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div>
      <div className="flex gap-6 overflow-x-auto border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveCategory(tab)}
            className={cn(
              "shrink-0 border-b-2 pb-3 text-sm font-medium transition-colors",
              activeCategory === tab
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {products.length > 0 ? (
        <>
          <ProductGrid key={activeCategory} products={products} />
          {hasNextPage && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="rounded-lg border border-border px-6 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
              >
                {isFetchingNextPage ? "Memuat..." : "Lebih Banyak"}
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="mt-8 text-sm">Belum Ada Product Tersedia.</p>
      )}
    </div>
  );
};

export default ProductCatalog;
