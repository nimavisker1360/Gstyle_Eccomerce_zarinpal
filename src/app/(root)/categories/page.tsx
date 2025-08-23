"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomeBanner } from "@/components/shared/home/home-banner";
import CategoriesGrid from "@/components/shared/product/categories-grid";

export default function CategoriesPage() {
  return (
    <>
      <HomeBanner />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          {/* Categories Section - Aligned with discount products layout */}
          <div className="mb-8">
            <CategoriesGrid />
          </div>
        </div>
      </div>
    </>
  );
}
