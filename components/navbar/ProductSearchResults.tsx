import { CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import type { PublicProductItem } from "@/lib/backend";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Fragment } from "react";

interface ProductSearchResultsProps {
  isLoading: boolean;
  results: PublicProductItem[];
  query: string;
  onSelect: (slug: string) => void;
}

function highlightMatch(text: string, query: string) {
  const trimmed = query.trim();
  if (!trimmed) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = trimmed.toLowerCase();
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  let index = lowerText.indexOf(lowerQuery, cursor);

  if (index === -1) return text;

  while (index !== -1) {
    parts.push(
      <Fragment key={`${cursor}-text`}>{text.slice(cursor, index)}</Fragment>
    );
    parts.push(
      <span key={`${cursor}-match`} className="text-primary">
        {text.slice(index, index + trimmed.length)}
      </span>
    );
    cursor = index + trimmed.length;
    index = lowerText.indexOf(lowerQuery, cursor);
  }
  parts.push(<Fragment key={`${cursor}-rest`}>{text.slice(cursor)}</Fragment>);

  return parts;
}

const ProductSearchResults = ({
  isLoading,
  results,
  query,
  onSelect,
}: ProductSearchResultsProps) => {
  if (isLoading) {
    return (
      <div className="flex h-21 items-center justify-center gap-2 text-sm">
        <Loader2 className="size-4 animate-spin" />
        Mencari...
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <CommandEmpty className="p-0">
        <div className="flex h-21 w-full flex-col items-center justify-center gap-2">
          <h1 className="text-lg">Product Tidak Ditemukan.</h1>
          <h2 className="text-sm">Mohon pastikan nama produk.</h2>
        </div>
      </CommandEmpty>
    );
  }

  return (
    <CommandGroup className="p-0">
      {results.map((product) => (
        <CommandItem
          key={product.id}
          value={product.slug}
          onSelect={() => onSelect(product.slug)}
          className="w-full cursor-pointer gap-3 rounded-none py-2.5"
        >
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
            {product.thumbnail_url && (
              <Image
                src={product.thumbnail_url}
                alt=""
                fill
                loading="eager"
                sizes="60px"
                className="object-cover"
                unoptimized
              />
            )}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate font-medium">
              {highlightMatch(product.display_name || product.name, query)}
            </span>
            <span className="truncate text-sm">{product.category}</span>
          </div>
        </CommandItem>
      ))}
    </CommandGroup>
  );
};

export default ProductSearchResults;
