"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export function HomeBanner() {
  const bannerImages = [
    "/images/banner06.jpg",
    "/images/1.jpg",
    "/images/2.jpg",
    "/images/3.jpg",
    "/images/4.jpg",
    "/images/5.jpg",
  ];

  const [currentSlide, setCurrentSlide] = useState(0); // Start with first banner (index 0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [bannerImages.length]);

  return (
    <div className="w-full relative overflow-hidden">
      {/* Banner container aligned with header */}
      <div className="sm:max-w-7xl sm:mx-auto sm:px-6 md:px-8">
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="relative overflow-hidden">
            {/* Carousel container */}
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {bannerImages.map((image, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-full h-24 sm:h-36 md:h-48 lg:h-64 relative"
                >
                  <Image
                    src={image}
                    alt={`Banner ${index + 1}`}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Carousel dots - mobile optimized */}
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1.5 sm:space-x-2">
            {bannerImages.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full cursor-pointer transition-colors ${
                  index === currentSlide ? "bg-green-500" : "bg-white/70"
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>

          {/* Mobile swipe indicator */}
          <div className="absolute top-2 right-2 sm:hidden">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-white rounded-full opacity-60"></div>
              <div className="w-1 h-1 bg-white rounded-full opacity-60"></div>
              <div className="w-1 h-1 bg-white rounded-full opacity-60"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
