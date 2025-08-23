"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Sparkles, Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import useCartStore from "@/hooks/use-cart-store";
import Image from "next/image";
import {
  generateId,
  round2,
  convertTRYToToman,
  formatToman,
} from "@/lib/utils";

interface Product {
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

interface IntelligentSearchProps {
  initialQuery?: string;
  hideSearchBar?: boolean;
  allowEmpty?: boolean;
  telegramSupport?: string;
  apiEndpoint: string;
  category: string;
  categoryIcon: string;
  categoryColor: string;
  searchPlaceholder?: string;
  quickSuggestions?: string[];
  emptyStateIcon?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  successMessage?: string;
  noResultsMessage?: string;
}

export default function IntelligentSearch({
  initialQuery = "",
  hideSearchBar = false,
  allowEmpty = false,
  telegramSupport,
  apiEndpoint,
  category,
  categoryIcon,
  categoryColor,
  searchPlaceholder = "جستجوی محصولات...",
  quickSuggestions = [],
  emptyStateIcon = "🔍",
  emptyStateTitle = "محصولی یافت نشد",
  emptyStateDescription = "لطفاً کلمات کلیدی دیگری امتحان کنید",
  successMessage = "محصول یافت شد",
  noResultsMessage = "نتیجه‌ای یافت نشد",
}: IntelligentSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchStats, setSearchStats] = useState<{
    total: number;
    search_query: string;
    turkish_query: string;
    enhanced_queries: string[];
    message: string;
  } | null>(null);

  const { toast } = useToast();
  const { addItem } = useCartStore();

  const handleSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim() && !allowEmpty) {
        toast({
          title: "خطا",
          description: "لطفاً کلمه کلیدی برای جستجو وارد کنید",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);
      setError(null);
      setSearched(true);

      try {
        // Check client-side cache first
        const cacheKey = `intelligent:${apiEndpoint}:${searchQuery.toLowerCase().trim()}`;
        const cacheExpiry = 5 * 60 * 1000; // 5 minutes
        const cached = localStorage.getItem(cacheKey);
        const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);

        if (cached && cacheTimestamp) {
          const now = Date.now();
          const timestamp = parseInt(cacheTimestamp);

          if (now - timestamp < cacheExpiry) {
            console.log("✅ Using cached intelligent search results");
            const cachedData = JSON.parse(cached);
            setProducts(cachedData.products || []);
            setSearchStats(cachedData.searchStats || {});
            setLoading(false);
            return;
          }
        }

        const response = await fetch(
          `${apiEndpoint}?q=${encodeURIComponent(searchQuery.trim())}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setProducts(data.products || []);
        const searchStats = {
          total: data.total || 0,
          search_query: data.search_query || searchQuery,
          turkish_query: data.turkish_query || "",
          enhanced_queries: data.enhanced_queries || [],
          message: data.message || "",
        };
        setSearchStats(searchStats);

        // Cache successful results
        const cacheData = {
          products: data.products || [],
          searchStats,
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());

        if (data.products && data.products.length > 0) {
          toast({
            title: "✅ جستجو موفق",
            description: `${data.products.length} ${successMessage}`,
          });
        } else {
          toast({
            title: "⚠️ نتیجه‌ای یافت نشد",
            description: noResultsMessage,
          });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "خطا در جستجو";
        setError(errorMessage);
        toast({
          title: "❌ خطا در جستجو",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [apiEndpoint, allowEmpty, toast, successMessage, noResultsMessage]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSearch(initialQuery);
    }
  }, [initialQuery, handleSearch]);

  const formatPriceToman = (price: number, currency: string) => {
    const isTRY =
      (currency || "").toUpperCase() === "TRY" ||
      (currency || "").toUpperCase() === "TL";
    const tryAmount = isTRY ? price : price;
    return formatToman(convertTRYToToman(tryAmount));
  };

  const handleAddToCart = (product: Product) => {
    try {
      const cartItem = {
        clientId: generateId(),
        product: product.id,
        name: product.title,
        slug: product.id,
        category: product.category || "عمومی",
        quantity: 1,
        countInStock: 10, // Default stock
        image: product.image,
        price: round2(product.price),
        size: "متوسط", // Default size
        color: "مشکی", // Default color
      };

      addItem(cartItem, 1);
      toast({
        title: "✅ افزوده شد",
        description: `${product.title} به سبد خرید اضافه شد`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message,
      });
    }
  };

  const handleViewProduct = (product: Product) => {
    if (product.link) {
      window.open(product.link, "_blank");
    } else if (product.googleShoppingLink) {
      window.open(product.googleShoppingLink, "_blank");
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      {!hideSearchBar && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg"
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                disabled={loading || (!query.trim() && !allowEmpty)}
                className={`px-8 py-3 text-lg font-medium ${categoryColor} hover:opacity-90 transition-all`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    جستجو...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    جستجوی هوشمند
                  </div>
                )}
              </Button>
            </div>

            {/* Quick Search Suggestions */}
            {quickSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuery(suggestion);
                      handleSearch(suggestion);
                    }}
                    disabled={loading}
                    className="text-sm"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}
          </form>
        </div>
      )}

      {/* Search Stats */}
      {searchStats && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-gray-600" />
            <h3 className="font-bold text-gray-800">نتایج جستجوی هوشمند</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">کوئری فارسی:</span>
              <p className="text-gray-600">{searchStats.search_query}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">کوئری ترکی:</span>
              <p className="text-gray-600">{searchStats.turkish_query}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">تعداد محصولات:</span>
              <p className="text-gray-600">{searchStats.total} محصول</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">!</span>
            </div>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {searched && !loading && (
        <div className="space-y-4">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">{emptyStateIcon}</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                {emptyStateTitle}
              </h3>
              <p className="text-gray-500 mb-4">{emptyStateDescription}</p>
              {telegramSupport && (
                <Button
                  className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                  onClick={() =>
                    window.open(`https://t.me/${telegramSupport}`, "_blank")
                  }
                >
                  پشتیبانی تلگرام
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-black">
                  {categoryIcon} {products.length} محصول {category} یافت شد
                </h2>
                <Badge variant="secondary" className="text-sm">
                  از سایت‌های معتبر ترکی
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className="group hover:shadow-lg transition-all duration-300"
                  >
                    <CardContent className="p-4">
                      {/* Product Image */}
                      <div className="relative mb-4">
                        <div className="relative w-full h-44 bg-gray-50 rounded-lg overflow-hidden">
                          <Image
                            src={product.image}
                            alt={product.title}
                            fill
                            className="object-contain group-hover:scale-105 transition-transform duration-300"
                            sizes="300px"
                          />
                        </div>
                        {product.originalPrice &&
                          product.originalPrice > product.price && (
                            <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                              تخفیف
                            </Badge>
                          )}
                      </div>

                      {/* Product Info */}
                      <div className="space-y-3">
                        <h3 className="font-bold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {product.title}
                        </h3>

                        <p className="text-gray-600 text-sm line-clamp-2">
                          {product.description}
                        </p>

                        {/* Rating */}
                        {product.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">
                              {product.rating} ({product.reviews} نظر)
                            </span>
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-green-600">
                            {formatPriceToman(product.price, product.currency)}
                          </span>
                        </div>

                        {/* Source */}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>🏪</span>
                          <span>{product.source}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleAddToCart(product)}
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            افزودن
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewProduct(product)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            مشاهده
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="p-4">
              <Skeleton className="w-full h-44 mb-4" />
              <Skeleton className="w-3/4 h-4 mb-2" />
              <Skeleton className="w-full h-3 mb-2" />
              <Skeleton className="w-1/2 h-4 mb-4" />
              <div className="flex gap-2">
                <Skeleton className="flex-1 h-8" />
                <Skeleton className="w-20 h-8" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
