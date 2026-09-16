"use client";

import { Command, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Command as CommandPrimitive } from "cmdk";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ProductSearchResults from "@/components/navbar/ProductSearchResults";
import { useProductSearch } from "@/components/navbar/useProductSearch";

interface NavbarSearchInputProps {
  className?: string;
}

const NavbarSearchInput = ({ className }: NavbarSearchInputProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { query, setQuery, results, isLoading, goToProduct } =
    useProductSearch();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showDropdown = isOpen && query.length > 0;

  const handleSelect = (slug: string) => {
    setIsOpen(false);
    goToProduct(slug);
  };

  return (
    <div ref={containerRef} className={cn("relative hidden w-full md:flex", className)}>
      <Command
        shouldFilter={false}
        className="w-full rounded-none border-0 bg-transparent p-0"
      >
        <div className="relative w-full">
          <CommandPrimitive.Input
            placeholder="Cari Game atau Voucher"
            value={query}
            onValueChange={(value) => {
              setQuery(value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="h-9 w-full rounded-lg border-0 bg-background-input pl-9 text-sm focus:ring-2 focus:ring-primary focus:outline-primary disabled:cursor-not-allowed disabled:opacity-75"
          />
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <button
            type="button"
            onClick={() => setQuery('')}
            className={cn('outline-none', query.length === 0 && 'invisible')}
          >
            <X className="absolute top-1/2 right-3 size-4 -translate-y-1/2" />
          </button>
        </div>
        {showDropdown && (
          <CommandList className="border absolute inset-x-0 top-full z-50 mt-1 max-h-112 min-h-21 rounded-lg border-border bg-background-input">
            <ProductSearchResults
              isLoading={isLoading}
              results={results}
              query={query}
              onSelect={handleSelect}
            />
          </CommandList>
        )}
      </Command>
    </div>
  );
};

export default NavbarSearchInput;
