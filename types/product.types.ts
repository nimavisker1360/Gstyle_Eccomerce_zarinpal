// 📦 Product Field Types for E-commerce Application

// 📌 Basic Product Information
export interface BasicProductInfo {
  /** نام محصول */
  title: string;

  /** قیمت به صورت متنی (مثل "$15.99" یا "₺299.99") */
  price: string;

  /** قیمت عددی (مثل 15.99) */
  extracted_price: number;

  /** لینک مستقیم به صفحه محصول */
  product_link: string;

  /** تصویر کوچک محصول */
  thumbnail: string;

  /** نام فروشگاه یا منبع محصول */
  source: string;
}

// ⭐️ Additional Product Information
export interface AdditionalProductInfo {
  /** امتیاز محصول (مثل 4.8) */
  rating?: number;

  /** تعداد کل نظرات (مثل 140000) */
  reviews?: number;

  /** خلاصه کوتاه از ویژگی‌های محصول */
  snippet?: string;

  /** نام برند محصول */
  brand?: string;

  /** واحد پول (مثل "TL", "$", "€") */
  currency?: string;

  /** قیمت قبل از تخفیف */
  original_price?: string;

  /** توضیحات کوتاه محصول */
  description?: string;
}

// 🔗 API Links
export interface ProductAPILinks {
  /** لینک API برای دریافت اطلاعات بیشتر */
  serpapi_product_api?: string;

  /** توکن برای دسترسی به صفحه محصول */
  immersive_product_page_token?: string;
}

// 🏪 Store Information
export interface StoreInfo {
  /** نام فروشگاه */
  name: string;

  /** لینک فروشگاه */
  link?: string;

  /** URL فروشگاه */
  url?: string;
}

// 📊 Complete Product Structure
export interface Product
  extends BasicProductInfo,
    AdditionalProductInfo,
    ProductAPILinks {
  /** شناسه یکتا محصول */
  id?: string;

  /** نام اصلی محصول (قبل از ترجمه) */
  originalTitle?: string;

  /** قیمت عددی */
  price_numeric?: number;

  /** قیمت اصلی عددی */
  originalPrice_numeric?: number;

  /** تصویر محصول */
  image?: string;

  /** توضیحات اصلی (قبل از ترجمه) */
  originalDescription?: string;

  /** لینک گوگل شاپینگ */
  googleShoppingLink?: string;

  /** اطلاعات ارسال */
  delivery?: string;

  /** اطلاعات فروشگاه */
  merchant?: StoreInfo;

  /** لینک‌های مختلف محصول */
  link?: string;
  source_link?: string;
  offers?: {
    link?: string;
    url?: string;
  };
}

// 🔍 Search Parameters
export interface SearchParams {
  /** کوئری جستجو */
  q: string;

  /** کشور (tr برای ترکیه) */
  gl?: string;

  /** زبان (tr برای ترکی) */
  hl?: string;

  /** تعداد نتایج */
  num?: number;

  /** نوع دستگاه */
  device?: string;
}

// 📋 API Response Structure
export interface SearchResponse {
  /** لیست محصولات */
  products: Product[];

  /** پیام نتیجه */
  message: string;

  /** کوئری جستجو */
  search_query: string;

  /** کوئری بهبود یافته */
  enhanced_query?: string;

  /** نتایج خام */
  raw_results?: any;
}

// 🗄️ MongoDB Product Structure
export interface MongoDBProduct {
  _id: string;
  name: string;
  slug: string;
  category: string;
  images: string[];
  brand: string;
  description: string;
  price: number;
  listPrice: number;
  countInStock: number;
  tags: string[];
  colors: string[];
  sizes: string[];
  avgRating: number;
  numReviews: number;
  ratingDistribution: Array<{
    rating: number;
    count: number;
  }>;
  numSales: number;
  isPublished: boolean;
  reviews: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 🏷️ Product Categories
export type ProductCategory =
  | "accessories"
  | "beauty"
  | "electronics"
  | "fashion"
  | "pets"
  | "sports"
  | "vitamins";

// 💰 Currency Types
export type Currency = "TL" | "$" | "€" | "£" | "¥";

// ⭐ Rating Distribution
export interface RatingDistribution {
  rating: number;
  count: number;
}

// 🔍 Search Engine Types
export type SearchEngine = "google_shopping" | "google" | "bing";

// 📱 Device Types
export type DeviceType = "desktop" | "mobile" | "tablet";

// 🌍 Supported Countries
export type SupportedCountry = "tr" | "us" | "de" | "uk" | "ir";

// 🌐 Supported Languages
export type SupportedLanguage = "tr" | "en" | "fa" | "de";

// 📊 Product Status
export type ProductStatus = "published" | "draft" | "archived";

// 🏪 Supported Store Domains
export const SUPPORTED_STORE_DOMAINS = [
  // Turkish stores
  "hepsiburada.com",
  "trendyol.com",
  "n11.com",
  "gittigidiyor.com",
  "amazon.com.tr",

  // International stores
  "amazon.com",
  "amazon.de",
  "amazon.co.uk",
  "ebay.com",
  "ebay.de",
  "ebay.co.uk",
  "etsy.com",

  // Fashion stores
  "zara.com",
  "hm.com",
  "mango.com",
  "asos.com",
  "pullandbear.com",
  "bershka.com",
  "stradivarius.com",
  "massimodutti.com",
  "oysho.com",

  // Beauty stores
  "sephora.com",
  "sephora.com.tr",
  "douglas.com",
  "douglas.com.tr",
  "flormar.com.tr",
  "goldenrose.com.tr",
  "lorealparis.com.tr",
  "maybelline.com.tr",
  "nyxcosmetics.com.tr",
  "mac.com.tr",
  "benefitcosmetics.com.tr",
  "clinique.com.tr",
  "esteelauder.com.tr",
  "lancome.com.tr",

  // Luxury brands
  "dior.com",
  "chanel.com",
  "ysl.com",
  "gucci.com",
  "prada.com",
  "louisvuitton.com",
  "hermes.com",
  "cartier.com",
  "tiffany.com",
  "swarovski.com",
  "pandora.com",
] as const;

export type SupportedStoreDomain = (typeof SUPPORTED_STORE_DOMAINS)[number];
