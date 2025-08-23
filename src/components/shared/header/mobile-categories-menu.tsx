"use client";

import { useState } from "react";
import { Menu, X, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import data from "@/lib/data";
import TelegramButton from "./telegram-button";

// Categories data for dropdowns
const fashionCategories = {
  مردانه: [
    "شلوارک",
    "شلوار",
    "پیراهن",
    "تی شرت",
    "پولوشرت",
    "جین",
    "ست",
    "کت و شلوار",
    "پلیور",
    "مایو",
    "هودی و سویشرت",
    "لین",
    "بلیزر",
    "پالتو",
    "کاپشن و بارانی",
    "کفش",
    "کیف",
    "اکسسوری",
  ],
  "بچه گانه": [
    "دختر 1.5 تا 6 سال",
    "دختر 6 تا 14 سال",
    "پسر 1.5 تا 6 سال",
    "پسر 6 تا 14 سال",
    "نوزاد 0 تا 18 ماه",
    "اسباب بازی",
  ],
};

const beautyCategories = {
  "مراقبت از پوست": [
    "ست مراقبت پوستی",
    "محصولات ضد پیری",
    "محصولات پوستی",
    "محصولات آفتاب",
    "محصولات مراقبت از پوست",
  ],
  "عطر و بدن": ["عطر و ادکلن", "بادی اسپلش", "محصولات مراقبت از بدن"],
  "مراقبت از مو": ["محصولات مراقبت مو", "رنگ مو", "شانه و برس", "شامپو"],
  "سلامت و تغذیه": [
    "انواع ویتامین ها",
    "انواع مکملهای ورزشی",
    "انواع دمنوش و ماچا و قهوه",
  ],
};

const sportsCategories = {
  "کفش ورزشی": [
    "کفش دویدن",
    "کفش پیاده‌روی",
    "کفش بسکتبال",
    "کفش فوتبال",
    "کفش تنیس",
    "کفش ورزشی مردانه",
  ],
  "لباس ورزشی": [
    "تیشرت ورزشی",
    "شلوار ورزشی",
    "لباس فیتنس",
    "لباس یوگا",
    "لباس دویدن",
    "لباس ورزشی مردانه",
  ],
  "لوازم ورزشی": [
    "ساک ورزشی",
    "قمقمه ورزشی",
    "ترموس ورزشی",
    "دستکش ورزشی",
    "تاپ ورزشی",
    "ساعت ورزشی",
    "ماشین تناسب اندام",
  ],
};

const electronicsCategories = {
  الکترونیک: ["ساعت هوشمند", "هدفون", "لوازم جانبی"],
};

const petsCategories = {
  "حیوانات خانگی": [
    "غذای سگ و گربه",
    "تشویقی سگ و گربه",
    "قلاده",
    "لباس و لوازم جانبی",
    "اسباب بازی",
    "ویتامین",
    "محصولات بهداشتی",
  ],
};

const vitaminCategories = {
  "ویتامین و دارو": [
    "مولتی ویتامین",
    "کلسیم",
    "ویتامین D",
    "ملاتونین",
    "ویتامین C",
    "پوست، مو، ناخن",
    "سایر",
  ],
};

export default function MobileCategoriesMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const router = useRouter();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setExpandedCategory(null);
    }
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategory(
      expandedCategory === categoryName ? null : categoryName
    );
  };

  const handleCategoryClick = (
    category: string,
    subCategory: string,
    categoryType: string
  ) => {
    // Navigate to search page with category filter
    const searchQuery = `${category} ${subCategory}`;
    let categoryParam = "";

    switch (categoryType) {
      case "مد و پوشاک":
        categoryParam = "fashion";
        break;
      case "لوازم آرایشی و بهداشتی":
        categoryParam = "beauty";
        break;
      case "لوازم ورزشی":
        categoryParam = "sports";
        break;
      case "الکترونیک":
        categoryParam = "electronics";
        break;
      case "حیوانات خانگی":
        categoryParam = "pets";
        break;
      case "ویتامین و دارو":
        categoryParam = "vitamin";
        break;
      default:
        categoryParam = "general";
    }

    router.push(
      `/search?q=${encodeURIComponent(searchQuery)}&category=${categoryParam}`
    );
    setIsOpen(false);
  };

  const renderSubCategories = (categoryName: string, subCategories: any) => {
    const showBlueTitles =
      categoryName === "مد و پوشاک" ||
      categoryName === "لوازم آرایشی و بهداشتی" ||
      categoryName === "لوازم ورزشی";

    return (
      <div className="mt-2 mr-4 space-y-1">
        {Object.entries(subCategories).map(([mainCategory, items]) => (
          <div key={mainCategory} className="space-y-1">
            {showBlueTitles && (
              <h4 className="font-medium text-blue-600 hover:text-blue-800 text-sm border-b border-green-200 pb-1 cursor-pointer transition-colors duration-200">
                {mainCategory}
              </h4>
            )}
            <div className={`space-y-1 ${showBlueTitles ? "mr-2" : ""}`}>
              {(items as string[]).map((item) => (
                <div
                  key={item}
                  className="block text-green-600 hover:text-blue-600 hover:bg-blue-50 text-xs py-1 px-2 rounded cursor-pointer transition-colors duration-200"
                  onClick={() => {
                    handleCategoryClick(mainCategory, item, categoryName);
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
        aria-label="منوی دسته‌بندی‌ها"
      >
        <Menu className="w-5 h-5 text-blue-600" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Side Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">دسته‌بندی‌ها</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories */}
        <div className="overflow-y-auto h-full pb-20">
          {data.headerMenus.map((menu) => (
            <div key={menu.href} className="border-b border-gray-100">
              {menu.name === "مد و پوشاک" ? (
                <div>
                  <button
                    onClick={() => toggleCategory(menu.name)}
                    className="w-full flex items-center justify-between p-4 text-right hover:bg-blue-50 hover:text-blue-900 transition-colors duration-200"
                  >
                    <span className="font-medium text-blue-700">
                      {menu.name}
                    </span>
                    {expandedCategory === menu.name ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  {expandedCategory === menu.name &&
                    renderSubCategories(menu.name, fashionCategories)}
                </div>
              ) : menu.name === "لوازم آرایشی و بهداشتی" ? (
                <div>
                  <button
                    onClick={() => toggleCategory(menu.name)}
                    className="w-full flex items-center justify-between p-4 text-right hover:bg-blue-50 hover:text-blue-900 transition-colors duration-200"
                  >
                    <span className="font-medium text-blue-700">
                      {menu.name}
                    </span>
                    {expandedCategory === menu.name ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  {expandedCategory === menu.name &&
                    renderSubCategories(menu.name, beautyCategories)}
                </div>
              ) : menu.name === "لوازم ورزشی" ? (
                <div>
                  <button
                    onClick={() => toggleCategory(menu.name)}
                    className="w-full flex items-center justify-between p-4 text-right hover:bg-blue-50 hover:text-blue-900 transition-colors duration-200"
                  >
                    <span className="font-medium text-blue-700">
                      {menu.name}
                    </span>
                    {expandedCategory === menu.name ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  {expandedCategory === menu.name &&
                    renderSubCategories(menu.name, sportsCategories)}
                </div>
              ) : menu.name === "الکترونیک" ? (
                <div>
                  <button
                    onClick={() => toggleCategory(menu.name)}
                    className="w-full flex items-center justify-between p-4 text-right hover:bg-blue-50 hover:text-blue-900 transition-colors duration-200"
                  >
                    <span className="font-medium text-blue-700">
                      {menu.name}
                    </span>
                    {expandedCategory === menu.name ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  {expandedCategory === menu.name &&
                    renderSubCategories(menu.name, electronicsCategories)}
                </div>
              ) : menu.name === "حیوانات خانگی" ? (
                <div>
                  <button
                    onClick={() => toggleCategory(menu.name)}
                    className="w-full flex items-center justify-between p-4 text-right hover:bg-blue-50 hover:text-blue-900 transition-colors duration-200"
                  >
                    <span className="font-medium text-blue-700">
                      {menu.name}
                    </span>
                    {expandedCategory === menu.name ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  {expandedCategory === menu.name &&
                    renderSubCategories(menu.name, petsCategories)}
                </div>
              ) : menu.name === "ویتامین و دارو" ? (
                <div>
                  <button
                    onClick={() => toggleCategory(menu.name)}
                    className="w-full flex items-center justify-between p-4 text-right hover:bg-blue-50 hover:text-blue-900 transition-colors duration-200"
                  >
                    <span className="font-medium text-blue-700">
                      {menu.name}
                    </span>
                    {expandedCategory === menu.name ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  {expandedCategory === menu.name &&
                    renderSubCategories(menu.name, vitaminCategories)}
                </div>
              ) : (
                <Link
                  href={menu.href}
                  className="block p-4 font-medium text-blue-700 hover:text-blue-900 hover:bg-blue-50 cursor-pointer transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  {menu.name}
                </Link>
              )}
            </div>
          ))}

          {/* Telegram Button - Added at the end */}
          <div className="border-b border-gray-100">
            <div className="p-4">
              <TelegramButton />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
