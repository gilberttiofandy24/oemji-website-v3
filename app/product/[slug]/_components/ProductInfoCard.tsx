import Image from "next/image";
import type { PublicProductItem } from "@/lib/backend";

interface ProductInfoCardProps {
  product: PublicProductItem;
  title: string;
}

const ProductInfoCard = ({ product, title }: ProductInfoCardProps) => {
  return (
    <div className="rounded-xl border border-border p-4 bg-card">
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
          {product.image_url && (
            <Image
              src={product.image_url}
              alt={title}
              fill
              unoptimized
              sizes="64px"
              className="object-cover"
            />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">{product.category}</span>
          <h1 className="text-lg leading-snug font-semibold">{title}</h1>
        </div>
      </div>

      {product.description && (
        <div
          className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground [&_a]:underline [&_p]:mb-2 [&_p:last-child]:mb-0"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      )}
    </div>
  );
};

export default ProductInfoCard;
