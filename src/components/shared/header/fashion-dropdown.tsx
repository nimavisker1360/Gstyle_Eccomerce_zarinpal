"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

// Default categories as fallback
const defaultFashionCategories = {
  مردانه: [
    "شلوارک",
    "شلوار",
    "پیراهن",
    "تی شرت",
    "پولوشرت",
    "جین",
    "ست",
    "کت و شلوار",
    "پلیور",
    "مایو",
    "هودی و سویشرت",
    "لین",
    "بلیزر",
    "پالتو",
    "کاپشن و بارانی",
    "کفش",
    "کیف",
    "اکسسوری",
  ],
  "بچه گانه": [
    "دختر 1.5 تا 6 سال",
    "دختر 6 تا 14 سال",
    "پسر 1.5 تا 6 سال",
    "پسر 6 تا 14 سال",
    "نوزاد 0 تا 18 ماه",
    "اسباب بازی",
  ],
};

interface FashionCategory {
  [key: string]: string[];
}

export default function FashionDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [categories, setCategories] = useState<FashionCategory>(
    defaultFashionCategories
  );
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Cache key for fashion categories
  const CACHE_KEY = "fashion_categories_cache";
  const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes

  // Force refresh cache to remove women's categories
  const forceRefreshCache = () => {
    // Clear fashion categories cache
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(`${CACHE_KEY}_timestamp`);

    // Also clear any other category caches that might contain women's data
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.includes("categories_cache") || key.includes("_timestamp")) {
        localStorage.removeItem(key);
      }
    });

    console.log("🗑️ Cleared all category caches to remove women's data");

    // Force reload categories from API
    loadCategories();
  };

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
          console.log("✅ Using cached fashion categories");
          const cachedData = JSON.parse(cached);
          setCategories(cachedData);
          return;
        }
      }

      // If no cache or expired, fetch from API
      setIsLoading(true);
      console.log("🔄 Fetching fashion categories from API...");

      const response = await fetch("/api/shopping/categories?category=fashion");

      if (response.ok) {
        const data = await response.json();

        // Extract categories from API response or use default
        const apiCategories = data.categories || defaultFashionCategories;

        // Cache the results
        localStorage.setItem(CACHE_KEY, JSON.stringify(apiCategories));
        localStorage.setItem(`${CACHE_KEY}_timestamp`, Date.now().toString());

        console.log("💾 Cached fashion categories");
        setCategories(apiCategories);
      } else {
        console.log("⚠️ Using default fashion categories");
        setCategories(defaultFashionCategories);
      }
    } catch (error) {
      console.error("❌ Error loading fashion categories:", error);
      setCategories(defaultFashionCategories);
    } finally {
      setIsLoading(false);
    }
  }, [CACHE_EXPIRY]);

  // Load categories on component mount
  useEffect(() => {
    // Force clear all category caches to remove any women's categories
    const clearAllCategoryCaches = () => {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.includes("categories_cache") || key.includes("_timestamp")) {
          localStorage.removeItem(key);
        }
      });
      console.log("🗑️ Cleared all category caches on mount");
    };

    clearAllCategoryCaches();
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
    router.push(
      `/search?q=${encodeURIComponent(searchQuery)}&category=fashion`
    );
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
      {/* Main Fashion Button */}
      <div className="header-button text-blue-700 hover:text-green-600 font-medium transition-colors flex items-center gap-1">
        مد و پوشاک
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
        <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-[900px] md:w-[900px] w-full max-w-[calc(100vw-2rem)] p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="mr-3 text-sm text-gray-600">
                در حال بارگذاری...
              </span>
            </div>
          ) : (
            <>
              {/* Fashion Accessories */}
              <div className="grid grid-cols-2 gap-6" dir="rtl">
                {/* First Row - Right Side */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-blue-700 border-b border-blue-200 pb-2 text-right">
                      پوشاک مردانه
                    </h3>
                    <div className="space-y-2">
                      <span
                        onClick={() =>
                          handleCategoryClick("پوشاک مردانه", "پیراهن و شلوار")
                        }
                        className="block text-sm text-gray-600 hover:text-green-600 transition-colors text-right cursor-pointer"
                      >
                        پیراهن و شلوار
                      </span>
                      <span
                        onClick={() =>
                          handleCategoryClick("پوشاک مردانه", "کفش مردانه")
                        }
                        className="block text-sm text-gray-600 hover:text-green-600 transition-colors text-right cursor-pointer"
                      >
                        کفش مردانه
                      </span>
                      <span
                        onClick={() =>
                          handleCategoryClick("پوشاک مردانه", "کت و ژاکت")
                        }
                        className="block text-sm text-gray-600 hover:text-green-600 transition-colors text-right cursor-pointer"
                      >
                        کت و ژاکت
                      </span>
                      <span
                        onClick={() =>
                          handleCategoryClick("پوشاک مردانه", "تی‌شرت")
                        }
                        className="block text-sm text-gray-600 hover:text-green-600 transition-colors text-right cursor-pointer"
                      >
                        تی‌شرت
                      </span>
                    </div>
                  </div>
                </div>

                {/* Second Row - Right Side */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-blue-700 border-b border-blue-200 pb-2 text-right">
                      پوشاک کودکان
                    </h3>
                    <div className="space-y-2">
                      <span
                        onClick={() =>
                          handleCategoryClick("پوشاک کودکان", "لباس کودک")
                        }
                        className="block text-sm text-gray-600 hover:text-green-600 transition-colors text-right cursor-pointer"
                      >
                        لباس کودک
                      </span>
                      <span
                        onClick={() =>
                          handleCategoryClick("پوشاک کودکان", "کفش کودک")
                        }
                        className="block text-sm text-gray-600 hover:text-green-600 transition-colors text-right cursor-pointer"
                      >
                        کفش کودک
                      </span>
                      <span
                        onClick={() =>
                          handleCategoryClick("پوشاک کودکان", "اسباب بازی")
                        }
                        className="block text-sm text-gray-600 hover:text-green-600 transition-colors text-right cursor-pointer"
                      >
                        اسباب بازی
                      </span>
                    </div>
                  </div>
                </div>

                {/* Second Row - Left Side */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-blue-700 border-b border-blue-200 pb-2 text-right">
                      لوازم جانبی
                    </h3>
                    <div className="space-y-2">
                      <span
                        onClick={() =>
                          handleCategoryClick("لوازم جانبی", "کیف و کوله")
                        }
                        className="block text-sm text-gray-600 hover:text-green-600 transition-colors text-right cursor-pointer"
                      >
                        کیف و کوله
                      </span>
                      <span
                        onClick={() =>
                          handleCategoryClick("لوازم جانبی", "ساعت")
                        }
                        className="block text-sm text-gray-600 hover:text-green-600 transition-colors text-right cursor-pointer"
                      >
                        ساعت
                      </span>
                      <span
                        onClick={() =>
                          handleCategoryClick("لوازم جانبی", "عینک آفتابی")
                        }
                        className="block text-sm text-gray-600 hover:text-green-600 transition-colors text-right cursor-pointer"
                      >
                        عینک آفتابی
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
