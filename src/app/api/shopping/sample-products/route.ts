import { NextRequest, NextResponse } from "next/server";

// Sample products data for testing without API keys
const sampleProducts = [
  {
    id: "sample_1",
    title: "پیراهن مردانه زارا",
    originalTitle: "Zara Men's Shirt",
    price: 450,
    originalPrice: 600,
    currency: "TRY",
    image: "/images/p11-1.jpg",
    description: "پیراهن مردانه برند زارا با کیفیت بالا و طراحی مدرن",
    originalDescription:
      "High quality men's shirt from Zara with modern design",
    link: "https://www.zara.com.tr/tr/erkek-giyim-pierahnen-l1066.html",
    googleShoppingLink:
      "https://www.google.com/search?tbm=shop&q=zara+men+shirt",
    source: "Zara",
    rating: 4.5,
    reviews: 128,
    delivery: "ارسال رایگان",
    position: 1,
    product_id: "sample_1",
  },
  {
    id: "sample_2",
    title: "کفش ورزشی نایک",
    originalTitle: "Nike Sports Shoes",
    price: 1200,
    originalPrice: 1500,
    currency: "TRY",
    image: "/images/p12-1.jpg",
    description: "کفش ورزشی نایک با تکنولوژی Air Max برای راحتی بیشتر",
    originalDescription:
      "Nike sports shoes with Air Max technology for maximum comfort",
    link: "https://www.nike.com.tr/tr/tr/c/erkek/ayakkabilar-1gdj0znik1",
    googleShoppingLink:
      "https://www.google.com/search?tbm=shop&q=nike+sports+shoes",
    source: "Nike",
    rating: 4.8,
    reviews: 256,
    delivery: "ارسال رایگان",
    position: 2,
    product_id: "sample_2",
  },
  {
    id: "sample_3",
    title: "لپ تاپ اپل مک‌بوک",
    originalTitle: "Apple MacBook Laptop",
    price: 45000,
    originalPrice: 50000,
    currency: "TRY",
    image: "/images/p13-1.jpg",
    description: "لپ تاپ اپل مک‌بوک با پردازنده M2 و صفحه نمایش Retina",
    originalDescription:
      "Apple MacBook laptop with M2 processor and Retina display",
    link: "https://www.apple.com.tr/macbook-air/",
    googleShoppingLink:
      "https://www.google.com/search?tbm=shop&q=apple+macbook",
    source: "Apple",
    rating: 4.9,
    reviews: 512,
    delivery: "ارسال رایگان",
    position: 3,
    product_id: "sample_3",
  },
  {
    id: "sample_4",
    title: "عطر مردانه دیور",
    originalTitle: "Dior Men's Perfume",
    price: 2800,
    originalPrice: 3500,
    currency: "TRY",
    image: "/images/p14-1.jpg",
    description: "عطر مردانه دیور با رایحه گرم و جذاب",
    originalDescription:
      "Dior men's perfume with warm and attractive fragrance",
    link: "https://www.sephora.com.tr/tr/c/erkek-parfumleri",
    googleShoppingLink:
      "https://www.google.com/search?tbm=shop&q=dior+men+perfume",
    source: "Sephora",
    rating: 4.7,
    reviews: 89,
    delivery: "ارسال رایگان",
    position: 4,
    product_id: "sample_4",
  },
  {
    id: "sample_5",
    title: "ساعت هوشمند اپل واچ",
    originalTitle: "Apple Watch Smartwatch",
    price: 8500,
    originalPrice: 10000,
    currency: "TRY",
    image: "/images/p15-1.jpg",
    description: "ساعت هوشمند اپل واچ با قابلیت‌های پیشرفته سلامتی",
    originalDescription: "Apple Watch smartwatch with advanced health features",
    link: "https://www.apple.com.tr/apple-watch/",
    googleShoppingLink: "https://www.google.com/search?tbm=shop&q=apple+watch",
    source: "Apple",
    rating: 4.8,
    reviews: 324,
    delivery: "ارسال رایگان",
    position: 5,
    product_id: "sample_5",
  },
  {
    id: "sample_6",
    title: "کیف دستی لویی ویتون",
    originalTitle: "Louis Vuitton Handbag",
    price: 25000,
    originalPrice: 30000,
    currency: "TRY",
    image: "/images/p16-1.jpg",
    description: "کیف دستی لویی ویتون با طراحی کلاسیک و کیفیت برتر",
    originalDescription:
      "Louis Vuitton handbag with classic design and superior quality",
    link: "https://www.louisvuitton.com/tr-tr/collections/handbags",
    googleShoppingLink:
      "https://www.google.com/search?tbm=shop&q=louis+vuitton+handbag",
    source: "Louis Vuitton",
    rating: 4.9,
    reviews: 156,
    delivery: "ارسال رایگان",
    position: 6,
    product_id: "sample_6",
  },
  {
    id: "sample_7",
    title: "غذای سگ رویال کنین",
    originalTitle: "Royal Canin Dog Food",
    price: 450,
    originalPrice: 550,
    currency: "TRY",
    image: "/images/pets.jpg",
    description: "غذای سگ رویال کنین با مواد مغذی کامل برای سلامت سگ",
    originalDescription:
      "Royal Canin dog food with complete nutrients for dog health",
    link: "https://www.petlebi.com/tr/kopek-mamasi",
    googleShoppingLink:
      "https://www.google.com/search?tbm=shop&q=royal+canin+dog+food",
    source: "Petlebi",
    rating: 4.6,
    reviews: 203,
    delivery: "ارسال رایگان",
    position: 7,
    product_id: "sample_7",
  },
  {
    id: "sample_8",
    title: "مولتی ویتامین سنتروم",
    originalTitle: "Centrum Multivitamin",
    price: 180,
    originalPrice: 220,
    currency: "TRY",
    image: "/images/drugs.jpg",
    description: "مولتی ویتامین سنتروم با ویتامین‌های ضروری برای سلامت بدن",
    originalDescription:
      "Centrum multivitamin with essential vitamins for body health",
    link: "https://www.dermokozmetik.com.tr/tr/vitaminler",
    googleShoppingLink:
      "https://www.google.com/search?tbm=shop&q=centrum+multivitamin",
    source: "Dermokozmetik",
    rating: 4.5,
    reviews: 167,
    delivery: "ارسال رایگان",
    position: 8,
    product_id: "sample_8",
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    console.log(`🔍 Sample search for query: "${query}"`);

    // Filter products based on query (simple keyword matching)
    const filteredProducts = sampleProducts.filter((product) => {
      const searchTerms = query.toLowerCase().split(" ");
      const productText =
        `${product.title} ${product.originalTitle} ${product.description}`.toLowerCase();

      return searchTerms.some((term) => productText.includes(term));
    });

    // If no specific matches, return all products
    const productsToReturn =
      filteredProducts.length > 0 ? filteredProducts : sampleProducts;

    console.log(
      `✅ Found ${productsToReturn.length} sample products for query: "${query}"`
    );

    return NextResponse.json({
      products: productsToReturn,
      total: productsToReturn.length,
      search_query: query,
      message: `${productsToReturn.length} محصول نمونه یافت شد. (برای نتایج واقعی، لطفاً API keys را تنظیم کنید)`,
      cached: false,
      from_database: false,
      api_configured: false,
      sample_data: true,
    });
  } catch (error) {
    console.error("❌ Sample Products API Error:", error);
    return NextResponse.json(
      {
        error: "خطا در جستجوی محصولات نمونه. لطفاً دوباره تلاش کنید.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
