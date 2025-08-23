"use client";

import { useState } from "react";

export default function TestProductsUnder6MPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testAPI = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/shopping/products-under-6m");
      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || "خطا در دریافت داده‌ها");
      }
    } catch (err) {
      setError("خطا در اتصال به سرور");
    } finally {
      setLoading(false);
    }
  };

  const testWithRefresh = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        "/api/shopping/products-under-6m?refresh=true"
      );
      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || "خطا در دریافت داده‌ها");
      }
    } catch (err) {
      setError("خطا در اتصال به سرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-8">
        تست API محصولات زیر ۶ میلیون ریال
      </h1>

      <div className="flex gap-4 justify-center mb-8">
        <button
          onClick={testAPI}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "در حال تست..." : "تست API"}
        </button>

        <button
          onClick={testWithRefresh}
          disabled={loading}
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? "در حال تست..." : "تست با بروزرسانی"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <h3 className="font-bold mb-2">نتیجه تست:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-bold mb-2">توضیحات:</h3>
        <ul className="text-sm space-y-1">
          <li>
            • این API محصولات زیر ۶ میلیون ریال را از SerpAPI جستجو می‌کند
          </li>
          <li>• محصولات زنان فیلتر می‌شوند</li>
          <li>• قیمت‌ها از لیر ترکیه به ریال ایران تبدیل می‌شوند</li>
          <li>• حداکثر ۴۰ محصول در دیتابیس ذخیره می‌شود</li>
          <li>• کش ۳۰ دقیقه‌ای در حافظه و ۲۴ ساعته در دیتابیس</li>
        </ul>
      </div>
    </div>
  );
}
