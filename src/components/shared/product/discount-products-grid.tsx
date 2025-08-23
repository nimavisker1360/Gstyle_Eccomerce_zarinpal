"use client";

import * as React from "react";
import DiscountProductCard from "./discount-product-card";
import OptimizedSkeleton from "./optimized-skeleton";

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
}

interface DiscountProductsGridProps {
  telegramSupport?: string;
  searchQuery?: string;
}

export default function DiscountProductsGrid({
  telegramSupport = "@gstyle_support",
  searchQuery,
}: DiscountProductsGridProps) {
  const [products, setProducts] = React.useState<ShoppingProduct[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshKey] = React.useState(0);

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Check client-side cache first
        const cacheKey = "discountproducts_all";
        const cacheExpiry = 8 * 60 * 1000; // 8 minutes
        const cached = localStorage.getItem(cacheKey);
        const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);

        if (cached && cacheTimestamp) {
          const now = Date.now();
          const timestamp = parseInt(cacheTimestamp);

          if (now - timestamp < cacheExpiry) {
            console.log("✅ Using cached discount products from localStorage");
            const cachedProducts = JSON.parse(cached) as ShoppingProduct[];
            // Show products priced ≤ 2000 TRY (server already enforces)
            const underTwoK = cachedProducts.filter(
              (p) =>
                typeof p.price === "number" && p.price > 0 && p.price <= 2000
            );
            setProducts(underTwoK);
            setLoading(false);
            return;
          }
        }

        // Fetch from API if no valid cache
        const response = await fetch(`/api/shopping/discounts`);

        if (!response.ok) {
          throw new Error("خطا در دریافت داده‌ها");
        }

        const data = await response.json();
        const products = (data.products || []) as ShoppingProduct[];
        const underTwoK = products.filter(
          (p) => typeof p.price === "number" && p.price > 0 && p.price <= 2000
        );
        setProducts(underTwoK);

        // Cache the results
        localStorage.setItem(cacheKey, JSON.stringify(underTwoK));
        localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
      } catch (err) {
        console.error("Error fetching discount products:", err);
        setError("خطا در بارگذاری محصولات");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [refreshKey]);

  if (loading) {
    return (
      <OptimizedSkeleton
        count={12}
        title="در حال جستجوی بهترین تخفیف‌ها..."
        subtitle="لطفا صبر کنید، داریم بهترین قیمت‌ها رو پیدا می‌کنیم"
      />
    );
  }

  if (false) {
    // Disabled old loading - keeping for reference
    return (
      <div className="w-full">
        {/* Beautiful Loading Header */}
        <div className="flex flex-col items-center justify-center py-12 mb-8">
          <div className="relative">
            {/* Main loading spinner */}
            <div className="w-16 h-16 border-4 border-green-100 border-t-4 border-t-green-500 rounded-full animate-spin"></div>

            {/* Inner spinner */}
            <div
              className="absolute top-2 left-2 w-12 h-12 border-4 border-blue-100 border-t-4 border-t-blue-500 rounded-full animate-spin"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
          </div>

          {/* Loading text with typewriter effect */}
          <div className="mt-6 text-center">
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              در حال جستجوی بهترین تخفیف‌ها...
            </h3>
            <div className="flex justify-center items-center space-x-1 rtl:space-x-reverse">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              لطفا صبر کنید، داریم بهترین قیمت‌ها رو پیدا می‌کنیم
            </p>
          </div>
        </div>

        {/* Beautiful Product Cards Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
          {[...Array(10)].map((_, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {/* Image skeleton */}
              <div className="relative mb-3">
                <div className="w-full h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-shimmer"></div>
                </div>
                {/* Discount badge skeleton */}
                <div className="absolute top-2 left-2 w-12 h-6 bg-red-200 rounded animate-pulse"></div>
                {/* External link button skeleton */}
                <div className="absolute top-2 right-2 w-8 h-8 bg-green-200 rounded animate-pulse"></div>
              </div>

              {/* Store name skeleton */}
              <div className="mb-2">
                <div className="w-20 h-5 bg-blue-100 rounded animate-pulse"></div>
              </div>

              {/* Title skeleton */}
              <div className="mb-3 space-y-2">
                <div className="w-full h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded overflow-hidden relative">
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-shimmer"></div>
                </div>
                <div className="w-3/4 h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded overflow-hidden relative">
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-shimmer"></div>
                </div>
              </div>

              {/* Rating skeleton */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex space-x-1 rtl:space-x-reverse">
                  {[...Array(5)].map((_, starIndex) => (
                    <div
                      key={starIndex}
                      className="w-3 h-3 bg-yellow-200 rounded-full animate-pulse"
                    ></div>
                  ))}
                </div>
                <div className="w-8 h-3 bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* Price skeleton */}
              <div className="space-y-2 mb-3">
                <div className="w-24 h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded overflow-hidden relative">
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-shimmer"></div>
                </div>
                <div className="w-20 h-5 bg-gradient-to-r from-green-200 via-green-300 to-green-200 rounded overflow-hidden relative">
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-shimmer"></div>
                </div>
                <div className="w-16 h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded overflow-hidden relative">
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-shimmer"></div>
                </div>
              </div>

              {/* Button skeleton */}
              <div className="w-full h-9 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 rounded overflow-hidden relative">
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-shimmer"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading progress bar */}
        <div className="mt-8 max-w-md mx-auto">
          <div className="bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
            <div className="h-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 rounded-full animate-progress transform transition-all duration-1000"></div>
          </div>
          <div className="text-center mt-3">
            <span className="text-xs text-gray-500 animate-pulse">
              🔍 در حال جستجو در گوگل شاپینگ...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">هیچ محصول تخفیف‌داری یافت نشد</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header with refresh button */}
      {/* Header removed as requested */}

      {/* Products grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        {products.map((product, index) => (
          <DiscountProductCard
            key={`${product.id}-${index}-${refreshKey}`}
            product={product}
          />
        ))}
      </div>
    </div>
  );
}
