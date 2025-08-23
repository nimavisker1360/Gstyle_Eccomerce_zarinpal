"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

// Default categories as fallback
const defaultVitaminCategories = {
  "ویتامین و دارو": [
    "مولتی ویتامین",
    "کلسیم",
    "ویتامین D",
    "ملاتونین",
    "ویتامین C",
    "پوست، مو، ناخن",
    "سایر",
    "ویتامین B",
    "ویتامین E",
    "آهن",
    "روی",
    "منیزیم",
    "امگا 3",
    "پروبیوتیک",
    "آنتی اکسیدان",
    "مکمل ورزشی",
    "داروهای گیاهی",
    "چای و دمنوش",
  ],
};

interface VitaminCategory {
  [key: string]: string[];
}

export default function VitaminDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [categories, setCategories] = useState<VitaminCategory>(
    defaultVitaminCategories
  );
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Cache key for vitamin categories
  const CACHE_KEY = "vitamin_categories_cache";
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
          console.log("✅ Using cached vitamin categories");
          const cachedData = JSON.parse(cached);
          setCategories(cachedData);
          return;
        }
      }

      // If no cache or expired, fetch from API
      setIsLoading(true);
      console.log("🔄 Fetching vitamin categories from API...");

      const response = await fetch(
        "/api/shopping/categories?category=vitamins"
      );

      if (response.ok) {
        const data = await response.json();

        // Extract categories from API response or use default
        const apiCategories = data.categories || defaultVitaminCategories;

        // Cache the results
        localStorage.setItem(CACHE_KEY, JSON.stringify(apiCategories));
        localStorage.setItem(`${CACHE_KEY}_timestamp`, Date.now().toString());

        console.log("💾 Cached vitamin categories");
        setCategories(apiCategories);
      } else {
        console.log("⚠️ Using default vitamin categories");
        setCategories(defaultVitaminCategories);
      }
    } catch (error) {
      console.error("❌ Error loading vitamin categories:", error);
      setCategories(defaultVitaminCategories);
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
    router.push(
      `/search?q=${encodeURIComponent(searchQuery)}&category=vitamins`
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
      {/* Main Vitamin Button */}
      <div className="header-button text-blue-700 hover:text-green-600 font-medium transition-colors flex items-center gap-1">
        ویتامین و دارو
        <ChevronDown className="w-4 h-4" />
      </div>

      {/* Dropdown Menu */}
      <div
        className={`absolute top-full right-0 mt-1 z-50 p-4 transition-all duration-300 ease-out ${
          isOpen
            ? "opacity-100 visible transform translate-y-0 scale-100"
            : "opacity-0 invisible transform -translate-y-2 scale-95 pointer-events-none"
        }`}
      >
        <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-[calc(100vw-2rem)] md:w-[420px] p-4">
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
                    <div className="text-blue-700 font-semibold text-sm border-b border-gray-200 pb-2 mb-2 text-right">
                      {mainCategory}
                    </div>
                    <div className="relative" dir="rtl">
                      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-gray-200" />
                      <div className="grid grid-cols-2 gap-2 px-2 text-right">
                        {subCategories.map((item) => (
                          <span
                            key={item}
                            className="block text-right text-green-700 font-bold hover:text-blue-700 text-xs py-1 px-2 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                            onClick={() =>
                              handleCategoryClick(mainCategory, item)
                            }
                          >
                            <span className="block truncate">{item}</span>
                          </span>
                        ))}
                      </div>
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
