"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, ChevronRight } from "lucide-react";
import ShoppingProductCard from "./shopping-product-card";
import Link from "next/link";

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

interface AccessoriesSearchLayoutProps {
  telegramSupport?: string;
  initialQuery?: string;
  hideSearchBar?: boolean;
  allowEmpty?: boolean;
}

export default function AccessoriesSearchLayout({
  telegramSupport,
  initialQuery,
  hideSearchBar = false,
  allowEmpty = false,
}: AccessoriesSearchLayoutProps) {
  const [products, setProducts] = useState<ShoppingProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSearch, setCurrentSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setMessage("");
    setCurrentSearch(query);

    try {
      console.log(`🔍 Searching for accessories: "${query}"`);

      const response = await fetch(
        `/api/shopping/accessories?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      console.log(`📊 Accessories search response:`, {
        status: response.status,
        productsCount: data.products?.length || 0,
        message: data.message,
        error: data.error,
      });

      if (!response.ok) {
        throw new Error(data.error || "خطا در دریافت اطلاعات");
      }

      setProducts(data.products || []);
      setMessage(data.message || "");

      // Log search results for debugging
      if (data.products && data.products.length > 0) {
        console.log(`✅ Found ${data.products.length} accessories`);
        data.products.forEach((product: ShoppingProduct, index: number) => {
          console.log(
            `📦 Accessory ${index + 1}: ${product.title} - ${product.price} ${product.currency}`
          );
        });
      } else {
        console.log(`❌ No accessories found for query: "${query}"`);
      }
    } catch (err) {
      console.error("❌ Accessories search error:", err);
      setError("خطا در دریافت لوازم جانبی. لطفاً دوباره تلاش کنید.");
      setProducts([]);
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSearch(searchQuery.trim());
    }
  };

  // Initialize with initial query if provided
  useEffect(() => {
    if (initialQuery && !currentSearch) {
      setSearchQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, [initialQuery, currentSearch]);

  const renderProducts = () => {
    if (loading || products.length === 0) return null;

    return (
      <div className="w-full">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm border border-blue-500 transition-colors duration-200 text-sm font-medium flex items-center gap-2 w-32 justify-center">
                صفحه اصلی
                <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
            <h2 className="text-sm font-semibold text-gray-800 w-32 text-center">
              نتایج جستجو برای &quot;{currentSearch}&quot;
            </h2>
          </div>
          <p className="text-sm text-gray-600">
            {products.length} لوازم جانبی پیدا شد
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <ShoppingProductCard
              key={product.id}
              product={product}
              telegramSupport={telegramSupport}
            />
          ))}
        </div>

        {telegramSupport && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-2">
              نیاز به راهنمایی بیشتر دارید؟
            </p>
            <Link
              href={`https://t.me/${telegramSupport.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm"
            >
              با ما در تلگرام در ارتباط باشید
              <ChevronRight className="w-4 h-4 mr-1 rtl:ml-1 rtl:mr-0" />
            </Link>
          </div>
        )}
      </div>
    );
  };

  const renderSearchBar = () => {
    if (hideSearchBar) return null;

    return (
      <div className="w-full mb-8">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="جستجوی لوازم جانبی کامپیوتر و موبایل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg"
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="px-6 py-3"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "جستجو"}
            </Button>
          </div>
        </form>

        {/* Search suggestions */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 mb-2">پیشنهادات جستجو:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "کیف لپ تاپ",
              "ماوس گیمینگ",
              "کیبورد مکانیکال",
              "هارد اکسترنال",
              "شارژر موبایل",
              "کیف موبایل",
              "پاوربانک",
              "کابل USB",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setSearchQuery(suggestion);
                  handleSearch(suggestion);
                }}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                disabled={loading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSearchResults = () => {
    if (!currentSearch) return null;

    return (
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          جستجو برای: <span className="font-semibold">{currentSearch}</span>
        </p>
      </div>
    );
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-red-800 text-center">{error}</p>
      </div>
    );
  };

  const renderMessage = () => {
    if (!message) return null;

    return (
      <div className="w-full bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <p className="text-green-800 text-center">{message}</p>
      </div>
    );
  };

  const renderLoading = () => {
    if (!loading) return null;

    return (
      <div className="w-full bg-white">
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
              جستجوی بهترین لوازم جانبی...
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
            <p className="text-xs text-gray-500 mt-2">
              از فروشگاه‌های معتبر ترکیه در حال پیدا کردن لوازم جانبی...
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderNoResults = () => {
    if (loading || products.length > 0 || error) return null;

    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          هیچ لوازم جانبی برای &quot;{currentSearch}&quot; یافت نشد.
        </p>
        <p className="text-gray-400 text-sm mt-2">
          لطفاً کلمات کلیدی دیگری امتحان کنید.
        </p>
        <div className="mt-4 text-sm text-gray-400">
          <p>پیشنهادات جستجو:</p>
          <ul className="mt-2 space-y-1">
            <li>• کیف لپ تاپ</li>
            <li>• ماوس گیمینگ</li>
            <li>• کیبورد مکانیکال</li>
            <li>• هارد اکسترنال</li>
            <li>• شارژر موبایل</li>
          </ul>
        </div>
      </div>
    );
  };

  // اگر allowEmpty true باشد، همیشه کامپوننت را نمایش بده
  if (allowEmpty) {
    return (
      <div className="w-full">
        {renderSearchBar()}
        {renderSearchResults()}
        {renderError()}
        {renderMessage()}
        {renderLoading()}
        {renderProducts()}
        {renderNoResults()}
      </div>
    );
  }

  return (
    <div className="w-full">
      {renderSearchBar()}
      {renderSearchResults()}
      {renderError()}
      {renderMessage()}
      {renderLoading()}
      {renderProducts()}
      {renderNoResults()}
    </div>
  );
}
