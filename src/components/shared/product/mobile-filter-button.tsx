"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import SearchSidebar from "./search-sidebar";

interface MobileFilterButtonProps {
  currentQuery?: string;
  totalProducts?: number;
  onFilterChange?: (filters: any) => void;
}

export default function MobileFilterButton({
  currentQuery,
  totalProducts,
  onFilterChange,
}: MobileFilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Filter Button - Only visible on mobile */}
      <div className="lg:hidden mb-4">
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          className="w-full justify-between"
        >
          <span>فیلترها</span>
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Sidebar */}
          <div
            className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg"
            dir="rtl"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
              <h3 className="text-lg font-semibold">فیلترها</h3>
            </div>

            <div className="h-full overflow-y-auto">
              <SearchSidebar
                currentQuery={currentQuery}
                totalProducts={totalProducts}
                onFilterChange={onFilterChange}
                onItemSelected={() => setIsOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
