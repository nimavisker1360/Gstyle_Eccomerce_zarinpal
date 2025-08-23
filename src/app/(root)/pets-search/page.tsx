import { Metadata } from "next";
import { Suspense } from "react";
import IntelligentSearch from "@/components/shared/product/intelligent-search";

export const metadata: Metadata = {
  title: "جستجوی هوشمند حیوانات خانگی - از سایت‌های معتبر ترکی",
  description:
    "جستجوی هوشمند محصولات حیوانات خانگی از بهترین فروشگاه‌های ترکیه",
};

interface PetsSearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function PetsSearchPage({ searchParams }: PetsSearchPageProps) {
  const query = typeof searchParams.q === "string" ? searchParams.q : "";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              🐕 جستجوی هوشمند حیوانات خانگی
            </h1>
            <p className="text-lg md:text-xl mb-6 text-green-100">
              بهترین محصولات برای حیوانات خانگی از ترکیه
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <span>🐶</span>
                <span>غذا • اسباب‌بازی • لوازم</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <span>🐱</span>
                <span>مراقبت • بهداشت • تفریح</span>
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
              apiEndpoint="/api/shopping/pets-intelligent"
              category="حیوانات خانگی"
              categoryIcon="🐕"
              categoryColor="from-green-600 to-emerald-600"
              searchPlaceholder="جستجوی محصولات حیوانات خانگی..."
              quickSuggestions={[
                "غذای سگ",
                "غذای گربه",
                "اسباب‌بازی سگ",
                "اسباب‌بازی گربه",
                "کولار سگ",
                "بستر گربه",
              ]}
              emptyStateIcon="🐕"
              emptyStateTitle="محصول حیوان خانگی یافت نشد"
              emptyStateDescription="لطفاً کلمات کلیدی دیگری امتحان کنید"
              successMessage="محصول حیوان خانگی یافت شد"
              noResultsMessage="محصول حیوان خانگی یافت نشد"
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
