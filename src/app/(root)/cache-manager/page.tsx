"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CacheStats {
  stats: Array<{
    _id: string;
    count: number;
    oldestProduct: string;
    newestProduct: string;
  }>;
  totalProducts: number;
  categories: string[];
}

export default function CacheManagerPage() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/shopping/cache-manager?action=stats");
      const data = await response.json();
      if (data.success) {
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      setMessage("خطا در دریافت آمار کش");
    } finally {
      setLoading(false);
    }
  };

  const cleanupCache = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "/api/shopping/cache-manager?action=cleanup"
      );
      const data = await response.json();
      if (data.success) {
        setMessage("کش با موفقیت پاک شد");
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error("Error cleaning cache:", error);
      setMessage("خطا در پاک کردن کش");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("fa-IR");
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      fashion: "bg-pink-100 text-pink-800",
      beauty: "bg-purple-100 text-purple-800",
      electronics: "bg-blue-100 text-blue-800",
      sports: "bg-green-100 text-green-800",
      pets: "bg-orange-100 text-orange-800",
      vitamins: "bg-yellow-100 text-yellow-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[category] || colors.other;
  };

  const getCategoryName = (category: string) => {
    const names: { [key: string]: string } = {
      fashion: "مد و پوشاک",
      beauty: "زیبایی و آرایش",
      electronics: "الکترونیک",
      sports: "ورزشی",
      pets: "حیوانات خانگی",
      vitamins: "ویتامین و دارو",
      other: "سایر",
    };
    return names[category] || category;
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">مدیریت کش محصولات</h1>
        <p className="text-gray-600">نظارت و کنترل کش محصولات در دیتابیس</p>
      </div>

      <div className="flex gap-4 mb-6">
        <Button onClick={fetchStats} disabled={loading} variant="outline">
          {loading ? "در حال بارگذاری..." : "بروزرسانی آمار"}
        </Button>
        <Button onClick={cleanupCache} disabled={loading} variant="destructive">
          {loading ? "در حال پاک کردن..." : "پاک کردن کش قدیمی"}
        </Button>
      </div>

      {message && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          {message}
        </div>
      )}

      {stats && (
        <div className="grid gap-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>خلاصه کش</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.totalProducts}
                  </div>
                  <div className="text-sm text-gray-600">کل محصولات</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.categories.length}
                  </div>
                  <div className="text-sm text-gray-600">دسته‌بندی‌ها</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(stats.totalProducts / stats.categories.length)}
                  </div>
                  <div className="text-sm text-gray-600">میانگین محصولات</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Details */}
          <Card>
            <CardHeader>
              <CardTitle>جزئیات دسته‌بندی‌ها</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.stats.map((category) => (
                  <div key={category._id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge className={getCategoryColor(category._id)}>
                          {getCategoryName(category._id)}
                        </Badge>
                        <span className="text-lg font-semibold">
                          {category.count} محصول
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {Math.round(
                          (category.count / stats.totalProducts) * 100
                        )}
                        %
                      </div>
                    </div>

                    <Separator className="my-2" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">قدیمی‌ترین محصول:</span>
                        <div className="font-medium">
                          {formatDate(category.oldestProduct)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">جدیدترین محصول:</span>
                        <div className="font-medium">
                          {formatDate(category.newestProduct)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cache Info */}
          <Card>
            <CardHeader>
              <CardTitle>اطلاعات کش</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>حداکثر محصولات در هر دسته:</span>
                  <span className="font-semibold">60</span>
                </div>
                <div className="flex justify-between">
                  <span>زمان انقضای محصولات:</span>
                  <span className="font-semibold">24 ساعت</span>
                </div>
                <div className="flex justify-between">
                  <span>حداقل محصولات برای کش:</span>
                  <span className="font-semibold">30</span>
                </div>
                <div className="flex justify-between">
                  <span>حذف خودکار:</span>
                  <span className="font-semibold text-green-600">فعال</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!stats && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">هیچ آمار کشی یافت نشد</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
