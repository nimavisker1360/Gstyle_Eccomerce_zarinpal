import { APP_NAME } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import Menu from "./menu";

import data from "@/lib/data";
import Search from "./search";
import CartButton from "./cart-button";
import UserButtonClient from "./user-button-client";
import FashionDropdown from "./fashion-dropdown";
import BeautyDropdown from "./beauty-dropdown";
import SportsDropdown from "./sports-dropdown";
import ElectronicsDropdown from "./electronics-dropdown";
import PetsDropdown from "./pets-dropdown";
import VitaminDropdown from "./vitamin-dropdown";
import MobileCategoriesMenu from "./mobile-categories-menu";
import TelegramButton from "./telegram-button";
import BrandsStrip from "./brands-strip";

export default function Header() {
  return (
    <header className="bg-white text-gray-800 safe-area-inset-top">
      {/* Top Row - Main Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 shadow-[0_2px_6px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo and eNAMAD - Left side */}
          <div className="flex flex-col sm:flex-row items-center gap-0.5 md:gap-4 flex-shrink-0">
            <Link
              href="/"
              className="flex items-center header-button font-semibold text-xl"
            >
              <Image
                src="/icons/logo01.png"
                width={120}
                height={40}
                alt="Logo"
                className="w-[100px] h-auto sm:w-[120px] md:w-[140px] object-contain"
                priority
              />
            </Link>

            {/* eNAMAD Logo - Below Gstyle on mobile, beside on larger screens */}
            <div>
              <a
                referrerPolicy="origin"
                target="_blank"
                href="https://trustseal.enamad.ir/?id=638123&Code=eBxB35o8ufkW2EgjTfb1UJlE4FxRgffQ"
              >
                <Image
                  src="/icons/enamad.png"
                  alt="enamad"
                  width={80}
                  height={40}
                  className="w-[80px] h-auto sm:w-[80px] md:w-[80px] object-contain"
                />
              </a>
            </div>
          </div>
          {/* Search Bar - Centered on desktop */}
          <div className="hidden md:block flex-1 max-w-2xl mx-8 ">
            <Search />
          </div>

          {/* Right Side Icons - Desktop */}
          <div className="hidden md:flex flex-col items-end gap-6">
            <span className="text-sm text-green-600 leading-none">
              ارسال رایگان به سراسر کشور
            </span>
            <div className="flex items-center gap-4">
              <CartButton />
              <UserButtonClient />
            </div>
          </div>

          {/* Mobile Right Side - Cart and User */}
          <div className="md:hidden flex flex-col items-end gap-2">
            <span className="text-xs text-green-600 leading-none">
              ارسال رایگان به سراسر کشور
            </span>
            <div className="flex items-center gap-3">
              <CartButton />
              <UserButtonClient />
            </div>
          </div>
        </div>

        {/* Mobile Search - Below logo */}
        <div className="md:hidden flex items-center gap-3 py-3">
          <MobileCategoriesMenu />
          <div className="flex-1">
            <Search />
          </div>
        </div>
      </div>

      {/* Category Navigation Row */}
      <div className="px-4 sm:px-6 py-2 sm:py-3">
        <div className="max-w-7xl w-full mx-auto">
          <div className="px-3 md:px-6 py-2">
            <div className="hidden md:flex items-center justify-center gap-8 text-sm">
              <TelegramButton />
              {data.headerMenus.map((menu) =>
                menu.name === "مد و پوشاک" ? (
                  <FashionDropdown key={menu.href} />
                ) : menu.name === "لوازم آرایشی و بهداشتی" ? (
                  <BeautyDropdown key={menu.href} />
                ) : menu.name === "لوازم ورزشی" ? (
                  <SportsDropdown key={menu.href} />
                ) : menu.name === "الکترونیک" ? (
                  <ElectronicsDropdown key={menu.href} />
                ) : menu.name === "حیوانات خانگی" ? (
                  <PetsDropdown key={menu.href} />
                ) : menu.name === "ویتامین و دارو" ? (
                  <VitaminDropdown key={menu.href} />
                ) : (
                  <span
                    key={menu.href}
                    className="text-blue-700 hover:text-green-600 font-medium transition-colors cursor-pointer"
                  >
                    {menu.name}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom shadow (no border) */}
      <div className="w-full h-px bg-white shadow-[0_2px_6px_rgba(0,0,0,0.06)]"></div>
    </header>
  );
}
