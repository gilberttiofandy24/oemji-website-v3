import type { Metadata } from "next";
import Link from "next/link";
import { getPublicProducts } from "@/lib/backend";

export const metadata: Metadata = {
  title: "Semua Produk",
  alternates: { canonical: "/product" },
};

export default async function ProductListPage() {
  const { data: products } = await getPublicProducts({ take_all: true });

  return (
    <div className="bg-background mt-15">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <h1 className="text-foreground text-2xl font-bold">Semua Produk</h1>
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {products.map((product) => (
            <li key={product.id}>
              <Link
                href={`/product/${product.slug}`}
                className="bg-card border-border block rounded-lg border p-3 text-sm text-foreground"
              >
                {product.display_name ?? product.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
