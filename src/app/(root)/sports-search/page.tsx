import { Metadata } from "next";
import { Suspense } from "react";
import IntelligentSearch from "@/components/shared/product/intelligent-search";

export const metadata: Metadata = {
  title: "جستجوی هوشمند محصولات ورزشی - از سایت‌های معتبر ترکی",
  description:
    "جستجوی هوشمند محصولات ورزشی با ترجمه فارسی به ترکی و جستجو در بهترین فروشگاه‌های ورزشی ترکیه مثل Hepsiburada، Trendyol و Decathlon",
  keywords:
    "محصولات ورزشی, کفش ورزشی, لباس ورزشی, لوازم ورزشی, فروشگاه ترکی, خرید آنلاین",
  openGraph: {
    title: "جستجوی هوشمند محصولات ورزشی",
    description: "بهترین محصولات ورزشی از سایت‌های معتبر ترکی با ترجمه خودکار",
    type: "website",
  },
};

interface SportsSearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

function SportsSearchSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8 text-center">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto animate-pulse"></div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className="bg-white border rounded-lg p-4 animate-pulse"
            >
              <div className="bg-gray-200 h-32 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SportsSearchPage({
  searchParams,
}: SportsSearchPageProps) {
  const query = typeof searchParams.q === "string" ? searchParams.q : "";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              🏃‍♂️ جستجوی هوشمند محصولات ورزشی
            </h1>
            <p className="text-lg md:text-xl mb-6 text-blue-100">
              از بهترین فروشگاه‌های ورزشی ترکیه با ترجمه خودکار فارسی به ترکی
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <span>🇹🇷</span>
                <span>Hepsiburada • Trendyol • N11</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <span>🏪</span>
                <span>Decathlon • Intersport • Nike</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <span>🔄</span>
                <span>ترجمه خودکار AI</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  جستجوی هوشمند
                </h3>
                <p className="text-sm text-gray-600">
                  با AI متن فارسی رو به ترکی ترجمه می‌کنیم و بهترین نتایج رو
                  پیدا می‌کنیم
                </p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🏪</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  سایت‌های معتبر
                </h3>
                <p className="text-sm text-gray-600">
                  از بزرگترین فروشگاه‌های ورزشی ترکیه مثل Hepsiburada، Trendyol
                  و Decathlon
                </p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🇮🇷</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  ترجمه به فارسی
                </h3>
                <p className="text-sm text-gray-600">
                  تمام محصولات رو به فارسی ترجمه می‌کنیم تا راحت‌تر بتونید
                  انتخاب کنید
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={<SportsSearchSkeleton />}>
            <IntelligentSearch
              initialQuery={query}
              hideSearchBar={false}
              allowEmpty={true}
              telegramSupport="@gstyle_support"
              apiEndpoint="/api/shopping/sports-intelligent"
              category="ورزشی"
              categoryIcon="🏃‍♂️"
              categoryColor="from-green-500 to-emerald-500"
              searchPlaceholder="جستجوی محصولات ورزشی..."
              quickSuggestions={[
                "کفش ورزشی",
                "لباس ورزشی",
                "توپ فوتبال",
                "کوله ورزشی",
                "دستکش ورزشی",
                "کمربند ورزشی",
              ]}
              emptyStateIcon="🏃‍♂️"
              emptyStateTitle="محصول ورزشی یافت نشد"
              emptyStateDescription="لطفاً کلمات کلیدی دیگری امتحان کنید"
              successMessage="محصول ورزشی یافت شد"
              noResultsMessage="محصول ورزشی یافت نشد"
            />
          </Suspense>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gray-100 py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              چرا جستجوی هوشمند ورزشی؟
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">🎯 دقت بالا</h4>
                <p>
                  با استفاده از هوش مصنوعی، جستجوتون رو به بهترین شکل ممکن انجام
                  می‌دیم و فقط محصولات ورزشی معتبر رو نشونتون می‌دیم.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2">
                  💰 قیمت مناسب
                </h4>
                <p>
                  محصولات ورزشی ترکی کیفیت بالایی دارن و قیمت‌هاشون هم نسبت به
                  برندهای اروپایی خیلی مناسب‌تره.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
