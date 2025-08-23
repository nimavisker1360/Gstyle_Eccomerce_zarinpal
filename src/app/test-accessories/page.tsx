"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TestAccessoriesPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedApi, setSelectedApi] = useState("debug");

  const testSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      let apiUrl = "";
      switch (selectedApi) {
        case "debug":
          apiUrl = `/api/shopping/accessories-debug?q=${encodeURIComponent(query)}`;
          break;
        case "turkish":
          apiUrl = `/api/shopping/accessories-turkish?q=${encodeURIComponent(query)}`;
          break;
        case "simple":
          apiUrl = `/api/shopping/accessories-simple?q=${encodeURIComponent(query)}`;
          break;
        default:
          apiUrl = `/api/shopping/accessories-debug?q=${encodeURIComponent(query)}`;
      }

      const response = await fetch(apiUrl);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
      setResults({ error: "خطا در جستجو" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">تست جستجوی لوازم جانبی</h1>

        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              placeholder="کوئری جستجو..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button onClick={testSearch} disabled={loading}>
              {loading ? "جستجو..." : "جستجو"}
            </Button>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="api"
                value="debug"
                checked={selectedApi === "debug"}
                onChange={(e) => setSelectedApi(e.target.value)}
                className="mr-2"
              />
              Debug API
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="api"
                value="turkish"
                checked={selectedApi === "turkish"}
                onChange={(e) => setSelectedApi(e.target.value)}
                className="mr-2"
              />
              Turkish API
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="api"
                value="simple"
                checked={selectedApi === "simple"}
                onChange={(e) => setSelectedApi(e.target.value)}
                className="mr-2"
              />
              Simple API
            </label>
          </div>
        </div>

        {results && (
          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-bold mb-2">اطلاعات جستجو:</h3>
              <div className="text-sm space-y-2">
                <p>
                  <strong>پیام:</strong> {results.message}
                </p>
                <p>
                  <strong>کوئری:</strong> {results.search_query}
                </p>
                <p>
                  <strong>تعداد محصولات:</strong>{" "}
                  {results.products?.length || 0}
                </p>
              </div>
            </div>

            {results.products && results.products.length > 0 && (
              <div>
                <h3 className="font-bold mb-4">
                  محصولات یافت شده ({results.products.length}):
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.products.map((product: any, index: number) => (
                    <div key={index} className="border p-4 rounded">
                      <h4 className="font-bold">{product.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {product.description}
                      </p>
                      <p className="text-green-600 font-bold">
                        {product.price} {product.currency}
                      </p>
                      <p className="text-xs text-gray-500">{product.source}</p>
                      {product.rating > 0 && (
                        <p className="text-xs text-gray-500">
                          ⭐ {product.rating} ({product.reviews} نظر)
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
