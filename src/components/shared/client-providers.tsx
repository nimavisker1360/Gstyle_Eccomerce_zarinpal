"use client";
import React from "react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "../ui/toaster";
import CartSync from "./cart-sync";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div>{children}</div>
      <CartSync />
      <Toaster />
    </SessionProvider>
  );
}
