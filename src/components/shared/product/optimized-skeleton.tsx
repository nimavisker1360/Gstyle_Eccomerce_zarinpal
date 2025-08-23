import React from "react";

interface OptimizedSkeletonProps {
  count?: number;
  title?: string;
  subtitle?: string;
}

export default function OptimizedSkeleton({
  count = 8,
  title = "در حال بارگذاری...",
  subtitle = "لطفا صبر کنید",
}: OptimizedSkeletonProps) {
  return (
    <div className="w-full" style={{ fontFamily: "IRANSans, sans-serif" }}>
      {/* Compact Loading Header */}
      <div className="flex items-center justify-center py-6 mb-6">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          {/* Simple spinner */}
          <div className="w-8 h-8 border-2 border-green-200 border-t-green-500 rounded-full animate-spin"></div>

          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-700">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Efficient Product Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        {Array.from({ length: count }, (_, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
          >
            {/* Image skeleton - simpler animation */}
            <div className="w-full h-40 bg-gray-200 rounded-md mb-3 relative overflow-hidden">
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-pulse"
                style={{ animationDelay: `${index * 0.1}s` }}
              />
            </div>

            {/* Title skeleton */}
            <div className="space-y-2 mb-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            </div>

            {/* Price skeleton */}
            <div className="flex justify-between items-center">
              <div className="h-5 bg-green-200 rounded w-20 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// CSS for shimmer effect (add to global styles if needed)
export const skeletonStyles = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
`;
