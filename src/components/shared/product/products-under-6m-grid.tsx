"use client";

import * as React from "react";
import DiscountProductCard from "./discount-product-card";
import OptimizedSkeleton from "./optimized-skeleton";
import { formatRial } from "@/lib/utils";

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
  priceInRial: number;
}

interface ProductsUnder6MGridProps {
  telegramSupport?: string;
  searchQuery?: string;
}

export default function ProductsUnder6MGrid({
  telegramSupport = "@gstyle_support",
  searchQuery,
}: ProductsUnder6MGridProps) {
  const [products, setProducts] = React.useState<ShoppingProduct[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Check client-side cache first
        const cacheKey = "products_under_6m_rials";
        const cacheExpiry = 30 * 60 * 1000; // 30 minutes
        const cached = localStorage.getItem(cacheKey);
        const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);

        if (cached && cacheTimestamp) {
          const now = Date.now();
          const timestamp = parseInt(cacheTimestamp);

          if (now - timestamp < cacheExpiry) {
            console.log(
              "✅ Using cached products under 6M Rials from localStorage"
            );
            const cachedProducts = JSON.parse(cached) as ShoppingProduct[];
            setProducts(cachedProducts);
            setLoading(false);
            return;
          }
        }

        // Fetch from API if no valid cache
        const response = await fetch(`/api/shopping/products-under-6m`);

        if (!response.ok) {
          throw new Error("خطا در دریافت داده‌ها");
        }

        const data = await response.json();
        const products = (data.products || []) as ShoppingProduct[];
        setProducts(products);

        // Cache the results
        localStorage.setItem(cacheKey, JSON.stringify(products));
        localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
      } catch (err) {
        console.error("Error fetching products under 6M Rials:", err);
        setError("خطا در بارگذاری محصولات");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    // Clear cache to force fresh fetch
    localStorage.removeItem("products_under_6m_rials");
    localStorage.removeItem("products_under_6m_rials_timestamp");
  };

  if (loading) {
    return (
      <OptimizedSkeleton
        count={12}
        title="در حال جستجوی محصولات زیر ۶ میلیون ریال..."
        subtitle="لطفا صبر کنید، داریم بهترین قیمت‌ها رو پیدا می‌کنیم"
      />
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
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            محصولات زیر ۶ میلیون تومان
          </h2>
          <p className="text-gray-500">هیچ محصول تخفیف‌داری یافت نشد</p>
        </div>
        <button
          onClick={handleRefresh}
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          جستجوی مجدد
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header with title and refresh button */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
        <div className="text-center sm:text-right mb-4 sm:mb-0">
          <h1 className="text-2xl font-bold text-blue-800 mb-2">
            محصولات زیر ۶ میلیون تومان
          </h1>
          <p className="text-gray-600">
            {products.length} محصول با بهترین قیمت از فروشگاه‌های معتبر ترکیه
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleRefresh}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            جستجوی مجدد
          </button>
          <div className="text-center sm:text-left">
            <p className="text-sm text-gray-500">آخرین بروزرسانی</p>
            <p className="text-xs text-gray-400">
              {new Date().toLocaleDateString("fa-IR")}
            </p>
          </div>
        </div>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map((product, index) => (
          <div
            key={`${product.id}-${index}-${refreshKey}`}
            className="relative"
          >
            {/* Price badge showing both TRY and Rials */}
            <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
              <div className="font-bold">₺{product.price}</div>
              <div className="text-xs opacity-90">
                {formatRial(product.priceInRial)}
              </div>
            </div>

            <DiscountProductCard
              product={{
                ...product,
                // Override the title to show price in both currencies
                title: `${product.title} - ${formatRial(product.priceInRial)}`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Footer info */}
      <div className="mt-8 text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          💡 قیمت‌ها به صورت خودکار از لیر ترکیه به ریال ایران تبدیل می‌شوند
        </p>
        <p className="text-xs text-gray-500 mt-2">
          نرخ تبدیل: ۱ لیر = ۳۰,۰۰۰ تومان (ثابت)
        </p>
      </div>
    </div>
  );
}
