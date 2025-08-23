"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface Category {
  id: string;
  name: string;
  persianName: string;
  image: string;
  searchQuery: string;
}

// Function to get random search queries for each category
function getRandomSearchQuery(categoryId: string): string {
  const categoryQueries: Record<string, string[]> = {
    fashion: [
      "پیراهن تاپ بادی شلوار جین شومیز تی شرت شلوارک",
      "ژاکت پلیور بافت ژیله سویشرت کت جکت کفش",
      "ست مایو اکسسوری پیژاما",
      "پولوشرت جین کت شلوار پلیور مایو هودی",
      "لین بلیزر پالتو کاپشن بارانی کفش کیف",
      "لباس زیبا شیک جذاب مدرن کیفیت عالی",
    ],
    beauty: [
      "ست مراقبت پوستی محصولات ضد پیری کرم",
      "عطر ادکلن بادی اسپلش محصولات مراقبت بدن",
      "محصولات مراقبت مو رنگ مو شانپو کراتین",
      "لوازم آرایش رژ لب ریمل فونداسیون پودر",
      "کرم آفتاب ضد آفتاب محصولات پوستی",
      "ویتامین های زیبایی کلاژن سرم ضد چروک",
    ],
    electronics: [
      "ساعت هوشمند Smart Watch اپل واچ",
      "هدفون بی سیم AirPods هدست گیمینگ",
      "لوازم جانبی موبایل کیف محافظ شارژر",
      "اسپیکر بلوتوث پاور بانک کابل شارژ",
      "لپ تاپ تبلت کیبورد ماوس وب کم",
      "گوشی موبایل Samsung iPhone Xiaomi",
    ],
    sports: [
      "کفش ورزشی نایک آدیداس پوما نیو بالانس",
      "لباس ورزشی تی شرت شلوارک ست ورزشی",
      "اکسسوری ورزشی ساک ورزشی ترموس قمقمه",
      "لوازم ورزشی فیتنس دمبل کش ورزشی",
      "مایو شنا عینک شنا کلاه شنا",
      "کفش پیاده روی جاگینگ دویدن کوهنوردی",
    ],
    pets: [
      "غذای سگ غذای گربه تشویقی حیوانات",
      "قلاده سگ قلاده گربه لباس حیوانات",
      "لوازم جانبی اسباب بازی حیوانات خانگی",
      "ویتامین حیوانات مکمل غذایی پت شاپ",
      "محصولات بهداشتی شامپو حیوانات",
      "جعبه ماسه گربه ظرف آب غذا حیوانات",
    ],
    health: [
      "مولتی ویتامین کمپلکس ویتامین B12",
      "کلسیم منیزیم ویتامین D3 استخوان",
      "ملاتونین خواب آرامش استرس",
      "ویتامین C ایمنی آنتی اکسیدان",
      "پوست مو ناخن بیوتین کراتین",
      "پروبیوتیک گوارش آنزیم هاضمه",
    ],
  };

  const queries = categoryQueries[categoryId] || ["محصولات"];
  const randomIndex = Math.floor(Math.random() * queries.length);
  return queries[randomIndex];
}

const categories: Category[] = [
  {
    id: "fashion",
    name: "Fashion & Clothing",
    persianName: "مد و پوشاک",
    image: "/images/fashion.jpg",
    searchQuery: "",
  },
  {
    id: "beauty",
    name: "Beauty & Cosmetics",
    persianName: "لوازم آرایشی و بهداشتی",
    image: "/images/buity.jpg",
    searchQuery: "",
  },
  {
    id: "electronics",
    name: "Electronics",
    persianName: "الکترونیک",
    image: "/images/laptob.jpg",
    searchQuery: "",
  },
  {
    id: "sports",
    name: "Sports Equipment",
    persianName: "لوازم ورزشی",
    image: "/images/sports.png",
    searchQuery: "",
  },
  {
    id: "pets",
    name: "Pet Supplies",
    persianName: "حیوانات خانگی",
    image: "/images/pets.jpg",
    searchQuery: "",
  },
  {
    id: "health",
    name: "Vitamins & Medicine",
    persianName: "ویتامین و دارو",
    image: "/images/drugs.jpg",
    searchQuery: "",
  },
];

export default function CategoriesGrid() {
  return (
    <div className="w-full mb-20">
      {/* Gray rounded border container */}
      <div className="border-2 border-gray-300 rounded-xl p-6 bg-white/50 shadow-md hover:shadow-lg transition-shadow duration-300">
        {/* Section Header aligned right with green bold title */}
        <div className="relative mb-6 flex items-center justify-end">
          <h2 className="text-2xl md:text-2xl font-extrabold text-green-600 text-right">
            دسته‌بندی‌های محصولات
          </h2>
          <div className="absolute left-0">
            <Link href="/search">
              {/* <Button
                variant="outline"
                className="flex items-center gap-2 text-green-600 border-green-600 hover:bg-green-50"
              >
                بیشتر ببینید
                <ChevronLeft className="w-4 h-4" />
              </Button> */}
            </Link>
          </div>
        </div>

        {/* Static Grid (6 categories only) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-24">
          {categories.map((category) => {
            // Generate random search query for each category on every render
            const randomQuery = getRandomSearchQuery(category.id);
            // Add timestamp to ensure fresh results
            const timestampedQuery = `${randomQuery} ${Date.now()}`;

            return (
              <div key={category.id} className="md:aspect-square">
                <Link
                  href={`/search?q=${encodeURIComponent(timestampedQuery)}`}
                  className="group block h-full"
                >
                  <Card className="w-full h-full hover:shadow-lg transition-shadow duration-200 bg-white border border-blue-300 hover:border-blue-500">
                    <CardContent className="p-4 h-full flex flex-col">
                      {/* Category Image */}
                      <div className="relative mb-3 flex-1">
                        <div className="relative w-full h-32 md:h-36 bg-gray-50 rounded-lg overflow-hidden">
                          <Image
                            src={category.image}
                            alt={category.persianName}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-200"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/images/placeholder.jpg";
                            }}
                          />
                        </div>
                      </div>

                      {/* Category Name */}
                      <div className="text-center">
                        <h3 className="text-sm font-medium text-gray-800 group-hover:text-green-600 transition-colors">
                          {category.persianName}
                        </h3>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
