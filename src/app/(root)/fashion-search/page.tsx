import { Metadata } from "next";
import { Suspense } from "react";
import IntelligentSearch from "@/components/shared/product/intelligent-search";

export const metadata: Metadata = {
  title: "جستجوی هوشمند مد و پوشاک - از سایت‌های معتبر ترکی",
  description:
    "جستجوی هوشمند مد و پوشاک با ترجمه فارسی به ترکی از بهترین فروشگاه‌های ترکیه مثل Zara، LC Waikiki، Trendyol",
};

interface FashionSearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function FashionSearchPage({
  searchParams,
}: FashionSearchPageProps) {
  const query = typeof searchParams.q === "string" ? searchParams.q : "";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl md:text-3xl font-semibold mb-4 text-black">
              👗 جستجوی هوشمند مد و پوشاک
            </h1>
            <p className="text-base md:text-lg mb-6 text-pink-100">
              از بهترین فروشگاه‌های مد ترکیه با ترجمه خودکار فارسی به ترکی
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <span>🇹🇷</span>
                <span>Zara • H&M • Mango</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <span>🏪</span>
                <span>LC Waikiki • Koton • Defacto</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={<div>Loading...</div>}>
            <IntelligentSearch
              initialQuery={query}
              hideSearchBar={false}
              allowEmpty={true}
              telegramSupport="@gstyle_support"
              apiEndpoint="/api/shopping/fashion-intelligent"
              category="مد و پوشاک"
              categoryIcon="👗"
              categoryColor="from-pink-600 to-purple-600"
              searchPlaceholder="جستجوی مد و پوشاک..."
              quickSuggestions={["لباس مردانه", "کفش", "کیف", "ساعت", "عینک"]}
              emptyStateIcon="👗"
              emptyStateTitle="محصول مد یافت نشد"
              emptyStateDescription="لطفاً کلمات کلیدی دیگری امتحان کنید"
              successMessage="محصول مد یافت شد"
              noResultsMessage="محصول مد یافت نشد"
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
