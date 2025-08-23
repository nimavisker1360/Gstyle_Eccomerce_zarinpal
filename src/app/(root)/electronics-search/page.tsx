import { Metadata } from "next";
import { Suspense } from "react";
import IntelligentSearch from "@/components/shared/product/intelligent-search";

export const metadata: Metadata = {
  title: "جستجوی هوشمند الکترونیک - از سایت‌های معتبر ترکی",
  description:
    "جستجوی هوشمند محصولات الکترونیک از بهترین فروشگاه‌های ترکیه مثل Hepsiburada، Teknosa، Vatan",
};

interface ElectronicsSearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function ElectronicsSearchPage({
  searchParams,
}: ElectronicsSearchPageProps) {
  const query = typeof searchParams.q === "string" ? searchParams.q : "";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              📱 جستجوی هوشمند الکترونیک
            </h1>
            <p className="text-lg md:text-xl mb-6 text-blue-100">
              از بهترین فروشگاه‌های الکترونیک ترکیه با ترجمه خودکار
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <span>💻</span>
                <span>Hepsiburada • Teknosa • Vatan</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <span>📞</span>
                <span>Apple • Samsung • LG</span>
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
              apiEndpoint="/api/shopping/electronics-intelligent"
              category="الکترونیک"
              categoryIcon="📱"
              categoryColor="from-blue-600 to-cyan-600"
              searchPlaceholder="جستجوی محصولات الکترونیک..."
              quickSuggestions={[
                "گوشی موبایل",
                "لپ‌تاپ",
                "تبلت",
                "هدفون",
                "ساعت هوشمند",
                "کامپیوتر",
              ]}
              emptyStateIcon="📱"
              emptyStateTitle="محصول الکترونیک یافت نشد"
              emptyStateDescription="لطفاً کلمات کلیدی دیگری امتحان کنید"
              successMessage="محصول الکترونیک یافت شد"
              noResultsMessage="محصول الکترونیک یافت نشد"
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
