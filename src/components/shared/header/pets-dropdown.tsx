"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

// Default categories as fallback
const defaultPetsCategories = {
  "حیوانات خانگی": [
    "غذای سگ و گربه",
    "تشویقی سگ و گربه",
    "قلاده",
    "لباس و لوازم جانبی",
    "اسباب بازی",
    "ویتامین",
    "محصولات بهداشتی",
    "غذای پرنده",
    "غذای ماهی",
    "غذای همستر",
    "محصولات نظافت",
    "محصولات درمانی",
    "محصولات آموزش",
    "محصولات مسافرت",
  ],
};

interface PetsCategory {
  [key: string]: string[];
}

export default function PetsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [categories, setCategories] = useState<PetsCategory>(
    defaultPetsCategories
  );
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Cache key for pets categories
  const CACHE_KEY = "pets_categories_cache";
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
          console.log("✅ Using cached pets categories");
          const cachedData = JSON.parse(cached);
          setCategories(cachedData);
          return;
        }
      }

      // If no cache or expired, fetch from API
      setIsLoading(true);
      console.log("🔄 Fetching pets categories from API...");

      const response = await fetch("/api/shopping/categories?category=pets");

      if (response.ok) {
        const data = await response.json();

        // Extract categories from API response or use default
        const apiCategories = data.categories || defaultPetsCategories;

        // Cache the results
        localStorage.setItem(CACHE_KEY, JSON.stringify(apiCategories));
        localStorage.setItem(`${CACHE_KEY}_timestamp`, Date.now().toString());

        console.log("💾 Cached pets categories");
        setCategories(apiCategories);
      } else {
        console.log("⚠️ Using default pets categories");
        setCategories(defaultPetsCategories);
      }
    } catch (error) {
      console.error("❌ Error loading pets categories:", error);
      setCategories(defaultPetsCategories);
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
    router.push(`/search?q=${encodeURIComponent(searchQuery)}&category=pets`);
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
      {/* Main Pets Button */}
      <div className="header-button text-blue-700 hover:text-green-600 font-medium transition-colors flex items-center gap-1">
        حیوانات خانگی
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
        <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-[calc(100vw-2rem)] md:w-[300px] p-4">
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
                    <h3
                      className="font-bold text-base text-blue-700 border-b border-green-300 pb-1 mb-2"
                      style={{ direction: "rtl", textAlign: "right" }}
                    >
                      {mainCategory}
                    </h3>
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
