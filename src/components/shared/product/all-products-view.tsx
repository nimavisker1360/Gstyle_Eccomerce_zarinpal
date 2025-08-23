"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, ArrowLeft, ChevronRight } from "lucide-react";
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

interface AllProductsViewProps {
  telegramSupport?: string;
  initialQuery?: string;
  hideSearchBar?: boolean;
  brandFilter?: string;
  typeFilter?: string;
}

export default function AllProductsView({
  telegramSupport,
  initialQuery,
  hideSearchBar = false,
  brandFilter,
  typeFilter,
}: AllProductsViewProps) {
  const [products, setProducts] = useState<ShoppingProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSearch, setCurrentSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Excluded electronics items (case-insensitive)
  const EXCLUDED_ELECTRONICS_KEYWORDS: string[] = [
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
  ];

  // Queries that should immediately yield no results
  const EXCLUDED_QUERY_KEYWORDS: string[] = [
    // Persian
    "گوشی موبایل",
    "گوشی",
    "موبایل",
    "لپ تاپ",
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
  ];

  const filterExcludedProducts = (
    items: ShoppingProduct[] = []
  ): ShoppingProduct[] => {
    return items.filter((p) => {
      const haystack =
        `${p.title || ""} ${p.originalTitle || ""} ${p.description || ""} ${p.originalDescription || ""}`.toLowerCase();

      // Filter out excluded electronics keywords
      return !EXCLUDED_ELECTRONICS_KEYWORDS.some((kw) =>
        haystack.includes(kw.toLowerCase())
      );
    });
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
    ];

    // الکترونیک
    const electronicsKeywords = [
      "الکترونیک",
      "electronics",
      "موبایل",
      "mobile",
      "لپ تاپ",
      "laptop",
      "تبلت",
      "tablet",
      "هدفون",
      "headphone",
      "ساعت هوشمند",
      "smartwatch",
    ];

    // مد و پوشاک - بررسی آخر برای جلوگیری از تداخل (بدون کلمات مشترک)
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
      "jewelry",
      "جواهرات",
      "زیورآلات",
    ];

    // بررسی به ترتیب اولویت
    if (petsKeywords.some((keyword) => lowerQuery.includes(keyword))) {
      return "حیوانات خانگی";
    } else if (sportsKeywords.some((keyword) => lowerQuery.includes(keyword))) {
      return "لوازم ورزشی";
    } else if (
      vitaminKeywords.some((keyword) => lowerQuery.includes(keyword))
    ) {
      return "ویتامین و دارو";
    } else if (beautyKeywords.some((keyword) => lowerQuery.includes(keyword))) {
      return "زیبایی و آرایش";
    } else if (
      electronicsKeywords.some((keyword) => lowerQuery.includes(keyword))
    ) {
      return "الکترونیک";
    } else if (
      fashionKeywords.some((keyword) => lowerQuery.includes(keyword))
    ) {
      return "مد و پوشاک";
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

        // Check if this is a Turkish brand search
        if (brandFilter && typeFilter === "turkish") {
          console.log(`🇹🇷 Turkish brand search for: ${brandFilter}`);

          const response = await fetch(
            `/api/shopping/turkish-brands?brand=${encodeURIComponent(brandFilter)}&type=turkish`
          );
          const data = await response.json();

          console.log(`📊 Turkish brand search response:`, {
            status: response.status,
            productsCount: data.products?.length || 0,
            message: data.message,
            error: data.error,
          });

          if (!response.ok) {
            throw new Error(data.error || "خطا در دریافت محصولات برند ترکیه");
          }

          setProducts(filterExcludedProducts(data.products) || []);
          setMessage(data.message || `محصولات برند ${brandFilter}`);
        } else {
          // Regular search
          const response = await fetch(
            `/api/shopping?q=${encodeURIComponent(query)}`
          );
          const data = await response.json();

          console.log(`📊 Search response:`, {
            status: response.status,
            productsCount: data.products?.length || 0,
            message: data.message,
            error: data.error,
          });

          if (!response.ok) {
            throw new Error(data.error || "خطا در دریافت اطلاعات");
          }

          setProducts(filterExcludedProducts(data.products) || []);
          setMessage(data.message || "");

          // Log search results for debugging
          if (data.products && data.products.length > 0) {
            console.log(`✅ Found ${data.products.length} products`);
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

        // Show more specific error messages
        let errorMessage = "خطا در دریافت محصولات. لطفاً دوباره تلاش کنید.";

        if (err instanceof Error) {
          if (
            err.message.includes("SERPAPI_KEY") ||
            err.message.includes("Search service is not configured")
          ) {
            errorMessage =
              "API کلید تنظیم نشده. لطفاً SERPAPI_KEY را در فایل .env.local اضافه کنید.";
          } else if (err.message.includes("OPENAI_API_KEY")) {
            errorMessage =
              "API کلید OpenAI تنظیم نشده. لطفاً OPENAI_API_KEY را در فایل .env.local اضافه کنید.";
          } else if (err.message.includes("خطا در دریافت اطلاعات")) {
            errorMessage = "خطا در اتصال به سرور. لطفاً دوباره تلاش کنید.";
          }
        }

        setError(errorMessage);
        setProducts([]);
        setMessage("");
      } finally {
        setLoading(false);
      }
    },
    [brandFilter, typeFilter]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  // جستجوی اولیه - فقط اگر query وجود داشته باشد
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      console.log(`🚀 Initial search for: "${initialQuery}"`);
      handleSearch(initialQuery);
    }
  }, [initialQuery, handleSearch, brandFilter, typeFilter]);

  const renderSearchBar = () => {
    if (hideSearchBar) return null;

    return (
      <div className="mb-6">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            placeholder="جستجوی محصولات از ترکیه..."
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
              <span className="text-sm font-semibold text-gray-800 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 w-32 text-center">
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
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
        {message}
      </div>
    );
  };

  const renderLoading = () => {
    if (!loading) return null;

    return (
      <div className="w-full bg-white">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-700 mb-4">
              جستجوی بهترین محصولات
            </h3>
            <div className="flex justify-center items-center space-x-1 rtl:space-x-reverse mb-4">
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
            <p className="text-sm text-gray-500">
              لطفا صبر کنید، داریم بهترین محصولات رو پیدا می‌کنیم
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderProducts = () => {
    if (loading || products.length === 0) return null;

    return (
      <div className="space-y-8">
        {/* همه محصولات در گرید */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href={`/search?q=${encodeURIComponent(currentSearch)}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  بازگشت
                </Button>
              </Link>
              <h3 className="text-2xl font-bold text-gray-800 text-right">
                همه محصولات
              </h3>
            </div>
            <span className="text-sm text-gray-500">
              {products.length} محصول یافت شد
            </span>
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

  const renderNoResults = () => {
    if (loading || products.length > 0 || error) return null;

    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          هیچ محصولی برای &quot;{currentSearch}&quot; یافت نشد.
        </p>
        <p className="text-gray-400 text-sm mt-2">
          لطفاً کلمات کلیدی دیگری امتحان کنید.
        </p>
        <div className="mt-4 text-sm text-gray-400">
          <p>پیشنهادات جستجو:</p>
          <ul className="mt-2 space-y-1">
            <li>• کفش ورزشی</li>
            <li>• لوازم آرایشی</li>
            <li>• ساعت مچی</li>
            <li>• کیف دستی</li>
          </ul>
        </div>
      </div>
    );
  };

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
