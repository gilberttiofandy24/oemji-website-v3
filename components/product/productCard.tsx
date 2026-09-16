import { Card } from "@/components/ui/card";
import type { PublicProductItem } from "@/lib/backend";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  product: PublicProductItem;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const title = product.display_name || product.name;
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <Card className="h-full overflow-hidden rounded-3xl border-0 p-0 ring-0 transition-all duration-300 ease-out group-hover:scale-105 group-hover:ring-2 group-hover:ring-primary group-hover:ring-offset-2 group-hover:ring-offset-black/50">
        <div className="relative aspect-3/4 w-full overflow-hidden bg-muted">
          {product.thumbnail_url ? (
            <Image
              src={product.thumbnail_url}
              alt={title}
              fill
              loading="eager"
              unoptimized
              sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 768px) 25vw, 33vw"
              className="object-cover transition-all duration-300 ease-out group-hover:blur-xl"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              No image
            </div>
          )}

          <div className="product-card__shimmer" aria-hidden="true" />

          <div className="absolute inset-0 bg-black/0 transition-colors duration-300 ease-out group-hover:bg-black/30" />

          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt=""
              width={64}
              height={64}
              loading="eager"
              className="-translate-y-2 opacity-0 transition-all delay-100 duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100"
            />
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-end p-3 opacity-0 transition-opacity delay-150 duration-300 ease-out group-hover:opacity-100">
            <p className="line-clamp-2 text-center text-xs leading-snug font-semibold text-white sm:text-sm">
              {title}
            </p>
            <p className="line-clamp-1 text-center text-[10px] font-light text-white/80 sm:text-xs">
              {product.category}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ProductCard;
