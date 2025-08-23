# 📦 ساختار فیلدهای محصول

## 📌 اطلاعات اصلی (Basic Information)

هر محصول در سیستم شامل فیلدهای اصلی زیر است:

### 🔹 فیلدهای اجباری

- **`title`** (نام محصول): نام کامل محصول
- **`price`** (قیمت): قیمت به صورت متنی (مثل "$15.99" یا "₺299.99")
- **`extracted_price`** (قیمت عددی): قیمت به صورت عددی (مثل 15.99)
- **`product_link`** (لینک محصول): لینک مستقیم به صفحه محصول
- **`thumbnail`** (عکس کوچک): تصویر کوچک محصول
- **`source`** (نام فروشگاه): نام فروشگاه یا منبع محصول

### 🔹 فیلدهای اختیاری

- **`currency`** (واحد پول): واحد پول (مثل "TL", "$", "€")
- **`original_price`** (قیمت اصلی): قیمت قبل از تخفیف
- **`description`** (توضیحات): توضیحات کوتاه محصول

---

## ⭐️ اطلاعات اضافی (Additional Information)

### 🔹 اطلاعات امتیازدهی

- **`rating`** (امتیاز): امتیاز محصول (مثل 4.8)
- **`reviews`** (تعداد نظرات): تعداد کل نظرات (مثل 140000)

### 🔹 اطلاعات محصول

- **`snippet`** (توضیح کوتاه): خلاصه کوتاه از ویژگی‌های محصول
- **`brand`** (برند): نام برند محصول

### 🔹 لینک‌های API

- **`serpapi_product_api`** (لینک API): لینک API برای دریافت اطلاعات بیشتر
- **`immersive_product_page_token`** (توکن): توکن برای دسترسی به صفحه محصول

---

## 🏪 فروشگاه‌های پشتیبانی شده

سیستم از فروشگاه‌های زیر پشتیبانی می‌کند:

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

---

## 📊 ساختار داده در کد

### 🔹 نمونه محصول در API

```typescript
{
  id: string;
  title: string; // نام محصول (ترجمه شده)
  originalTitle: string; // نام اصلی محصول
  price: number; // قیمت عددی
  originalPrice: number | null; // قیمت اصلی
  currency: string; // واحد پول
  image: string; // تصویر محصول
  description: string; // توضیحات (ترجمه شده)
  originalDescription: string; // توضیحات اصلی
  link: string | null; // لینک فروشگاه
  googleShoppingLink: string; // لینک گوگل شاپینگ
  source: string; // نام فروشگاه
  rating: number; // امتیاز
  reviews: number; // تعداد نظرات
  delivery: string; // اطلاعات ارسال
}
```

### 🔹 ساختار MongoDB

```typescript
{
  _id: string;
  name: string;                     // نام محصول
  slug: string;                     // اسلاگ URL
  category: string;                 // دسته‌بندی
  images: string[];                 // تصاویر محصول
  brand: string;                    // برند
  description: string;              // توضیحات
  price: number;                    // قیمت فعلی
  listPrice: number;                // قیمت اصلی
  countInStock: number;             // موجودی
  tags: string[];                   // تگ‌ها
  colors: string[];                 // رنگ‌های موجود
  sizes: string[];                  // سایزهای موجود
  avgRating: number;                // میانگین امتیاز
  numReviews: number;               // تعداد نظرات
  ratingDistribution: Array<{rating: number, count: number}>;
  numSales: number;                 // تعداد فروش
  isPublished: boolean;             // وضعیت انتشار
  reviews: ObjectId[];              // نظرات
  createdAt: Date;                  // تاریخ ایجاد
  updatedAt: Date;                  // تاریخ بروزرسانی
}
```

---

## 🔍 جستجو و فیلتر

### 🔹 پارامترهای جستجو

- **`q`**: کوئری جستجو
- **`gl`**: کشور (tr برای ترکیه)
- **`hl`**: زبان (tr برای ترکی)
- **`num`**: تعداد نتایج
- **`device`**: نوع دستگاه

### 🔹 فیلترهای اعمال شده

- حذف لپ‌تاپ و کامپیوتر کامل
- فقط لوازم جانبی
- ترجمه خودکار به فارسی
- بهبود کوئری با AI

---

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

---

## 📝 نکات مهم

1. **ترجمه خودکار**: تمام محصولات به فارسی ترجمه می‌شوند
2. **فیلتر هوشمند**: سیستم فقط لوازم جانبی را نمایش می‌دهد
3. **لینک‌های معتبر**: فقط لینک‌های فروشگاه‌های معتبر پذیرفته می‌شوند
4. **بهبود کوئری**: کوئری‌های جستجو با AI بهبود می‌یابند
5. **پشتیبانی چندزبانه**: پشتیبانی از ترکی، انگلیسی و فارسی
