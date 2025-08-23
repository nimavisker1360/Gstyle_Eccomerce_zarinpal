import Image from "next/image";
import Link from "next/link";
import React from "react";
import Footer from "@/components/shared/footer";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      dir="rtl"
      className="relative min-h-screen p-4 text-right highlight-link flex flex-col"
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-48 sm:h-64 bg-gradient-to-b from-sky-100 via-emerald-50 to-transparent -z-10 pointer-events-none"
      />
      <header className="mb-4 border-b bg-transparent">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
         
          </div>
          <Link href="/">
            <Image
              src="/icons/logo01.png"
              alt="Logo"
              width={120}
              height={40}
              style={{
                maxWidth: "100%",
                height: "auto",
              }}
              priority
            />
          </Link>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
