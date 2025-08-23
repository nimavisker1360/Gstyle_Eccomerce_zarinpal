"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// Carousel imports removed - now using static grid
import { Button } from "@/components/ui/button";
import DiscountProductCard from "./discount-product-card";

interface ShoppingProduct {
  id: string;
  title: string;
  originalTitle?: string;
  price: number;
  originalPrice?: number | null;
  currency: string;
  image: string;
  description: string;
  originalDescription?: string;
  link?: string;
  googleShoppingLink?: string;
  source: string;
  rating: number;
  reviews: number;
  delivery: string;
  priceInRial?: number; // Add support for Rial price
}

interface LatestDiscountsSliderProps {
  // No props needed - will fetch data internally
}

export default function LatestDiscountsSlider({}: LatestDiscountsSliderProps) {
  const [products, setProducts] = useState<ShoppingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch discount products from both APIs
  useEffect(() => {
    const fetchDiscountProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("🔍 Fetching discount products from both APIs...");

        // Check client-side cache first
        const cacheKey = "discountproducts_home_combined";
        const cacheExpiry = 10 * 60 * 1000; // 10 minutes
        const cached = localStorage.getItem(cacheKey);
        const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);

        if (cached && cacheTimestamp) {
          const now = Date.now();
          const timestamp = parseInt(cacheTimestamp);

          if (now - timestamp < cacheExpiry) {
            console.log(
              "✅ Using cached combined discount products from localStorage"
            );
            const cachedProducts = JSON.parse(cached) as ShoppingProduct[];
            setProducts(cachedProducts);
            setLoading(false);
            return;
          }
        }

        // Fetch from both APIs
        const [discountsResponse, under6MResponse] = await Promise.all([
          fetch(`/api/shopping/discounts`),
          fetch(`/api/shopping/products-under-6m`),
        ]);

        let allProducts: ShoppingProduct[] = [];

        // Process discounts API response
        if (discountsResponse.ok) {
          const discountsData = await discountsResponse.json();
          if (discountsData.products && Array.isArray(discountsData.products)) {
            const underTwo = (
              discountsData.products as ShoppingProduct[]
            ).filter(
              (p) =>
                typeof p.price === "number" && p.price > 0 && p.price <= 2000
            );
            // Take more products from discounts API
            allProducts.push(...underTwo.slice(0, 20)); // Increased from unlimited to 20
          }
        }

        // Process products under 6M Rials API response
        if (under6MResponse.ok) {
          const under6MData = await under6MResponse.json();
          if (under6MData.products && Array.isArray(under6MData.products)) {
            // Filter products that are actually under 6M Rials
            const under6MProducts = (
              under6MData.products as ShoppingProduct[]
            ).filter((p) => p.priceInRial && p.priceInRial <= 6000000);
            // Take more products from under 6M API
            allProducts.push(...under6MProducts.slice(0, 20)); // Increased from unlimited to 20
          }
        }

        if (allProducts.length > 0) {
          // Remove duplicates based on title
          const uniqueProducts = allProducts.filter(
            (product, index, self) =>
              index === self.findIndex((p) => p.title === product.title)
          );

          // Ensure we have at least 16 products
          let finalProducts = uniqueProducts;
          if (uniqueProducts.length < 16) {
            console.log(
              `⚠️ Only ${uniqueProducts.length} unique products found, need at least 16`
            );

            // Try to fetch more products from under 6M API if we don't have enough
            try {
              const additionalResponse = await fetch(
                `/api/shopping/products-under-6m?refresh=true`
              );
              if (additionalResponse.ok) {
                const additionalData = await additionalResponse.json();
                if (
                  additionalData.products &&
                  Array.isArray(additionalData.products)
                ) {
                  const additionalProducts = additionalData.products.filter(
                    (p: ShoppingProduct) =>
                      p.priceInRial &&
                      p.priceInRial <= 6000000 &&
                      !uniqueProducts.some(
                        (existing) => existing.title === p.title
                      )
                  );

                  if (additionalProducts.length > 0) {
                    finalProducts = [...uniqueProducts, ...additionalProducts];
                    console.log(
                      `✅ Added ${additionalProducts.length} additional products to reach ${finalProducts.length} total`
                    );
                  }
                }
              }
            } catch (err) {
              console.log(
                "⚠️ Could not fetch additional products, proceeding with available ones"
              );
            }
          }

          // Shuffle products for variety
          const shuffledProducts = [...finalProducts].sort(
            () => Math.random() - 0.5
          );

          setProducts(shuffledProducts);

          // Cache the results
          localStorage.setItem(cacheKey, JSON.stringify(shuffledProducts));
          localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());

          console.log(
            `✅ Loaded ${shuffledProducts.length} combined discount products (shuffled)`
          );
        } else {
          console.warn("⚠️ No products found in either API response");
          setProducts([]);
        }
      } catch (err) {
        console.error("❌ Error fetching discount products:", err);
        setError("خطا در بارگذاری محصولات تخفیف‌دار");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscountProducts();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="w-full bg-white">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm sm:text-xl text-green-600 text-left hidden">
            محصولات زیر ۶ میلیون تومان
          </h2>
        </div>

        {/* Beautiful Loading Animation */}
        <div className="flex flex-col items-center justify-center py-8 mb-6">
          <div className="relative">
            {/* Main loading spinner */}
            <div className="w-12 h-12 border-4 border-green-100 border-t-4 border-t-green-500 rounded-full animate-spin"></div>

            {/* Inner spinner */}
            <div
              className="absolute top-1.5 left-1.5 w-9 h-9 border-4 border-blue-100 border-t-4 border-t-blue-500 rounded-full animate-spin"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
          </div>

          {/* Loading text with typewriter effect */}
          <div className="mt-4 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              جستجوی بهترین تخفیف‌ها...
            </h3>
            <div className="flex justify-center items-center space-x-1 rtl:space-x-reverse">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></div>
              <div
                className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm sm:text-lg font-bold text-gray-800 text-right">
            محصولات زیر ۶ میلیون تومان
          </h2>
        </div>
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            تلاش مجدد
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <div className="w-full bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm sm:text-lg font-bold text-gray-800 text-right">
            محصولات زیر ۶ میلیون تومان
          </h2>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">هیچ محصول تخفیف‌داری یافت نشد</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Box container to keep header and grid inside */}
      <div className="border-2 border-gray-300 rounded-xl p-4 md:p-6 bg-white/50 shadow-md">
        {/* Section Header aligned right with green bold title */}
        <div className="relative mb-4 sm:mb-2">
          <div className="mb-3 sm:mb-2 rounded-lg border border-blue-200 bg-blue-50 px-2 py-2 sm:px-3">
            <p
              dir="ltr"
              className="text-[8px] sm:text-xs md:text-sm text-blue-600 text-right flex flex-nowrap items-center justify-end gap-1 sm:gap-2 leading-4 sm:leading-6 whitespace-nowrap overflow-hidden"
            >
              کلیک کنید تا محصول به سبد خرید انتقال داده بشه
              <span
                dir="rtl"
                className="inline-flex items-center gap-1 whitespace-nowrap "
              >
                روی
                <span className="inline-flex items-center justify-center w-3 h-3 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-green-500 text-white">
                  +
                </span>
              </span>
              برای سفارش محصول
            </p>
          </div>
          <div className="flex items-center justify-end">
            <h2 className="text-sm sm:text-lg md:text-xl font-extrabold text-green-600 text-right">
              محصولات زیر ۶ میلیون تومان
            </h2>
          </div>
        </div>

        {/* Static Grid with same breakpoints as "مشاهده بیشتر" صفحه */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-3 sm:gap-4">
          {products.slice(0, 16).map((product, index) => (
            <div key={`${product.id}-${index}`}>
              <DiscountProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
