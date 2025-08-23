"use client";

import React, { useState, useEffect, useRef } from "react";
import DiscountProductCard from "./discount-product-card";
import OptimizedSkeleton from "./optimized-skeleton";

interface ShoppingProduct {
  id: string;
  title: string;
  originalTitle?: string;
  price: number;
  originalPrice?: number | null;
  currency: string;
  image: string;
  description: string;
  originalDescription?: string;
  googleShoppingLink: string;
  source: string;
  rating: number;
  reviews: number;
  delivery: string;
}

interface LazyProductGridProps {
  products: ShoppingProduct[];
  itemsPerPage?: number;
  className?: string;
}

export default function LazyProductGrid({
  products,
  itemsPerPage = 12,
  className = "",
}: LazyProductGridProps) {
  const [displayedProducts, setDisplayedProducts] = useState<ShoppingProduct[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);

  // Initialize with first batch
  useEffect(() => {
    if (products.length > 0) {
      const firstBatch = products.slice(0, itemsPerPage);
      setDisplayedProducts(firstBatch);
      setHasMore(products.length > itemsPerPage);
    }
  }, [products, itemsPerPage]);

  // Load more products when scrolling near bottom
  const loadMore = React.useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    // Simulate network delay for better UX
    setTimeout(() => {
      const currentLength = displayedProducts.length;
      const nextBatch = products.slice(
        currentLength,
        currentLength + itemsPerPage
      );

      if (nextBatch.length > 0) {
        setDisplayedProducts((prev) => [...prev, ...nextBatch]);
        setHasMore(currentLength + nextBatch.length < products.length);
      } else {
        setHasMore(false);
      }

      setIsLoading(false);
    }, 300);
  }, [displayedProducts.length, products, itemsPerPage, isLoading, hasMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      {
        rootMargin: "100px", // Start loading 100px before reaching the bottom
      }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoading]);

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">🔍</div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          هیچ محصولی یافت نشد
        </h3>
        <p className="text-gray-500">لطفا کلمات کلیدی دیگری امتحان کنید</p>
      </div>
    );
  }

  return (
    <div
      className={`w-full ${className}`}
      style={{ fontFamily: "IRANSans, sans-serif" }}
    >
      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        {displayedProducts.map((product, index) => (
          <DiscountProductCard
            key={`${product.id}-${index}`}
            product={product}
          />
        ))}
      </div>

      {/* Loading more indicator */}
      {isLoading && (
        <div className="mt-8">
          <OptimizedSkeleton
            count={4}
            title="در حال بارگذاری محصولات بیشتر..."
            subtitle=""
          />
        </div>
      )}

      {/* Load more trigger element */}
      {hasMore && !isLoading && (
        <div
          ref={observerRef}
          className="h-20 flex items-center justify-center"
        >
          <div className="text-gray-400 text-sm">در حال بارگذاری...</div>
        </div>
      )}

      {/* End of results */}
      {!hasMore && displayedProducts.length > 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-sm">
            ✅ همه محصولات نمایش داده شد
          </div>
          <div className="text-gray-500 text-xs mt-1">
            {displayedProducts.length} محصول از {products.length}
          </div>
        </div>
      )}
    </div>
  );
}
