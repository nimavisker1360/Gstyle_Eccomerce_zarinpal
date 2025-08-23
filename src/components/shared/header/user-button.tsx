import { auth } from "@/auth";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignOut, getUserProfile } from "@/lib/actions/user.actions";
import { cn } from "@/lib/utils";
import { User, LogOut, Shield } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function UserButton() {
  const session = await auth();
  const user = session?.user;
  const profile = user?.id ? await getUserProfile(user.id) : null;

  // Avatar logic - same as account page
  const email = profile?.email || user?.email || "";
  const crypto = await import("crypto");
  const hash = email
    ? crypto.createHash("md5").update(email.trim().toLowerCase()).digest("hex")
    : "";

  const gravatarAvatar = hash
    ? `https://www.gravatar.com/avatar/${hash}?d=identicon&s=256`
    : "";
  const unavatarFromEmail = email
    ? `https://unavatar.io/${encodeURIComponent(email)}?fallback=${encodeURIComponent(
        gravatarAvatar
      )}`
    : "";

  const userAvatar =
    profile?.image || user?.image || unavatarFromEmail || gravatarAvatar || "";

  return (
    <div className="flex gap-2 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger
          className="header-button header-button--round"
          asChild
        >
          <button
            type="button"
            aria-label={session ? "منوی حساب کاربری" : "ورود به حساب"}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 shadow-sm transition-colors overflow-hidden"
          >
            {session && userAvatar ? (
              <Image
                src={userAvatar}
                alt="avatar"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-5 w-5" />
            )}
          </button>
        </DropdownMenuTrigger>
        {session ? (
          <DropdownMenuContent className="w-64" align="end" forceMount>
            <DropdownMenuLabel className="font-normal text-right">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {session.user.name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session.user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              <Link className="w-full" href="/account">
                <DropdownMenuItem className="flex items-center justify-between gap-3 px-4 py-2 text-sm text-green-700 hover:text-green-800 hover:bg-green-50 cursor-pointer">
                  <span>حساب کاربری شما</span>
                  <User className="w-4 h-4 text-green-600" />
                </DropdownMenuItem>
              </Link>

              {session.user.role === "Admin" && (
                <Link className="w-full" href="/admin/overview">
                  <DropdownMenuItem className="flex items-center justify-between gap-3 px-4 py-2 text-sm text-green-700 hover:text-green-800 hover:bg-green-50 cursor-pointer">
                    <span>مدیریت</span>
                    <Shield className="w-4 h-4 text-green-600" />
                  </DropdownMenuItem>
                </Link>
              )}
            </DropdownMenuGroup>
            <DropdownMenuItem className="p-0 mb-1" asChild>
              <form action={SignOut} className="w-full">
                <Button
                  className="w-full py-3 px-4 h-auto justify-between text-red-600 hover:text-red-700 hover:bg-red-50"
                  variant="ghost"
                >
                  <span>خروج</span>
                  <LogOut className="w-4 h-4" />
                </Button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        ) : (
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Link
                  className={cn(
                    buttonVariants(),
                    "w-full bg-green-600 hover:bg-green-700 text-white"
                  )}
                  href="/sign-in"
                >
                  ورود
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuLabel>
              <div className="font-normal">
                مشتری جدید؟{" "}
                <Link
                  className="text-blue-600 hover:text-blue-700 underline"
                  href="/sign-up"
                >
                  ثبت نام
                </Link>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </div>
  );
}
