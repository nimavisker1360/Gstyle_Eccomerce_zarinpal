"use client";

import React from "react";
import Image from "next/image";

const brandImages = [
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

export default function BrandsShowcase() {
  return (
    <section
      id="brands"
      className="w-full py-12 bg-white flex flex-col items-center overflow-hidden border-2 border-gray-300 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <h2
        className="text-2xl md:text-3xl font-extrabold mb-8 text-center text-green-600"
        style={{
          fontFamily: "IRANSans",
        }}
      >
        برندها
      </h2>
      <div className="w-full flex justify-center relative px-4">
        <div className="grid grid-cols-2  md:grid-cols-6 gap-20 lg:gap-24 max-w-full">
          {brandImages.map((img, idx) => (
            <div
              key={img}
              className="brand-fade flex flex-col items-center justify-center shadow-md rounded-2xl bg-white p-3 md:p-4 border border-gray-100"
              style={{
                animation: `brand-fade-in-out ${
                  3 + (idx % 3)
                }s ease-in-out infinite`,
                minHeight: "100px",
                maxHeight: "120px",
                aspectRatio: "1/1",
              }}
            >
              <Image
                src={`/images/brands/${img}`}
                alt={`brand-${img}`}
                width={80}
                height={80}
                className="w-full h-full object-contain"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes brand-fade-in-out {
          0% {
            opacity: 0.3;
            transform: scale(0.95);
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
            opacity: 0.3;
            transform: scale(0.95);
          }
        }
      `}</style>
    </section>
  );
}
