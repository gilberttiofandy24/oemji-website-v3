import { Suspense } from "react";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCatalog from "@/components/product/ProductCatalog";
import { getPublicCarousels, getPublicProducts } from "@/lib/backend";

function ProductCatalogSkeleton() {
  return (
    <div>
      <div className="flex gap-6 border-b border-border">
        <div className="h-8 w-16 animate-pulse rounded bg-muted" />
        <div className="h-8 w-16 animate-pulse rounded bg-muted" />
      </div>
      <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-3/4 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}

export default async function Home() {
  const [{ data: carousels }, initialCatalog, { data: allProducts }] = await Promise.all([
    getPublicCarousels(),
    getPublicProducts({ limit: 12 }),
    getPublicProducts({ take_all: true }),
  ]);

  const categories = Array.from(new Set(allProducts.map((p) => p.category)));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Oemji",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    logo: "/logo-name.png",
  };

  return (
    <div className="mt-15">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroCarousel items={carousels} />

      <div className="mx-auto w-full max-w-6xl px-4 pb-6 sm:px-6">
        <Suspense fallback={<ProductCatalogSkeleton />}>
          <ProductCatalog categories={categories} initialCatalog={initialCatalog} />
        </Suspense>
      </div>
    </div>
  );
}
