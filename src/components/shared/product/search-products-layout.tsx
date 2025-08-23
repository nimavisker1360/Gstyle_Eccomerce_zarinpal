"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, ChevronRight, Plus, SearchX } from "lucide-react";
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

interface SearchProductsLayoutProps {
  telegramSupport?: string;
  initialQuery?: string;
  hideSearchBar?: boolean;
  allowEmpty?: boolean;
  brandFilter?: string;
  typeFilter?: string;
}

export default function SearchProductsLayout({
  telegramSupport,
  initialQuery,
  hideSearchBar = false,
  allowEmpty = false,
  brandFilter,
  typeFilter,
}: SearchProductsLayoutProps) {
  const [products, setProducts] = useState<ShoppingProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSearch, setCurrentSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Excluded electronics items (case-insensitive match on title/description)
  const EXCLUDED_ELECTRONICS_KEYWORDS = useMemo(
    () => [
      "گوشی موبایل",
      "گوشی",
      "موبایل",
      "لپ تاپ",
      "لپ‌تاپ",
      "tablet",
      "تبلت",
      "computer",
      // Turkish
      "telefon",
      "cep telefonu",
      "akıllı telefon",
      "bilgisayar",
      "dizüstü bilgisayar",
      "kamera",
      "oyun konsolu",
      "konsol",
      "کامپیوتر",
      "camera",
      "دوربین",
      "کنسول بازی",
      "console",
      "playstation",
      "xbox",
    ],
    []
  );

  // Queries that should immediately return empty results
  const EXCLUDED_QUERY_KEYWORDS = useMemo(
    () => [
      // Persian
      "گوشی موبایل",
      "گوشی",
      "موبایل",
      "لپ تاپ",
      "لپ تاب",
      "لپتاب",
      "لپ‌تاپ",
      "تبلت",
      "کامپیوتر",
      "دوربین",
      "کنسول بازی",
      // Turkish
      "telefon",
      "cep telefonu",
      "akıllı telefon",
      "bilgisayar",
      "dizüstü bilgisayar",
      "kamera",
      "oyun konsolu",
      "konsol",
      // English
      "smartphone",
      "mobile phone",
      "mobile",
      "laptop",
      "notebook",
      "tablet",
      "computer",
      "pc ",
      "camera",
      "playstation",
      "xbox",
      "console",
      "ps5",
    ],
    []
  );

  const filterExcludedProducts = useCallback(
    (items: ShoppingProduct[] = []): ShoppingProduct[] => {
      return items.filter((p) => {
        const haystack =
          `${p.title || ""} ${p.originalTitle || ""} ${p.description || ""} ${p.originalDescription || ""}`.toLowerCase();

        // Filter out excluded electronics keywords
        return !EXCLUDED_ELECTRONICS_KEYWORDS.some((kw: string) =>
          haystack.includes(kw.toLowerCase())
        );
      });
    },
    [EXCLUDED_ELECTRONICS_KEYWORDS]
  );

  // Function to clear all search cache
  const clearSearchCache = () => {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("search:")) {
        localStorage.removeItem(key);
      }
    });
    console.log("🗑️ Cleared all search cache");
  };

  // تشخیص کوئری‌های مربوط به مد و پوشاک
  const isFashionQuery = (query: string) => {
    const fashionKeywords = [
      "لباس",
      "پوشاک",
      "مد",
      "fashion",
      "clothing",
      "dress",
      "shirt",
      "pants",
      "jeans",
      "skirt",
      "blouse",
      "t-shirt",
      "sweater",
      "jacket",
      "coat",
      "shoes",
      "boots",
      "sneakers",
      "bag",
      "purse",
      "accessories",
      "jewelry",
      "زیبایی",
      "beauty",
      "cosmetics",
      "makeup",
      "perfume",
      "cologne",
      "مردانه",
      "بچه گانه",
      "men",
      "kids",
      "children",
    ];

    return fashionKeywords.some((keyword) =>
      query.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  // تشخیص نوع کتگوری و کوتاه کردن متن نمایشی
  const getDisplayText = (query: string) => {
    const lowerQuery = query.toLowerCase();

    // حیوانات خانگی - بررسی اول برای اولویت بالاتر
    const petsKeywords = [
      "حیوانات خانگی",
      "حیوانات",
      "pets",
      "سگ",
      "dog",
      "گربه",
      "cat",
      "حیوان خانگی",
      "pet",
      "غذای سگ",
      "غذای گربه",
      "تشویقی سگ",
      "تشویقی گربه",
      "قلاده",
      "محصولات بهداشتی حیوانات",
    ];

    // ورزشی - بررسی دوم
    const sportsKeywords = [
      "ورزشی",
      "sport",
      "sports",
      "ورزش",
      "فیتنس",
      "fitness",
      "دویدن",
      "running",
      "ساک ورزشی",
      "لوازم ورزشی",
      "کفش ورزشی",
      "لباس ورزشی",
      "ترموس",
      "قمقمه",
      "اسباب ورزشی",
    ];

    // ویتامین و دارو
    const vitaminKeywords = [
      "ویتامین",
      "vitamin",
      "دارو",
      "medicine",
      "مکمل",
      "supplement",
      "مولتی ویتامین",
      "کلسیم",
      "ملاتونین",
    ];

    // زیبایی و آرایش
    const beautyKeywords = [
      "زیبایی",
      "آرایش",
      "لوازم آرایشی و بهداشتی",
      "زیبایی و آرایش",
      "beauty",
      "cosmetics",
      "makeup",
      "perfume",
      "cologne",
      "لوازم آرایشی",
      "عطر",
      "ادکلن",
      "مراقبت از پوست",
      "ضد پیری",
      "محصولات آفتاب",
      "رنگ مو",
      "شامپو",
      "رژ لب",
      "ماسکارا",
      "کرم مرطوب کننده",
      "کرم آفتاب",
      "لوازم آرایش",
    ];

    // الکترونیک
    const electronicsKeywords = [
      "الکترونیک",
      "electronics",
      "elektronik",
      "elektronık",
      "موبایل",
      "mobile",
      "smartphone",
      "phone",
      "لپ تاپ",
      "لپتاب",
      "لپ‌تاپ",
      "laptop",
      "notebook",
      "تبلت",
      "tablet",
      "هدفون",
      "headphone",
      "ساعت هوشمند",
      "smartwatch",
    ];

    // مد و پوشاک - شامل کلمات مرتبط با کیف
    const fashionKeywords = [
      "مد",
      "پوشاک",
      "fashion",
      "clothing",
      "dress",
      "shirt",
      "pants",
      "jeans",
      "skirt",
      "blouse",
      "t-shirt",
      "sweater",
      "jacket",
      "coat",
      "پیراهن",
      "تاپ",
      "شلوار",
      "شومیز",
      "دامن",
      "ژاکت",
      "کت",
      "کیف",
      "کیف دستی",
      "کیف شانه",
      "چرم",
      "çanta",
      "canta",
      "jewelry",
      "جواهرات",
      "زیورآلات",
    ];

    // بررسی به ترتیب اولویت - زیبایی اول برای اولویت بالاتر
    if (beautyKeywords.some((keyword) => lowerQuery.includes(keyword))) {
      return "زیبایی و آرایش";
    } else if (petsKeywords.some((keyword) => lowerQuery.includes(keyword))) {
      return "حیوانات خانگی";
    } else if (
      vitaminKeywords.some((keyword) => lowerQuery.includes(keyword))
    ) {
      return "ویتامین و دارو";
    } else if (
      // اول مد و پوشاک برای جلوگیری از اشتباه در واژه‌هایی مثل "کیف"
      fashionKeywords.some((keyword) => lowerQuery.includes(keyword))
    ) {
      return "مد و پوشاک";
    } else if (sportsKeywords.some((keyword) => lowerQuery.includes(keyword))) {
      return "لوازم ورزشی";
    } else if (
      electronicsKeywords.some((keyword) => lowerQuery.includes(keyword))
    ) {
      return "الکترونیک";
    }

    // اگر هیچ کدام تطبیق نکرد، متن اصلی را کوتاه کن
    return query.length > 20 ? query.substring(0, 20) + "..." : query;
  };

  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) return;

      setLoading(true);
      setError("");
      setMessage("");
      setCurrentSearch(query);

      try {
        console.log(`🔍 Searching for: "${query}"`);

        // If query contains excluded keywords, return no results
        const lower = query.toLowerCase();
        if (
          EXCLUDED_QUERY_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()))
        ) {
          console.log("🚫 Query is excluded by rules; showing no results.");
          setProducts([]);
          setLoading(false);
          setMessage("");
          return;
        }

        // Check client-side cache first for regular searches
        // Create a more specific cache key that includes the exact query
        const cacheKey = `search:${encodeURIComponent(query.trim())}:${brandFilter || "none"}:${typeFilter || "none"}`;
        const cacheExpiry = 2 * 60 * 1000; // Reduced to 2 minutes for more responsive updates
        const cached = localStorage.getItem(cacheKey);
        const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);

        if (cached && cacheTimestamp && !brandFilter) {
          const now = Date.now();
          const timestamp = parseInt(cacheTimestamp);

          if (now - timestamp < cacheExpiry) {
            try {
              const cachedData = JSON.parse(cached);
              // Verify that the cached data is for the same query
              if (cachedData.query === query) {
                console.log(`✅ Using cached search results for: "${query}"`);
                setProducts(filterExcludedProducts(cachedData.products) || []);
                setMessage(cachedData.message || "");
                setLoading(false);
                return;
              } else {
                console.log(
                  `🔄 Cache mismatch, query changed from "${cachedData.query}" to "${query}"`
                );
                // Clear the mismatched cache
                localStorage.removeItem(cacheKey);
                localStorage.removeItem(`${cacheKey}_timestamp`);
              }
            } catch (parseError) {
              console.error("❌ Error parsing cached data:", parseError);
              // Clear corrupted cache
              localStorage.removeItem(cacheKey);
              localStorage.removeItem(`${cacheKey}_timestamp`);
            }
          } else {
            // Clear expired cache
            localStorage.removeItem(cacheKey);
            localStorage.removeItem(`${cacheKey}_timestamp`);
            console.log(`🗑️ Cleared expired cache for: "${query}"`);
          }
        }

        // Check if this is a Turkish brand search
        if (brandFilter && typeFilter === "turkish") {
          console.log(`🇹🇷 Turkish brand search for: ${brandFilter}`);

          const response = await fetch(
            `/api/shopping/turkish-brands?brand=${encodeURIComponent(brandFilter)}&type=turkish`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              // Add timeout
              signal: AbortSignal.timeout(30000), // 30 second timeout
            }
          );

          if (!response.ok) {
            const errorData = await response
              .json()
              .catch(() => ({ error: "خطا در دریافت محصولات برند ترکیه" }));
            throw new Error(
              errorData.error ||
                `خطا در دریافت محصولات برند ترکیه (${response.status})`
            );
          }

          const data = await response.json();

          console.log(`📊 Turkish brand search response:`, {
            status: response.status,
            productsCount: data.products?.length || 0,
            message: data.message,
            error: data.error,
          });

          setProducts(filterExcludedProducts(data.products) || []);
          setMessage(data.message || `محصولات برند ${brandFilter}`);
        } else {
          // Regular search
          console.log(
            `🔍 Making API request to /api/shopping?q=${encodeURIComponent(query)}`
          );

          const response = await fetch(
            `/api/shopping?q=${encodeURIComponent(query)}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              // Add timeout
              signal: AbortSignal.timeout(30000), // 30 second timeout
            }
          );

          console.log(`📊 Response status: ${response.status}`);

          if (!response.ok) {
            const errorData = await response
              .json()
              .catch(() => ({ error: "خطا در دریافت اطلاعات" }));
            console.error(`❌ API Error (${response.status}):`, errorData);
            throw new Error(
              errorData.error || `خطا در دریافت اطلاعات (${response.status})`
            );
          }

          const data = await response.json();

          console.log(`📊 Search response:`, {
            status: response.status,
            productsCount: data.products?.length || 0,
            message: data.message,
            error: data.error,
          });

          const filtered = filterExcludedProducts(data.products);
          setProducts(filtered || []);
          setMessage(data.message || "");

          // Show special message for sample data
          if (data.sample_data) {
            setMessage(
              "محصولات نمونه نمایش داده می‌شوند. برای نتایج واقعی، لطفاً API keys را تنظیم کنید."
            );
          }

          // Cache successful search results (only for regular searches, not filtered)
          if (!brandFilter && !typeFilter && data.products) {
            const cacheData = {
              query: query, // Store the original query
              products: filtered,
              message: data.message || "",
              timestamp: Date.now(),
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
            localStorage.setItem(
              `${cacheKey}_timestamp`,
              Date.now().toString()
            );
            console.log(
              `💾 Cached search results for: "${query}" (${data.products.length} products)`
            );
          }

          // Log search results for debugging
          if (data.products && data.products.length > 0) {
            const isQueryFashion = isFashionQuery(query);
            console.log(`✅ Found ${data.products.length} products`);
            console.log(`🎯 Fashion query: ${isQueryFashion ? "Yes" : "No"}`);
            console.log(
              `📊 Will display: ${isQueryFashion ? data.products.length : Math.min(50, data.products.length)} products`
            );
            data.products.forEach((product: ShoppingProduct, index: number) => {
              console.log(
                `📦 Product ${index + 1}: ${product.title} - ${product.price} ${product.currency}`
              );
            });
          } else {
            console.log(`❌ No products found for query: "${query}"`);
          }
        }
      } catch (err) {
        console.error("❌ Search error:", err);

        // Handle different types of errors
        let errorMessage = "خطا در جستجوی محصولات. لطفاً دوباره تلاش کنید.";

        if (err instanceof Error) {
          if (
            err.name === "AbortError" ||
            err.message.includes("timeout") ||
            err.message.includes("signal timed out")
          ) {
            errorMessage = "دوباره سرچ کنید";
          } else if (err.message.includes("Failed to fetch")) {
            errorMessage =
              "خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید.";
          } else {
            errorMessage = err.message;
          }
        }

        setError(errorMessage);
        setProducts([]);
        setMessage("");
      } finally {
        setLoading(false);
      }
    },
    [brandFilter, typeFilter, filterExcludedProducts, EXCLUDED_QUERY_KEYWORDS]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  // Debounce live search input changes (500ms)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const onChangeDebounced = (value: string) => {
    setSearchQuery(value);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      if (value.trim()) {
        handleSearch(value);
      }
    }, 500);
  };

  // جستجوی اولیه - فقط اگر query وجود داشته باشد
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      console.log(`🚀 Initial search for: "${initialQuery}"`);
      // Clear cache when initial query changes to ensure fresh results
      if (currentSearch !== initialQuery) {
        clearSearchCache();
      }
      handleSearch(initialQuery);
    }
  }, [initialQuery, handleSearch, brandFilter, typeFilter, currentSearch]);

  // اگر هیچ query اولیه‌ای وجود نداشته باشد و allowEmpty false باشد، هیچ محصولی نمایش نده
  if ((!initialQuery || !initialQuery.trim()) && !allowEmpty) {
    return null;
  }

  const renderProducts = () => {
    if (loading || products.length === 0) return null;

    return (
      <div className="space-y-8">
        {/* همه محصولات در گرید */}
        {products.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 text-right">
                محصولات پیشنهادی
                {isFashionQuery(currentSearch) && (
                  <span className="text-sm text-green-600 font-normal mr-2">
                    ({products.length} محصول یافت شد)
                  </span>
                )}
              </h3>
              {!isFashionQuery(currentSearch) && (
                <Link
                  href={`/search?q=${encodeURIComponent(currentSearch)}&view=all`}
                  passHref
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  >
                    مشاهده بیشتر
                    <ChevronRight className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  </Button>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-3 w-full">
              {products
                .slice(0, isFashionQuery(currentSearch) ? products.length : 50)
                .map((product) => (
                  <ShoppingProductCard
                    key={product.id}
                    product={product}
                    telegramSupport={telegramSupport || "@gstyle_support"}
                    isSearchResult={true}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSearchBar = () => {
    if (hideSearchBar) return null;

    return (
      <div className="mb-6">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            placeholder="جستجوی محصولات از ترکیه..."
            value={searchQuery}
            onChange={(e) => onChangeDebounced(e.target.value)}
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
          {/* Debug button to clear cache */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearSearchCache}
            title="Clear search cache"
            className="text-xs"
          >
            🗑️
          </Button>
        </form>
      </div>
    );
  };

  const renderSearchResults = () => {
    if (!currentSearch || loading) return null;

    return (
      <div className="mb-8">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 shadow-sm border border-green-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm border border-blue-500 transition-colors duration-200 text-sm font-medium flex items-center gap-2 w-32 justify-center">
                  صفحه اصلی
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
              <span className="text-sm font-semibold text-white bg-green-600 px-4 py-2 rounded-lg shadow-sm border border-green-500 w-32 text-center">
                {getDisplayText(currentSearch)}
              </span>
            </div>
          </div>
          <div className="mt-4 h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 rounded-full"></div>
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
      <div
        className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-right"
        dir="rtl"
      >
        <div className="flex items-start justify-end flex-row-reverse">
          <div className="ml-3">
            <p className="text-sm text-right">
              {(() => {
                const parts = message.split("+");
                if (parts.length === 1) return message;
                return (
                  <span>
                    {parts.map((part, idx) => (
                      <span key={idx}>
                        {part}
                        {idx < parts.length - 1 && (
                          <span className="inline-flex align-middle mx-1">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white">
                              <Plus className="w-3 h-3" />
                            </span>
                          </span>
                        )}
                      </span>
                    ))}
                  </span>
                );
              })()}
            </p>
            {message.includes("نمونه") && (
              <p className="text-xs mt-1 text-blue-600">
                برای تنظیم API keys، فایل .env.local را ایجاد کرده و SERPAPI_KEY
                و OPENAI_API_KEY را اضافه کنید.
              </p>
            )}
          </div>
        </div>
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
              جستجوی بهترین محصولات...
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
              از گوگل شاپینگ در حال پیدا کردن محصولات...
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderNoResults = () => {
    if (loading || products.length > 0 || error) return null;

    const suggestions = ["کفش ورزشی", "لوازم آرایشی", "ساعت مچی", "کیف دستی"];

    return (
      <div className="flex justify-center py-10">
        <div className="w-full max-w-2xl">
          <div className="relative overflow-hidden rounded-2xl border border-green-100 bg-white shadow-lg">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500" />

            <div className="p-8 text-center" dir="rtl">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-green-50 to-blue-50 border border-green-200">
                <SearchX className="h-7 w-7 text-green-600" />
              </div>

              <h3 className="text-2xl font-extrabold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                هیچ محصولی یافت نشد
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                برای عبارت «{currentSearch}» موردی پیدا نشد. لطفاً از پیشنهادات
                زیر استفاده کنید یا عبارت دیگری را جستجو کنید.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSearch(s)}
                    className="px-3 py-1.5 rounded-full text-sm border border-green-300 text-green-700 hover:bg-green-50 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="mt-6 text-xs text-gray-400">
                اگر فکر می‌کنید این پیام اشتباه است، عبارت کلی‌تری جستجو کنید.
              </div>
            </div>
          </div>
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
