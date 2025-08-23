"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestGoogleShoppingPage() {
  const [category, setCategory] = useState("fashion");
  const [query, setQuery] = useState("women clothing");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/shopping/google-shopping?category=${category}&query=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (response.ok) {
        setResults(data);
      } else {
        setError(data.error || "خطا در دریافت اطلاعات");
      }
    } catch (error) {
      setError("خطا در اتصال به سرور");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: "IRANSans, sans-serif" }}
      >
        تست API گوگل شاپینگ
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">دسته‌بندی:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="fashion">مد و لباس</option>
            <option value="beauty">آرایشی و بهداشتی</option>
            <option value="electronics">الکترونیک</option>
            <option value="sports">ورزشی</option>
            <option value="pets">حیوانات خانگی</option>
            <option value="vitamins">ویتامین و مکمل</option>
            <option value="accessories">لوازم جانبی</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">جستجو:</label>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="عبارت جستجو..."
          />
        </div>
      </div>

      <Button onClick={handleTest} disabled={loading} className="mb-6">
        {loading ? "در حال بارگذاری..." : "تست API"}
      </Button>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">خطا</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>نتایج</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong>منبع:</strong> {results.source}
              </div>
              <div>
                <strong>تعداد محصولات:</strong> {results.count}
              </div>
              <div>
                <strong>دسته‌بندی:</strong> {results.category}
              </div>

              {results.products && results.products.length > 0 && (
                <div>
                  <strong>محصولات:</strong>
                  <div className="mt-4 space-y-2">
                    {results.products
                      .slice(0, 3)
                      .map((product: any, index: number) => (
                        <div key={index} className="p-3 border rounded-md">
                          <div>
                            <strong>عنوان:</strong> {product.title}
                          </div>
                          <div>
                            <strong>عنوان فارسی:</strong> {product.title_fa}
                          </div>
                          <div>
                            <strong>قیمت:</strong> {product.price}
                          </div>
                          <div>
                            <strong>منبع:</strong> {product.source}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
