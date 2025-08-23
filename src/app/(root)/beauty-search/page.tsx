import { Metadata } from "next";
import { Suspense } from "react";
import IntelligentSearch from "@/components/shared/product/intelligent-search";

export const metadata: Metadata = {
  title: "جستجوی هوشمند زیبایی و آرایش - از سایت‌های معتبر ترکی",
  description:
    "جستجوی هوشمند محصولات زیبایی و آرایش از بهترین فروشگاه‌های ترکیه مثل Sephora، Gratis، Douglas",
};

interface BeautySearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function BeautySearchPage({
  searchParams,
}: BeautySearchPageProps) {
  const query = typeof searchParams.q === "string" ? searchParams.q : "";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              💄 جستجوی هوشمند زیبایی و آرایش
            </h1>
            <p className="text-lg md:text-xl mb-6 text-rose-100">
              از بهترین فروشگاه‌های زیبایی ترکیه با ترجمه خودکار
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <span>💅</span>
                <span>Sephora • Gratis • Douglas</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <span>💋</span>
                <span>Flormar • Golden Rose • L&apos;Oreal</span>
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
              apiEndpoint="/api/shopping/beauty-intelligent"
              category="زیبایی و آرایش"
              categoryIcon="💄"
              categoryColor="from-rose-500 to-pink-500"
              searchPlaceholder="جستجوی محصولات زیبایی و آرایش..."
              quickSuggestions={[
                "رژ لب",
                "کرم آفتاب",
                "ماسکارا",
                "کرم مرطوب کننده",
                "عطر و ادکلن",
                "لوازم آرایش",
              ]}
              emptyStateIcon="💄"
              emptyStateTitle="محصول زیبایی یافت نشد"
              emptyStateDescription="لطفاً کلمات کلیدی دیگری امتحان کنید"
              successMessage="محصول زیبایی یافت شد"
              noResultsMessage="محصول زیبایی یافت نشد"
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
