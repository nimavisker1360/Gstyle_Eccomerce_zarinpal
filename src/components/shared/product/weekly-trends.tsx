"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Search } from "lucide-react";

interface TrendKeyword {
  id: string;
  keyword: string;
  searchQuery: string;
  popularity: "high" | "medium" | "low";
  category: string;
}

const weeklyTrends: TrendKeyword[] = [
  {
    id: "skincare",
    keyword: "کرم آفتاب",
    searchQuery: "کرم ضد آفتاب",
    popularity: "high",
    category: "لوازم آرایشی و بهداشتی",
  },
  {
    id: "summer-fashion",
    keyword: "لباس تابستانی",
    searchQuery: "لباس تابستانی مردانه",
    popularity: "high",
    category: "مد و پوشاک",
  },
  {
    id: "wireless-earbuds",
    keyword: "ایرپاد بی‌سیم",
    searchQuery: "هدفون بی سیم",
    popularity: "high",
    category: "موبایل و کامپیوتر",
  },
  {
    id: "makeup",
    keyword: "رژ لب",
    searchQuery: "رژ لب مات",
    popularity: "medium",
    category: "لوازم آرایشی و بهداشتی",
  },
  {
    id: "pet-food",
    keyword: "غذای سگ",
    searchQuery: "غذای خشک سگ",
    popularity: "medium",
    category: "حیوانات خانگی",
  },
  {
    id: "vitamin-d",
    keyword: "ویتامین D",
    searchQuery: "ویتامین D3",
    popularity: "medium",
    category: "ویتامین و دارو",
  },
  {
    id: "toys",
    keyword: "ربات اسباب بازی",
    searchQuery: "ربات کنترلی",
    popularity: "low",
    category: "اسباب بازی و گجت",
  },
  {
    id: "phone-case",
    keyword: "کاور گوشی",
    searchQuery: "کاور محافظ موبایل",
    popularity: "low",
    category: "موبایل و کامپیوتر",
  },
  {
    id: "perfume",
    keyword: "عطر مردانه",
    searchQuery: "ادکلن مردانه",
    popularity: "medium",
    category: "لوازم آرایشی و بهداشتی",
  },
  {
    id: "smart-watch",
    keyword: "ساعت هوشمند",
    searchQuery: "اپل واچ",
    popularity: "high",
    category: "موبایل و کامپیوتر",
  },
  {
    id: "supplement",
    keyword: "مولتی ویتامین",
    searchQuery: "قرص مولتی ویتامین",
    popularity: "low",
    category: "ویتامین و دارو",
  },
  {
    id: "pet-toy",
    keyword: "اسباب بازی گربه",
    searchQuery: "بازی گربه",
    popularity: "medium",
    category: "حیوانات خانگی",
  },
];

const getPriorityColor = (popularity: string) => {
  switch (popularity) {
    case "high":
      return "bg-gradient-to-r from-red-500 to-pink-500 text-white";
    case "medium":
      return "bg-gradient-to-r from-green-500 to-emerald-500 text-white";
    case "low":
      return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

const getPriorityBorder = (popularity: string) => {
  switch (popularity) {
    case "high":
      return "border-red-300 hover:border-red-500";
    case "medium":
      return "border-green-300 hover:border-green-500";
    case "low":
      return "border-blue-300 hover:border-blue-500";
    default:
      return "border-gray-300 hover:border-gray-500";
  }
};

export default function WeeklyTrends() {
  return (
    <div className="w-full mb-20">
      {/* Gray rounded border container */}
      <div className="border-2 border-gray-300 rounded-xl p-6 bg-white/50 shadow-md hover:shadow-lg transition-shadow duration-300">
        {/* Section Header aligned to right (RTL) */}
        <div className="flex items-center justify-end mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl text-green-600 text-right">ترند هفته</h2>
          </div>
        </div>

        {/* Keywords Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4  md:gap-6 lg:gap-24">
          {weeklyTrends.map((trend) => (
            <div key={trend.id} className="relative">
              <Link
                href={`/search?q=${encodeURIComponent(trend.searchQuery)}`}
                className="group block w-full"
              >
                <Card
                  className={`w-full h-full hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white border-2 ${getPriorityBorder(trend.popularity)} transform hover:rotate-1`}
                >
                  <CardContent className="p-4 h-full flex flex-col justify-between min-h-[120px]">
                    {/* Popularity Badge */}
                    <div className="flex justify-end mb-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(trend.popularity)} font-medium`}
                      >
                        {trend.popularity === "high"
                          ? "🔥 داغ"
                          : trend.popularity === "medium"
                            ? "📈 محبوب"
                            : "💡 جدید"}
                      </span>
                    </div>

                    {/* Keyword */}
                    <div className="text-center flex-1 flex items-center justify-center">
                      <h3 className="text-sm font-semibold text-gray-800 group-hover:text-green-600 transition-colors leading-tight">
                        {trend.keyword}
                      </h3>
                    </div>

                    {/* Category */}
                    <div className="text-center mt-2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                        {trend.category}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center justify-center">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200/50 rounded-full px-6 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-green-600">
                  🏷️ کلمات کلیدی پرطرفدار هفته
                </span>
                <span className="text-green-300">•</span>
                <span className="text-xs font-medium text-blue-600">
                  🔄 بروزرسانی هفتگی
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
