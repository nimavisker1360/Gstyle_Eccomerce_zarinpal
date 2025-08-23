import { Suspense } from "react";
import AccessoriesSearchLayout from "@/components/shared/product/accessories-search-layout";

interface AccessoriesPageProps {
  searchParams: {
    q?: string;
  };
}

export default function AccessoriesPage({
  searchParams,
}: AccessoriesPageProps) {
  const query = searchParams.q;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            جستجوی لوازم جانبی کامپیوتر و موبایل
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            بهترین لوازم جانبی کامپیوتر و موبایل را از فروشگاه‌های معتبر ترکیه
            پیدا کنید. لپ تاپ و کامپیوتر از نتایج حذف می‌شوند.
          </p>
        </div>

        {/* Search Component */}
        <Suspense fallback={<div>در حال بارگذاری...</div>}>
          <AccessoriesSearchLayout
            initialQuery={query}
            allowEmpty={true}
            telegramSupport="@gstyle_support"
          />
        </Suspense>
      </div>
    </div>
  );
}
