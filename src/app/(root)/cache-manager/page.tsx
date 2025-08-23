"use client";

import CacheManager from "@/components/shared/cache-manager";

export default function CacheManagerPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">مدیریت کش محصولات</h1>
        <p className="text-gray-600">نظارت و کنترل سیستم کش محصولات تخفیف</p>
      </div>

      <CacheManager />
    </div>
  );
}
