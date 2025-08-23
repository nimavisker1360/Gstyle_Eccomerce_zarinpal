"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { User, LogOut, RefreshCw } from "lucide-react";
import Link from "next/link";
import useCartStore from "@/hooks/use-cart-store";
import { useState, useMemo } from "react";
import Image from "next/image";

export default function UserButtonClient() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const { clearCart } = useCartStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Avatar logic for client-side component
  const userAvatar = useMemo(() => {
    if (!session?.user) return "";

    const user = session.user;
    const email = user.email || "";

    if (user.image) {
      return user.image;
    }

    // Fallback to unavatar for client-side (avoids crypto dependency)
    if (email) {
      return `https://unavatar.io/${encodeURIComponent(email)}?fallback=https://www.gravatar.com/avatar/default?d=identicon&s=256`;
    }

    return "";
  }, [session?.user]);

  const handleSignOut = async () => {
    try {
      // Clear cart locally so badge shows 0 immediately and persisted store resets
      clearCart();

      // Also clear the server cart
      try {
        await fetch("/api/cart", {
          method: "DELETE",
        });
      } catch (e) {
        // Ignore server cart clearing errors during logout
      }
    } catch (e) {}
    await signOut({ callbackUrl: "/" });
  };

  const handleRefreshSession = async () => {
    setIsRefreshing(true);
    try {
      // Update the session to get the latest user data
      await update();
      // Also refresh the page to get updated profile data
      router.refresh();
    } catch (error) {
      console.error("Error refreshing session:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger className="header-button" asChild>
          <button
            type="button"
            aria-label={session ? "منوی حساب کاربری" : "ورود به حساب"}
            className="flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 shadow-sm transition-colors overflow-hidden"
          >
            {session && userAvatar ? (
              <Image
                src={userAvatar}
                alt="avatar"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-5 w-5 sm:h-4 sm:w-4" />
            )}
          </button>
        </DropdownMenuTrigger>
        {session ? (
          <DropdownMenuContent
            className="w-64 p-0 overflow-hidden rounded-xl border border-green-200 shadow-xl"
            align="end"
            sideOffset={8}
            forceMount
          >
            <div className="bg-white text-green-600 px-4 py-3 text-right">
              <div className="flex items-center justify-between">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRefreshSession}
                  disabled={isRefreshing}
                  className="p-1 h-6 w-6 text-green-600 hover:text-green-700"
                >
                  <RefreshCw
                    className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                </Button>
                <div className="flex items-center gap-4 sm:gap-3">
                  {userAvatar && (
                    <div className="w-12 h-12 sm:w-10 sm:h-10 rounded-lg overflow-hidden border-2 border-green-200">
                      <Image
                        src={userAvatar}
                        alt="avatar"
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {session.user.name}
                    </p>
                    <p className="text-xs opacity-90 mt-1">
                      {session.user.email}
                    </p>
                    {session.user.mobile && (
                      <p className="text-xs opacity-90 mt-1">
                        {session.user.mobile}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="py-1" dir="rtl">
              <Link className="w-full" href="/account">
                <DropdownMenuItem className="flex items-center justify-between gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 cursor-pointer">
                  <span>حساب کاربری شما</span>
                  <User className="w-3 h-3 text-green-600" />
                </DropdownMenuItem>
              </Link>

              {session.user.role === "Admin" && (
                <Link className="w-full" href="/admin/overview">
                  <DropdownMenuItem className="flex items-center justify-between gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 cursor-pointer">
                    <span>مدیریت</span>
                    <User className="w-3 h-3 text-green-600" />
                  </DropdownMenuItem>
                </Link>
              )}

              <div className="my-1 border-t border-gray-100" />

              <DropdownMenuItem
                onClick={handleSignOut}
                className="flex items-center justify-between gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
              >
                <span>خروج</span>
                <LogOut className="w-3 h-3 text-red-600" />
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        ) : (
          <DropdownMenuContent
            className="w-64 p-0 overflow-hidden rounded-xl border border-green-200 shadow-xl"
            align="end"
            sideOffset={8}
            forceMount
          >
            <div className="bg-white text-black px-4 py-3 text-right">
              <p className="text-sm font-medium leading-none">ورود به حساب</p>
              <p className="text-xs opacity-90 mt-1">برای ادامه وارد شوید</p>
            </div>
            <div className="py-2 px-3" dir="rtl">
              <Link
                className={cn(
                  buttonVariants(),
                  "w-full bg-green-600 hover:bg-green-700 text-white"
                )}
                href="/sign-in"
              >
                ورود
              </Link>
              <div className="text-xs text-right mt-2">
                مشتری جدید؟{" "}
                <Link
                  className="text-blue-600 hover:text-blue-700 underline"
                  href="/sign-up"
                >
                  ثبت نام
                </Link>
              </div>
            </div>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </div>
  );
}
