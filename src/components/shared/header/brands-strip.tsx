"use client";

import Image from "next/image";
import React from "react";

const brandImages: string[] = [
  "1.png",
  "2.png",
  "3.png",
  "4.png",
  "5.png",
  "6.png",
  "7.png",
  "8.png",
  "9.png",
  "10.png",
  "11.png",
  "12.png",
];

export default function BrandsStrip(): JSX.Element {
  return (
    <div className="w-full overflow-hidden" dir="rtl">
      <div className="flex flex-row-reverse flex-wrap justify-center items-center gap-3 sm:gap-6 md:gap-10 px-2 sm:px-4 py-1">
        {brandImages.map((img, idx) => (
          <div
            key={img}
            className="shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-xl border border-gray-200 bg-white shadow-sm p-2 sm:p-3"
            style={{
              animation: `brand-fade-in-out ${2.5 + (idx % 3)}s ease-in-out infinite`,
            }}
          >
            <Image
              src={`/images/brands/${img}`}
              alt={`brand-${img}`}
              width={80}
              height={80}
              className="w-full h-full object-contain"
              draggable={false}
              loading="lazy"
            />
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes brand-fade-in-out {
          0% {
            opacity: 0.35;
            transform: scale(0.96);
          }
          25% {
            opacity: 1;
            transform: scale(1);
          }
          75% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0.35;
            transform: scale(0.96);
          }
        }
      `}</style>
    </div>
  );
}
