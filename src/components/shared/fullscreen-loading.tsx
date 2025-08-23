"use client";
import React from "react";

type FullscreenLoadingProps = {
  title?: string;
  subtitle?: string;
  primaryColorClass?: string; // spinner primary color (e.g., border-t-green-500)
  secondaryColorClass?: string; // inner spinner color (e.g., border-t-blue-500)
};

export default function FullscreenLoading({
  title = "در حال پردازش...",
  subtitle,
  primaryColorClass = "border-t-green-500",
  secondaryColorClass = "border-t-blue-500",
}: FullscreenLoadingProps) {
  return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative">
          <div
            className={`w-12 h-12 border-4 border-green-100 border-t-4 rounded-full animate-spin ${primaryColorClass}`}
          ></div>
          <div
            className={`absolute top-1.5 left-1.5 w-9 h-9 border-4 border-blue-100 border-t-4 rounded-full animate-spin ${secondaryColorClass}`}
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          ></div>
        </div>

        <div className="mt-4 text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
          {subtitle ? (
            <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
          ) : (
            <div className="flex justify-center items-center space-x-1 rtl:space-x-reverse">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></div>
              <div
                className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
