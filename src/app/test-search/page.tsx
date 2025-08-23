"use client";

import SearchProductsLayout from "@/components/shared/product/search-products-layout";

export default function TestSearchPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">تست لایوت جستجو</h1>
      <SearchProductsLayout
        telegramSupport="@gstyle_support"
        allowEmpty={true}
        hideSearchBar={false}
        initialQuery="لباس مردانه"
      />
    </div>
  );
}
