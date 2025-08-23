"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, ChevronRight, Globe, RefreshCw } from "lucide-react";
import ShoppingProductCard from "./shopping-product-card";
import Link from "next/link";

interface SportProduct {
  id: string;
  title: string;
  originalTitle: string;
  price: number;
  originalPrice?: number | null;
  currency: string;
  image: string;
  description: string;
  originalDescription: string;
  link?: string;
  googleShoppingLink?: string;
  source: string;
  rating: number;
  reviews: number;
  delivery: string;
  category: string;
  turkishKeywords: string[];
}

interface IntelligentSportsSearchProps {
  telegramSupport?: string;
  initialQuery?: string;
  hideSearchBar?: boolean;
  allowEmpty?: boolean;
  apiEndpoint?: string;
  category?: string;
  categoryIcon?: string;
  categoryColor?: string;
}

export default function IntelligentSportsSearch({
  telegramSupport,
  initialQuery,
  hideSearchBar = false,
  allowEmpty = false,
  apiEndpoint = "/api/shopping/sports-intelligent",
  category = "ورزشی",
  categoryIcon = "🏃‍♂️",
  categoryColor = "from-blue-600 to-green-600",
}: IntelligentSportsSearchProps) {
  const [products, setProducts] = useState<SportProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSearch, setCurrentSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [searchInfo, setSearchInfo] = useState<{
    turkishQuery?: string;
    enhancedQueries?: string[];
    turkishSites?: string[];
  }>({});

  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) return;

      setLoading(true);
      setError("");
      setMessage("");
      setCurrentSearch(query);
      setSearchInfo({});

      try {
        console.log(
          `${categoryIcon} Starting intelligent ${category} search for: "${query}"`
        );

        const response = await fetch(
          `${apiEndpoint}?q=${encodeURIComponent(query)}`
        );
        const data = await response.json();

        console.log(`📊 Intelligent search response:`, {
          status: response.status,
          productsCount: data.products?.length || 0,
          message: data.message,
          error: data.error,
        });

        if (!response.ok) {
          throw new Error(data.error || `خطا در جستجوی هوشمند ${category}`);
        }

        setProducts(data.products || []);
        setMessage(data.message || "");
        setSearchInfo({
          turkishQuery: data.turkish_query,
          enhancedQueries: data.enhanced_queries,
          turkishSites: data.turkish_sites_searched,
        });

        // Log detailed results
        if (data.products && data.products.length > 0) {
          console.log(
            `✅ Found ${data.products.length} intelligent sports products`
          );
          console.log(`🇹🇷 Turkish query: ${data.turkish_query}`);
          console.log(`🔍 Enhanced queries:`, data.enhanced_queries);
          data.products.forEach((product: SportProduct, index: number) => {
            console.log(
              `🏃‍♂️ Product ${index + 1}: ${product.title} - ${product.price} ${product.currency} (${product.source})`
            );
          });
        } else {
          console.log(
            `❌ No intelligent sports products found for query: "${query}"`
          );
        }
      } catch (err) {
        console.error("❌ Intelligent sports search error:", err);
        setError(`خطا در جستجوی هوشمند ${category}. لطفاً دوباره تلاش کنید.`);
        setProducts([]);
        setMessage("");
        setSearchInfo({});
      } finally {
        setLoading(false);
      }
    },
    [apiEndpoint, category, categoryIcon]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  // Initial search
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      console.log(
        `🚀 Initial intelligent sports search for: "${initialQuery}"`
      );
      handleSearch(initialQuery);
    }
  }, [initialQuery, handleSearch]);

  // If no initial query and allowEmpty is false, don't render
  if ((!initialQuery || !initialQuery.trim()) && !allowEmpty) {
    return null;
  }

  const renderSearchBar = () => {
    if (hideSearchBar) return null;

    return (
      <div className="mb-6">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            placeholder={`جستجوی هوشمند ${category} از ترکیه...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
            dir="rtl"
          />
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    );
  };

  const renderSearchInfo = () => {
    if (!currentSearch || loading || !searchInfo.turkishQuery) return null;

    return (
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 shadow-sm border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <h2
                className={`text-xl font-bold bg-gradient-to-r ${categoryColor} bg-clip-text text-transparent`}
              >
                جستجوی هوشمند {category}
              </h2>
            </div>
            <div className="flex items-center">
              <span className="text-lg font-semibold text-white bg-blue-600 px-4 py-2 rounded-lg shadow-sm border border-blue-500">
                {currentSearch.length > 20
                  ? currentSearch.substring(0, 20) + "..."
                  : currentSearch}
              </span>
            </div>
          </div>

          {/* Translation Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">
                  ترجمه به ترکی:
                </span>
              </div>
              <span className="text-sm text-blue-700 font-medium">
                {searchInfo.turkishQuery}
              </span>
            </div>

            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  سایت‌های ترکی جستجو شده:
                </span>
              </div>
              <div className="text-xs text-green-700 font-medium">
                {searchInfo.turkishSites?.slice(0, 5).join(", ")}...
              </div>
            </div>
          </div>

          {/* Enhanced Queries */}
          {searchInfo.enhancedQueries &&
            searchInfo.enhancedQueries.length > 0 && (
              <div className="bg-white rounded-lg p-3 border">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">
                    کوئری‌های بهبود یافته:
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchInfo.enhancedQueries
                    .slice(0, 3)
                    .map((query, index) => (
                      <span
                        key={index}
                        className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full"
                      >
                        {query}
                      </span>
                    ))}
                </div>
              </div>
            )}

          <div className="mt-4 h-1 bg-gradient-to-r from-blue-400 via-green-500 to-purple-500 rounded-full"></div>
        </div>
      </div>
    );
  };

  const renderProducts = () => {
    if (loading || products.length === 0) return null;

    return (
      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800 text-right">
              محصولات {category} از ترکیه
              <span className="text-sm text-green-600 font-normal mr-2">
                ({products.length} محصول یافت شد)
              </span>
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="w-4 h-4" />
              <span>از سایت‌های معتبر ترکی</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-3 w-full">
            {products.map((product) => (
              <ShoppingProductCard
                key={product.id}
                product={product}
                telegramSupport={telegramSupport || "@gstyle_support"}
                isSearchResult={true}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderLoading = () => {
    if (!loading) return null;

    return (
      <div className="w-full bg-white">
        <div className="flex flex-col items-center justify-center py-8 mb-6">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-4 border-t-blue-500 rounded-full animate-spin"></div>
            <div
              className="absolute top-1.5 left-1.5 w-9 h-9 border-4 border-green-100 border-t-4 border-t-green-500 rounded-full animate-spin"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
          </div>

          <div className="mt-4 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              جستجوی هوشمند در حال انجام...
            </h3>
            <div className="flex justify-center items-center space-x-1 rtl:space-x-reverse">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
              <div
                className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-2 space-y-1">
              <p>🔄 ترجمه فارسی به ترکی...</p>
              <p>🔍 جستجو در سایت‌های ترکی...</p>
              <p>🇮🇷 ترجمه نتایج به فارسی...</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    );
  };

  const renderMessage = () => {
    if (!message || error) return null;

    return (
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
        {message}
      </div>
    );
  };

  const renderNoResults = () => {
    if (loading || products.length > 0 || error) return null;

    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          هیچ محصول ورزشی برای &quot;{currentSearch}&quot; یافت نشد.
        </p>
        <p className="text-gray-400 text-sm mt-2">
          لطفاً کلمات کلیدی دیگری امتحان کنید.
        </p>
        <div className="mt-4 text-sm text-gray-400">
          <p>پیشنهادات جستجو:</p>
          <ul className="mt-2 space-y-1">
            <li>
              •{" "}
              {category === "ورزشی"
                ? "کفش ورزشی نایک"
                : category === "مد و پوشاک"
                  ? "کفش مردانه"
                  : category === "زیبایی و آرایش"
                    ? "رژ لب قرمز"
                    : category === "الکترونیک"
                      ? "موبایل سامسونگ"
                      : category === "حیوانات خانگی"
                        ? "غذای سگ"
                        : "ویتامین سی"}
            </li>
            <li>
              •{" "}
              {category === "ورزشی"
                ? "لباس ورزشی آدیداس"
                : category === "مد و پوشاک"
                  ? "کفش مردانه"
                  : category === "زیبایی و آرایش"
                    ? "کرم آفتاب"
                    : category === "الکترونیک"
                      ? "لپ تاپ ایسوس"
                      : category === "حیوانات خانگی"
                        ? "غذای گربه"
                        : "کلسیم"}
            </li>
            <li>
              •{" "}
              {category === "ورزشی"
                ? "ساک ورزشی"
                : category === "مد و پوشاک"
                  ? "کیف دستی"
                  : category === "زیبایی و آرایش"
                    ? "ماسکارا"
                    : category === "الکترونیک"
                      ? "هدفون بلوتوث"
                      : category === "حیوانات خانگی"
                        ? "اسباب‌بازی سگ"
                        : "مولتی ویتامین"}
            </li>
            <li>
              •{" "}
              {category === "ورزشی"
                ? "ترموس ورزشی"
                : category === "مد و پوشاک"
                  ? "پیراهن آبی"
                  : category === "زیبایی و آرایش"
                    ? "عطر مردانه"
                    : category === "الکترونیک"
                      ? "ساعت هوشمند"
                      : category === "حیوانات خانگی"
                        ? "قلاده سگ"
                        : "ویتامین دی"}
            </li>
            <li>
              •{" "}
              {category === "ورزشی"
                ? "لوازم فیتنس"
                : category === "مد و پوشاک"
                  ? "شلوار جین"
                  : category === "زیبایی و آرایش"
                    ? "شامپو مو"
                    : category === "الکترونیک"
                      ? "تبلت"
                      : category === "حیوانات خانگی"
                        ? "تشویقی گربه"
                        : "اومگا ۳"}
            </li>
          </ul>
        </div>
      </div>
    );
  };

  if (allowEmpty) {
    return (
      <div className="w-full">
        {renderSearchBar()}
        {renderSearchInfo()}
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
      {renderSearchInfo()}
      {renderError()}
      {renderMessage()}
      {renderLoading()}
      {renderProducts()}
      {renderNoResults()}
    </div>
  );
}
