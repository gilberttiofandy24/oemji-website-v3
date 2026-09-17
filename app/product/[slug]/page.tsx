import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicProductBySlug } from "@/lib/backend";
import ProductOrderForm from "./_components/ProductOrderForm";

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
        <ProductOrderForm product={product} title={title} denoms={denoms} />
      </div>
    </div>
  );
}
