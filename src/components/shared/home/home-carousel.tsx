"use client";

import * as React from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HomeCarousel({
  items,
}: {
  items: {
    image: string;
    url: string;
    title: string;
    buttonCaption: string;
  }[];
}) {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );
  const [api, setApi] = React.useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    const onSelect = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  return (
    <Carousel
      dir="ltr"
      plugins={[plugin.current]}
      className="w-full mx-auto "
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
      setApi={setApi}
    >
      <CarouselContent>
        {items.map((item) => (
          <CarouselItem key={item.title}>
            <Link href={item.url}>
              <div className="flex aspect-[16/8] sm:aspect-[16/7] md:aspect-[16/6] items-center justify-center p-2 sm:p-4 md:p-6 relative -m-1">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute w-2/3 sm:w-1/2 md:w-1/3 left-4 sm:left-8 md:left-16 lg:left-32 top-1/2 transform -translate-y-1/2">
                  <h2 className="text-sm sm:text-lg md:text-2xl lg:text-4xl xl:text-6xl font-bold mb-2 sm:mb-4 text-primary whitespace-pre-line">
                    {item.title}
                  </h2>
                  <Button className="hidden sm:block text-xs sm:text-sm md:text-base">
                    {item.buttonCaption}
                  </Button>
                </div>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      {canScrollPrev && (
        <CarouselPrevious className="left-0 md:left-12 !top-auto !bottom-10 bg-blue-500 hover:bg-blue-700 text-white border-gray-700 !-translate-y-0" />
      )}
      {canScrollNext && (
        <CarouselNext className="right-0 md:right-12 !top-auto !bottom-10 bg-blue-500 hover:bg-blue-700 text-white border-gray-700 !-translate-y-0" />
      )}
    </Carousel>
  );
}
