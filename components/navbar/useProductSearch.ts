"use client";

import type { PublicProductItem } from "@/lib/backend";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useProductSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PublicProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }

    setIsLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ name: query, limit: "6" });
        const res = await fetch(`/api/products?${params.toString()}`);
        const { data } = await res.json();
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const goToProduct = (slug: string) => {
    setQuery("");
    router.push(`/product/${slug}`);
  };

  return { query, setQuery, results, isLoading, goToProduct };
}
