import React from "react";

import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-1 flex flex-col p-3 sm:p-4 safe-area-inset-bottom">
        {children}
      </main>
      <Footer />
    </div>
  );
}
