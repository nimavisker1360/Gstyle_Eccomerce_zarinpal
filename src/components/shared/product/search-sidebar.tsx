"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SearchSidebarProps {
  currentQuery?: string;
  totalProducts?: number;
  onFilterChange?: (filters: any) => void;
  onItemSelected?: () => void; // for mobile: close sidebar after selection
}

// Normalized category item used in the sidebar list
interface CategoryItem {
  id: string; // stable id built from main + sub
  main: string; // Persian main category name (e.g., "لوازم آرایشی و بهداشتی")
  sub: string; // Persian subcategory (e.g., "کرم مرطوب کننده")
}

interface Brand {
  id: string;
  name: string;
  count: number;
}

export default function SearchSidebar({
  currentQuery,
  totalProducts = 0,
  onFilterChange,
  onItemSelected,
}: SearchSidebarProps) {
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allCategories, setAllCategories] = useState<
    Record<string, { name: string; categories: Record<string, string[]> }>
  >({});

  // Load all category definitions (Persian) from our API
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/shopping/categories?type=all", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          throw new Error("خطا در دریافت دسته‌بندی‌ها");
        }
        const data = await response.json();
        // data.categories is an object keyed by slug (e.g., beauty, electronics, ...)
        setAllCategories(data.categories || {});
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "خطا در بارگذاری دسته‌بندی‌ها"
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Build grouped structure and also a flattened helper list
  const { grouped, flat } = useMemo(() => {
    const groups: Array<{
      groupName: string;
      mains: Array<{ main: string; subs: string[] }>;
    }> = [];
    const flatItems: CategoryItem[] = [];

    Object.values(allCategories).forEach((group) => {
      const groupName = group.name;
      const mains: Array<{ main: string; subs: string[] }> = [];
      Object.entries(group.categories || {}).forEach(([main, subs]) => {
        mains.push({ main, subs });
        subs.forEach((sub) => {
          const id = `${groupName}-${main}-${sub}`;
          flatItems.push({ id, main, sub });
        });
      });
      groups.push({ groupName, mains });
    });

    return { grouped: groups, flat: flatItems };
  }, [allCategories]);

  const handleCategoryChange = (
    categoryId: string,
    checked: boolean,
    main: string,
    sub: string
  ) => {
    if (checked) {
      setSelectedCategories([categoryId]);
      // Build a query like "{main} {sub}" and navigate to /search
      const searchQuery = `${main} ${sub}`;
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      // If provided (mobile), close the sidebar immediately
      onItemSelected?.();
    } else {
      setSelectedCategories([]);
    }

    onFilterChange?.({
      categories: checked ? [categoryId] : [],
    });
  };

  // Filter groups by search term - keeps mains as bold text (no checkbox)
  const filteredGroups = useMemo(() => {
    const term = categorySearch.trim().toLowerCase();
    if (!term) return grouped;

    // Keep mains that match or have subs that match
    return grouped
      .map((g) => ({
        groupName: g.groupName,
        mains: g.mains
          .map((m) => ({
            main: m.main,
            subs: m.subs.filter(
              (s) =>
                m.main.toLowerCase().includes(term) ||
                s.toLowerCase().includes(term)
            ),
          }))
          .filter(
            (m) => m.main.toLowerCase().includes(term) || m.subs.length > 0
          ),
      }))
      .filter((g) => g.mains.length > 0);
  }, [categorySearch, grouped]);

  return (
    <div className="w-80 bg-white border-l border-green-200 p-6 h-screen overflow-y-auto">
      {/* Header with context info and breadcrumb in a beautiful green card */}
      <div className="mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg border border-green-400">
          <div className="text-white">
            {currentQuery && (
              <div className="mb-4">
                <h3 className="text-lg font-bold text-right mb-2">
                  نتایج جستجو
                </h3>
                <p className="text-green-100 text-right text-sm">
                  جستجو برای:{" "}
                  <span className="font-semibold">
                    {currentQuery?.replace(/\d+/g, "").trim()}
                  </span>
                </p>
                {totalProducts > 0 && (
                  <p className="text-green-100 text-right text-sm mt-1">
                    تعداد محصولات:{" "}
                    <span className="font-semibold">{totalProducts}</span>
                  </p>
                )}
              </div>
            )}

            {/* Breadcrumb */}
            <Link
              href="/"
              className="flex items-center text-green-100 hover:text-white transition-colors duration-200 text-sm"
            >
              <ChevronLeft className="w-4 h-4 ml-2" />
              <span>بازگشت به صفحه اصلی</span>
            </Link>
          </div>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Categories Section */}
      <div className="mb-8">
        <h3 className="font-bold text-green-800 mb-4 text-right">
          دسته‌بندی‌ها
        </h3>

        {/* Category Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="جستجوی دسته‌بندی"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="pl-10 text-right"
              dir="rtl"
            />
          </div>
        </div>

        {loading && (
          <div className="text-right text-sm text-gray-500 mb-2">
            در حال بارگذاری دسته‌بندی‌ها...
          </div>
        )}
        {error && (
          <div className="text-right text-sm text-red-600 mb-2">{error}</div>
        )}

        {/* Show All Categories Button - when a category is selected */}
        {selectedCategories.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => {
                setSelectedCategories([]);
                onFilterChange?.({
                  categories: [],
                });
              }}
              className="w-full px-3 py-2 text-sm text-green-700 border border-green-400 rounded-lg hover:bg-green-100 transition-colors font-medium"
            >
              نمایش همه دسته‌بندی‌ها
            </button>
          </div>
        )}

        <div className="space-y-5">
          {filteredGroups.map((group) => (
            <div key={group.groupName} className="space-y-3">
              {group.mains.map((m) => (
                <div key={`${group.groupName}-${m.main}`} className="space-y-2">
                  {/* Main category title as bold text (no checkbox) */}
                  <div className="text-right font-bold text-gray-800 pr-1">
                    {m.main}
                  </div>

                  {/* Sub items with checkboxes */}
                  <div className="space-y-2">
                    {m.subs.map((sub) => {
                      const id = `${group.groupName}-${m.main}-${sub}`;
                      const isSelected = selectedCategories.includes(id);
                      const hasAnySelected = selectedCategories.length > 0;
                      const shouldShow = !hasAnySelected || isSelected;
                      if (!shouldShow) return null;

                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-green-50 transition-colors"
                        >
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <Checkbox
                              id={`category-${id}`}
                              checked={isSelected}
                              onCheckedChange={(checked) =>
                                handleCategoryChange(
                                  id,
                                  checked as boolean,
                                  m.main,
                                  sub
                                )
                              }
                              className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                            />
                            <label
                              htmlFor={`category-${id}`}
                              className="text-sm text-gray-700 cursor-pointer flex-1 text-right"
                            >
                              {sub}
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Clear Filters Button */}
      {selectedCategories.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => {
              setSelectedCategories([]);
              onFilterChange?.({
                categories: [],
              });
            }}
            className="w-full px-4 py-2 text-sm text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
          >
            پاک کردن فیلترها
          </button>
        </div>
      )}
    </div>
  );
}
