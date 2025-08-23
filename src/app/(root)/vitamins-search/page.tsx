import { Metadata } from "next";
import { Suspense } from "react";
import IntelligentSearch from "@/components/shared/product/intelligent-search";

export const metadata: Metadata = {
  title: "جستجوی هوشمند ویتامین و دارو - از سایت‌های معتبر ترکی",
  description:
    "جستجوی هوشمند ویتامین و مکمل‌های غذایی از بهترین داروخانه‌های ترکیه",
};

interface VitaminsSearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function VitaminsSearchPage({
  searchParams,
}: VitaminsSearchPageProps) {
  const query = typeof searchParams.q === "string" ? searchParams.q : "";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              💊 جستجوی هوشمند ویتامین و دارو
            </h1>
            <p className="text-lg md:text-xl mb-6 text-orange-100">
              بهترین ویتامین‌ها و مکمل‌های غذایی از ترکیه
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <span>🌿</span>
                <span>ویتامین • مکمل • طبیعی</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <span>💪</span>
                <span>سلامتی • تناسب اندام • انرژی</span>
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
              apiEndpoint="/api/shopping/vitamins-intelligent"
              category="ویتامین و دارو"
              categoryIcon="💊"
              categoryColor="from-orange-500 to-red-500"
              searchPlaceholder="جستجوی ویتامین‌ها و مکمل‌های غذایی..."
              quickSuggestions={[
                "ویتامین D",
                "ویتامین C",
                "امگا 3",
                "کلسیم",
                "آهن",
                "پروتئین",
              ]}
              emptyStateIcon="💊"
              emptyStateTitle="ویتامینی یافت نشد"
              emptyStateDescription="لطفاً کلمات کلیدی دیگری امتحان کنید"
              successMessage="محصول ویتامین یافت شد"
              noResultsMessage="ویتامینی یافت نشد"
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
