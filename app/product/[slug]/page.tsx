import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicProductBySlug } from "@/lib/backend";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await getPublicProductBySlug(slug).catch(() => ({ data: null }));
  if (!data) return {};

  const { product } = data;
  const baseTitle = product.display_name ?? product.name;
  const title =
    product.seo_aliases.length > 0
      ? `${baseTitle} (${product.seo_aliases.join("/")})`
      : baseTitle;

  return {
    title,
    description: product.description ?? undefined,
    alternates: { canonical: `/product/${slug}` },
    openGraph: {
      title,
      description: product.description ?? undefined,
      images: product.image_url ? [product.image_url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const { data } = await getPublicProductBySlug(slug).catch(() => ({ data: null }));
  if (!data) notFound();

  const { product, denoms } = data;
  const title = product.display_name ?? product.name;
  const prices = denoms.map((d) => Number(d.sell_price));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    description: product.description ?? undefined,
    image: product.image_url ?? undefined,
    category: product.category,
    ...(product.seo_aliases.length > 0 && { alternateName: product.seo_aliases }),
    ...(prices.length > 0 && {
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "IDR",
        lowPrice: Math.min(...prices),
        highPrice: Math.max(...prices),
        offerCount: denoms.length,
      },
    }),
  };

  return (
    <div className="bg-background mt-15">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <h1 className="text-foreground text-2xl font-bold">{title}</h1>
        {product.description && (
          <p className="text-muted-foreground mt-2">{product.description}</p>
        )}
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {denoms.map((denom) => (
            <li
              key={denom.id}
              className="bg-card border-border rounded-lg border p-3 text-sm text-foreground"
            >
              {denom.denom} — Rp{Number(denom.sell_price).toLocaleString("id-ID")}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
