"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import type { PublicCarouselItem } from "@/lib/backend";
import AutoScroll from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface HeroCarouselProps {
  items: PublicCarouselItem[];
}

const HeroCarousel = ({ items }: HeroCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [autoplay] = useState(() => AutoScroll({ delay: 5000, stopOnInteraction: false }));

  useEffect(() => {
    if (!api) return;
    api.on("select", () => autoplay.reset());
  }, [api, autoplay]);

  const slides = items.filter((item) => item.image_url);
  if (slides.length === 0) {
    return null;
  }

  return (
    <section className="relative flex items-center overflow-hidden bg-sidebar-accent px-4 py-4 lg:min-h-138.5 lg:py-8">
      <div className="mx-auto w-full max-w-6xl px-4 pb-6 sm:px-6">
        <Carousel opts={{ loop: true }} plugins={[autoplay]} setApi={setApi} className="w-full">
          <CarouselContent>
            {slides.map((item) => (
              <CarouselItem key={item.id}>
                <CarouselSlide item={item} />
              </CarouselItem>
            ))}
          </CarouselContent>
          {slides.length > 1 && (
            <>
              <CarouselPrevious className="left-4 bg-background-input/50 outline-primary border-0" />
              <CarouselNext className="right-4 bg-background-input/50 outline-primary border-0" />
            </>
          )}
        </Carousel>
      </div>
    </section>
  );
};

const CarouselSlide = ({ item }: { item: PublicCarouselItem }) => {
  const image = (
    <div className="relative aspect-21/9 w-full overflow-hidden rounded-3xl bg-muted">
      <Image
        src={item.image_url as string}
        alt={item.title ?? "Promo banner"}
        fill
        unoptimized
        priority
        loading="eager"
        sizes="100vw"
        className="object-cover"
      />
    </div>
  );

  if (item.product_slug) {
    return <Link href={`/product/${item.product_slug}`}>{image}</Link>;
  }

  if (item.link_url) {
    return (
      <a href={item.link_url} target="_blank" rel="noopener noreferrer">
        {image}
      </a>
    );
  }

  return image;
};

export default HeroCarousel;
