# 📦 راهنمای ساختار محصولات

## 🎯 مقدمه

این فایل راهنمای کامل ساختار فیلدهای محصول در سیستم e-commerce شما است. هر محصول شامل اطلاعات اصلی و اضافی است که در ادامه توضیح داده می‌شود.

## 📌 فیلدهای اصلی محصول

### 🔹 فیلدهای اجباری

```typescript
{
  title: "نام محصول",           // نام کامل محصول
  price: "$15.99",             // قیمت به صورت متنی
  extracted_price: 15.99,      // قیمت عددی
  product_link: "https://...", // لینک مستقیم محصول
  thumbnail: "https://...",     // تصویر کوچک
  source: "نام فروشگاه"         // نام فروشگاه
}
```

### 🔹 فیلدهای اختیاری

```typescript
{
  currency: "TL",              // واحد پول
  original_price: "$20.99",    // قیمت قبل از تخفیف
  description: "توضیحات محصول"  // توضیحات کوتاه
}
```

## ⭐️ فیلدهای اضافی

### 🔹 اطلاعات امتیازدهی

```typescript
{
  rating: 4.8,                 // امتیاز محصول
  reviews: 140000              // تعداد نظرات
}
```

### 🔹 اطلاعات محصول

```typescript
{
  snippet: "خلاصه ویژگی‌ها",    // توضیح کوتاه
  brand: "نام برند"            // نام برند
}
```

### 🔹 لینک‌های API

```typescript
{
  serpapi_product_api: "https://...",           // لینک API
  immersive_product_page_token: "token123"      // توکن صفحه
}
```

## 🛠️ نحوه استفاده در کد

### 🔹 Import کردن Types

```typescript
import {
  Product,
  BasicProductInfo,
  AdditionalProductInfo,
  SearchResponse,
  ProductCategory,
} from "@/types";
```

### 🔹 تعریف محصول جدید

```typescript
const newProduct: Product = {
  title: "کیبورد بی‌سیم",
  price: "₺299.99",
  extracted_price: 299.99,
  product_link: "https://hepsiburada.com/...",
  thumbnail: "https://cdn.hepsiburada.com/...",
  source: "Hepsiburada",
  rating: 4.5,
  reviews: 1250,
  brand: "Logitech",
  currency: "TL",
};
```

### 🔹 استفاده در API Response

```typescript
const searchResponse: SearchResponse = {
  products: [newProduct],
  message: "1 محصول یافت شد",
  search_query: "keyboard",
  enhanced_query: "klavye wireless",
};
```

## 🔍 جستجو و فیلتر

### 🔹 پارامترهای جستجو

```typescript
const searchParams: SearchParams = {
  q: "keyboard",
  gl: "tr", // کشور ترکیه
  hl: "tr", // زبان ترکی
  num: 20, // تعداد نتایج
  device: "desktop",
};
```

### 🔹 فیلتر کردن محصولات

```typescript
// فیلتر بر اساس قیمت
const affordableProducts = products.filter((p) => p.extracted_price < 100);

// فیلتر بر اساس امتیاز
const highRatedProducts = products.filter((p) => p.rating && p.rating > 4.5);

// فیلتر بر اساس فروشگاه
const trustedStores = products.filter((p) =>
  SUPPORTED_STORE_DOMAINS.some((domain) => p.product_link.includes(domain))
);
```

## 🏪 فروشگاه‌های پشتیبانی شده

### 🔹 فروشگاه‌های ترکیه

- Hepsiburada.com
- Trendyol.com
- N11.com
- GittiGidiyor.com
- Amazon.com.tr

### 🔹 فروشگاه‌های بین‌المللی

- Amazon.com, Amazon.de, Amazon.co.uk
- eBay.com, eBay.de, eBay.co.uk
- Etsy.com

### 🔹 فروشگاه‌های مد و زیبایی

- Zara.com, H&M.com, Mango.com
- Sephora.com, Douglas.com
- MAC, Benefit, Clinique, و غیره

## 📊 تبدیل داده‌ها

### 🔹 تبدیل از SERP API به Product

```typescript
function convertSerpToProduct(serpProduct: any): Product {
  return {
    title: serpProduct.title,
    price: serpProduct.price,
    extracted_price: parseFloat(serpProduct.price?.replace(/[^\d.,]/g, "")),
    product_link: serpProduct.product_link,
    thumbnail: serpProduct.thumbnail,
    source: serpProduct.source,
    rating: parseFloat(serpProduct.rating),
    reviews: parseInt(serpProduct.reviews),
    brand: serpProduct.brand,
    currency: serpProduct.price?.replace(/[\d.,]/g, "").trim(),
  };
}
```

### 🔹 تبدیل به MongoDB Schema

```typescript
function convertToMongoProduct(product: Product): MongoDBProduct {
  return {
    name: product.title,
    slug: product.title.toLowerCase().replace(/\s+/g, "-"),
    category: "accessories",
    images: [product.thumbnail],
    brand: product.brand || "Unknown",
    description: product.description || "",
    price: product.extracted_price,
    listPrice: product.extracted_price,
    countInStock: 100,
    tags: [],
    colors: [],
    sizes: [],
    avgRating: product.rating || 0,
    numReviews: product.reviews || 0,
    ratingDistribution: [],
    numSales: 0,
    isPublished: true,
    reviews: [],
  };
}
```

## 🌐 API Endpoints

### 🔹 جستجوی لوازم جانبی

```
GET /api/shopping/accessories?q={query}
```

### 🔹 جستجوی دیباگ

```
GET /api/shopping/accessories-debug?q={query}
```

### 🔹 سایر دسته‌بندی‌ها

- `/api/shopping/beauty-intelligent`
- `/api/shopping/electronics-intelligent`
- `/api/shopping/fashion-intelligent`
- `/api/shopping/pets-intelligent`
- `/api/shopping/sports-intelligent`
- `/api/shopping/vitamins-intelligent`

## 📝 نکات مهم

### 🔹 ترجمه خودکار

تمام محصولات به صورت خودکار به فارسی ترجمه می‌شوند:

```typescript
const translatedTitle = await translateToPersian(product.title);
const translatedDescription = await translateToPersian(product.description);
```

### 🔹 فیلتر هوشمند

سیستم فقط لوازم جانبی را نمایش می‌دهد و لپ‌تاپ‌ها و کامپیوترهای کامل را حذف می‌کند.

### 🔹 لینک‌های معتبر

فقط لینک‌های فروشگاه‌های معتبر پذیرفته می‌شوند:

```typescript
function isValidStoreUrl(url: string): boolean {
  return SUPPORTED_STORE_DOMAINS.some((domain) => url.includes(domain));
}
```

### 🔹 بهبود کوئری

کوئری‌های جستجو با AI بهبود می‌یابند:

```typescript
const enhancedQuery = await enhanceSearchQuery(originalQuery);
```

## 🚀 مثال کامل

```typescript
import { Product, SearchResponse } from "@/types";

// جستجوی محصولات
const searchProducts = async (query: string): Promise<SearchResponse> => {
  const response = await fetch(`/api/shopping/accessories?q=${query}`);
  return response.json();
};

// استفاده
const results = await searchProducts("keyboard");
console.log(`یافت شد: ${results.products.length} محصول`);

results.products.forEach((product) => {
  console.log(`${product.title} - ${product.price}`);
});
```

## 📚 منابع بیشتر

- [PRODUCT_FIELDS_DOCUMENTATION.md](./PRODUCT_FIELDS_DOCUMENTATION.md) - مستندات کامل فیلدها
- [types/product.types.ts](./types/product.types.ts) - تعاریف TypeScript
- [src/app/api/shopping/accessories/route.ts](./src/app/api/shopping/accessories/route.ts) - پیاده‌سازی API
