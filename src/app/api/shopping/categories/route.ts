import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import GoogleShoppingProduct from "@/lib/db/models/google-shopping-product.model";

// Category definitions with default data
const categoryDefinitions = {
  fashion: {
    name: "مد و پوشاک",
    categories: {
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
    },
  },
  beauty: {
    name: "لوازم آرایشی و بهداشتی",
    categories: {
      "مراقبت از پوست": [
        "محصولات مراقبت از پوست",
        "ست مراقبت پوستی",
        "محصولات ضد پیری",
        "محصولات آفتاب",
        "کرم مرطوب کننده",
        "سرم صورت",
        "پاک کننده پوست",
        "تونر و ماسک",
      ],
      "مراقبت از مو": [
        "شامپو",
        "نرم کننده مو",
        "ماسک مو",
        "سرم مو",
        "روغن مو",
        "رنگ مو",
        "محصولات حالت دهی",
        "شانه و برس",
      ],
      "عطر و بدن": [
        "عطر",
        "ادکلن",
        "لوسیون بدن",
        "محصولات ضد تعریق",
        "بادی اسپلش",
        "کرم دست و پا",
        "محصولات مراقبت از بدن",
        "دئودرانت",
      ],
      "سلامت و تغذیه": [
        "انواع ویتامین ها",
        "مکملهای ورزشی",
        "انواع دمنوش",
        "شربت و داروهای گیاهی",
        "محصولات تقویتی",
        "چای و قهوه",
      ],
    },
  },
  electronics: {
    name: "الکترونیک",
    categories: {
      الکترونیک: [
        "ساعت هوشمند",
        "هدفون",
        "لوازم جانبی",
        // Removed per requirement: گوشی موبایل، لپ تاپ، تبلت، کامپیوتر، دوربین، کنسول بازی
        "اسپیکر",
        "کیف و کاور",
        "شارژر",
        "کابل",
        "کارت حافظه",
      ],
    },
  },
  sports: {
    name: "لوازم ورزشی",
    categories: {
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
    },
  },
  pets: {
    name: "حیوانات خانگی",
    categories: {
      "حیوانات خانگی": [
        "غذای سگ و گربه",
        "تشویقی سگ و گربه",
        "قلاده",
        "لباس و لوازم جانبی",
        "اسباب بازی",
        "ویتامین",
        "محصولات بهداشتی",
        "غذای پرنده",
        "غذای ماهی",
        "غذای همستر",
        "محصولات نظافت",
        "محصولات درمانی",
        "محصولات آموزش",
        "محصولات مسافرت",
      ],
    },
  },
  vitamins: {
    name: "ویتامین و دارو",
    categories: {
      "ویتامین و دارو": [
        "مولتی ویتامین",
        "کلسیم",
        "ویتامین D",
        "ملاتونین",
        "ویتامین C",
        "پوست، مو، ناخن",
        "سایر",
        "ویتامین B",
        "ویتامین E",
        "آهن",
        "روی",
        "منیزیم",
        "امگا 3",
        "پروبیوتیک",
        "آنتی اکسیدان",
        "مکمل ورزشی",
        "داروهای گیاهی",
        "چای و دمنوش",
      ],
    },
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const type = searchParams.get("type");

    // Connect to database
    await connectToDatabase();

    // If specific category is requested
    if (
      category &&
      categoryDefinitions[category as keyof typeof categoryDefinitions]
    ) {
      const categoryData =
        categoryDefinitions[category as keyof typeof categoryDefinitions];

      // Try to get enhanced categories from database if available
      try {
        const cachedProducts = await GoogleShoppingProduct.find({
          category: category,
        }).limit(10);

        if (cachedProducts.length > 0) {
          // Extract categories from cached products if available
          const enhancedCategories = extractCategoriesFromProducts(
            cachedProducts,
            categoryData
          );
          return NextResponse.json({
            success: true,
            category: category,
            name: categoryData.name,
            categories: enhancedCategories,
            message: "Enhanced categories from cached products",
          });
        }
      } catch (error) {
        console.log("No cached products found for category:", category);
      }

      // Return default categories
      return NextResponse.json({
        success: true,
        category: category,
        name: categoryData.name,
        categories: categoryData.categories,
        message: "Default categories",
      });
    }

    // If no specific category, return all categories
    if (type === "all") {
      const allCategories: Record<
        string,
        { name: string; categories: Record<string, string[]> }
      > = {};

      for (const [key, value] of Object.entries(categoryDefinitions)) {
        allCategories[key] = {
          name: value.name,
          categories: value.categories,
        };
      }

      return NextResponse.json({
        success: true,
        categories: allCategories,
        message: "All categories",
      });
    }

    // Default response
    return NextResponse.json({
      success: true,
      message: "Categories API endpoint",
      available_categories: Object.keys(categoryDefinitions),
    });
  } catch (error) {
    console.error("❌ Error in categories API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to extract categories from cached products
function extractCategoriesFromProducts(
  products: any[],
  defaultCategoryData: any
) {
  const extractedCategories = { ...defaultCategoryData.categories };

  // Extract unique product titles and categorize them
  const productTitles = products.map((p) => p.title).filter(Boolean);

  // Simple categorization based on keywords
  for (const title of productTitles) {
    const lowerTitle = title.toLowerCase();

    // Fashion categorization
    if (defaultCategoryData.name === "مد و پوشاک") {
      if (lowerTitle.includes("مرد") || lowerTitle.includes("پسر")) {
        if (!extractedCategories.مردانه) extractedCategories.مردانه = [];
        extractedCategories.مردانه.push(title);
      } else if (lowerTitle.includes("بچه") || lowerTitle.includes("کودک")) {
        if (!extractedCategories["بچه گانه"])
          extractedCategories["بچه گانه"] = [];
        extractedCategories["بچه گانه"].push(title);
      }
    }

    // Beauty categorization
    if (defaultCategoryData.name === "لوازم آرایشی و بهداشتی") {
      if (lowerTitle.includes("پوست") || lowerTitle.includes("کرم")) {
        if (!extractedCategories["مراقبت از پوست"])
          extractedCategories["مراقبت از پوست"] = [];
        extractedCategories["مراقبت از پوست"].push(title);
      } else if (lowerTitle.includes("مو") || lowerTitle.includes("شامپو")) {
        if (!extractedCategories["مراقبت از مو"])
          extractedCategories["مراقبت از مو"] = [];
        extractedCategories["مراقبت از مو"].push(title);
      } else if (lowerTitle.includes("عطر") || lowerTitle.includes("ادکلن")) {
        if (!extractedCategories["عطر و بدن"])
          extractedCategories["عطر و بدن"] = [];
        extractedCategories["عطر و بدن"].push(title);
      }
    }

    // Sports categorization
    if (defaultCategoryData.name === "لوازم ورزشی") {
      if (lowerTitle.includes("کفش")) {
        if (!extractedCategories["کفش ورزشی"])
          extractedCategories["کفش ورزشی"] = [];
        extractedCategories["کفش ورزشی"].push(title);
      } else if (lowerTitle.includes("لباس") || lowerTitle.includes("تیشرت")) {
        if (!extractedCategories["لباس ورزشی"])
          extractedCategories["لباس ورزشی"] = [];
        extractedCategories["لباس ورزشی"].push(title);
      } else {
        if (!extractedCategories["لوازم ورزشی"])
          extractedCategories["لوازم ورزشی"] = [];
        extractedCategories["لوازم ورزشی"].push(title);
      }
    }
  }

  return extractedCategories;
}
