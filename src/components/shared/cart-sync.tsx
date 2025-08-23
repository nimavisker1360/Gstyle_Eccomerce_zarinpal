"use client";
import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import useCartStore from "@/hooks/use-cart-store";

// Keeps the user's cart in sync with the server while authenticated
export default function CartSync() {
  const { status } = useSession();
  const { cart, replaceCart } = useCartStore();
  const hasHydratedRef = useRef(false);
  const isFetchingRef = useRef(false);
  const lastSyncedRef = useRef<string>("");

  // Load server cart when user logs in
  useEffect(() => {
    const load = async () => {
      if (status !== "authenticated") return;
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      try {
        const res = await fetch("/api/cart", { cache: "no-store" });
        const json = await res.json();
        const server = json?.data ?? null;
        const serverItems = Array.isArray(server?.items) ? server.items : [];

        // Always load server cart when user logs in
        const normalized = {
          items: serverItems,
          itemsPrice: server?.itemsPrice ?? 0,
          taxPrice: server?.taxPrice ?? undefined,
          shippingPrice: server?.shippingPrice ?? undefined,
          totalPrice: server?.totalPrice ?? 0,
          paymentMethod: server?.paymentMethod ?? undefined,
          shippingAddress: server?.shippingAddress ?? undefined,
          deliveryDateIndex: server?.deliveryDateIndex ?? undefined,
        };

        replaceCart(normalized);
        lastSyncedRef.current = JSON.stringify(normalized);

        // Persist cart immediately so it stays after logout/login
        await fetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(normalized),
        }).catch(() => {});
      } finally {
        isFetchingRef.current = false;
      }
    };
    load();
  }, [status]);

  // Persist cart on any change while logged in
  useEffect(() => {
    if (status !== "authenticated") return;
    const payload = JSON.stringify(cart);
    if (payload === lastSyncedRef.current) return;
    lastSyncedRef.current = payload;
    const controller = new AbortController();
    fetch("/api/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: payload,
      signal: controller.signal,
    }).catch(() => {});
    return () => controller.abort();
  }, [cart, status]);

  return null;
}
