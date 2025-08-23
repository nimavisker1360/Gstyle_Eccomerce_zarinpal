"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

// Default categories as fallback
const defaultSportsCategories = {
  "کفش ورزشی": [
    "کفش دویدن",
    "کفش پیاده‌روی",
    "کفش بسکتبال",
    "کفش فوتبال",
    "کفش تنیس",
    "کفش ورزشی مردانه",
  ],
  "لباس ورزشی": [
    "تیشرت ورزشی",
    "شلوار ورزشی",
    "لباس فیتنس",
    "لباس یوگا",
    "لباس دویدن",
    "لباس ورزشی مردانه",
  ],
  "لوازم ورزشی": [
    "ساک ورزشی",
    "قمقمه ورزشی",
    "ترموس ورزشی",
    "دستکش ورزشی",
    "تاپ ورزشی",
    "ساعت ورزشی",
    "ماشین تناسب اندام",
  ],
};

interface SportsCategory {
  [key: string]: string[];
}

export default function SportsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [categories, setCategories] = useState<SportsCategory>(
    defaultSportsCategories
  );
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Cache key for sports categories
  const CACHE_KEY = "sports_categories_cache";
  const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes

  // Load categories from cache or API
  const loadCategories = useCallback(async () => {
    try {
      // Check cache first
      const cached = localStorage.getItem(CACHE_KEY);
      const cacheTimestamp = localStorage.getItem(`${CACHE_KEY}_timestamp`);

      if (cached && cacheTimestamp) {
        const now = Date.now();
        const timestamp = parseInt(cacheTimestamp);

        if (now - timestamp < CACHE_EXPIRY) {
          console.log("✅ Using cached sports categories");
          const cachedData = JSON.parse(cached);
          setCategories(cachedData);
          return;
        }
      }

      // If no cache or expired, fetch from API
      setIsLoading(true);
      console.log("🔄 Fetching sports categories from API...");

      const response = await fetch("/api/shopping/categories?category=sports");

      if (response.ok) {
        const data = await response.json();

        // Extract categories from API response or use default
        const apiCategories = data.categories || defaultSportsCategories;

        // Cache the results
        localStorage.setItem(CACHE_KEY, JSON.stringify(apiCategories));
        localStorage.setItem(`${CACHE_KEY}_timestamp`, Date.now().toString());

        console.log("💾 Cached sports categories");
        setCategories(apiCategories);
      } else {
        console.log("⚠️ Using default sports categories");
        setCategories(defaultSportsCategories);
      }
    } catch (error) {
      console.error("❌ Error loading sports categories:", error);
      setCategories(defaultSportsCategories);
    } finally {
      setIsLoading(false);
    }
  }, [CACHE_EXPIRY]);

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleMouseEnter = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    const id = setTimeout(() => {
      setIsOpen(false);
    }, 150); // 150ms تاخیر - حساسیت بالا
    setTimeoutId(id);
  };

  const handleCategoryClick = (category: string, subCategory: string) => {
    // Navigate to search page with category filter
    const searchQuery = `${category} ${subCategory}`;
    router.push(`/search?q=${encodeURIComponent(searchQuery)}&category=sports`);
    setIsOpen(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Sports Button */}
      <div className="header-button text-blue-700 hover:text-green-600 font-medium transition-colors flex items-center gap-1">
        لوازم ورزشی
        <ChevronDown className="w-4 h-4" />
      </div>

      {/* Dropdown Menu */}
      <div
        className={`absolute top-full left-0 mt-1 z-50 p-4 transition-all duration-300 ease-out ${
          isOpen
            ? "opacity-100 visible transform translate-y-0 scale-100"
            : "opacity-0 invisible transform -translate-y-2 scale-95 pointer-events-none"
        }`}
      >
        <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-[calc(100vw-2rem)] md:w-[400px] p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              <span className="mr-2 text-sm text-gray-600">
                در حال بارگذاری...
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(categories).map(
                ([mainCategory, subCategories]) => (
                  <div key={mainCategory} className="space-y-2">
                    <h4
                      className="font-semibold text-sm text-blue-700 border-b pb-1"
                      style={{ direction: "rtl", textAlign: "right" }}
                    >
                      {mainCategory}
                    </h4>
                    <div
                      className="grid grid-cols-2 gap-1"
                      style={{ direction: "rtl" }}
                    >
                      {subCategories.map((item) => (
                        <span
                          key={item}
                          className="text-green-700 font-bold hover:text-blue-700 text-xs py-1 px-2 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                          onClick={() =>
                            handleCategoryClick(mainCategory, item)
                          }
                        >
                          <span className="truncate">{item}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
