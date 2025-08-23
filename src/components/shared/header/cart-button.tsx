"use client";

import { ShoppingCartIcon } from "lucide-react";
import Link from "next/link";
import useIsMounted from "@/hooks/use-is-mounted";
import { cn } from "@/lib/utils";
import useCartStore from "@/hooks/use-cart-store";

export default function CartButton() {
  const isMounted = useIsMounted();
  const {
    cart: { items },
  } = useCartStore();
  const cartItemsCount = items.reduce((a, c) => a + c.quantity, 0);
  return (
    <Link href="/cart" className="px-1 header-button">
      <div className="flex items-center gap-2 text-xs">
        <div className="relative">
          <div className="flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 shadow-sm transition-colors">
            <ShoppingCartIcon className="h-5 w-5 sm:h-4 sm:w-4" />
          </div>
          {isMounted && (
            <span
              className={cn(
                `bg-green-600 text-white w-4 h-4 rounded-full text-[8px] font-medium absolute -top-1 -right-1 z-10 flex items-center justify-center shadow`,
                cartItemsCount >= 10 && "text-[8px]"
              )}
            >
              {cartItemsCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
