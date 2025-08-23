# محصولات زیر ۶ میلیون ریال - راهنمای استفاده

## خلاصه عملکرد

این سیستم محصولات زیر ۶ میلیون ریال را از SerpAPI جستجو کرده، محصولات زنان را فیلتر می‌کند و در دیتابیس `discountproducts` ذخیره می‌کند.

## ویژگی‌های کلیدی

✅ **فیلتر محصولات زنان**: حذف خودکار محصولات حاوی کلمات زنان، کیز، بایان و غیره  
✅ **تبدیل ارز**: تبدیل خودکار قیمت از لیر ترکیه به ریال ایران  
✅ **محدودیت قیمت**: فقط محصولات زیر ۶ میلیون ریال نمایش داده می‌شوند  
✅ **کش هوشمند**: کش ۳۰ دقیقه‌ای در حافظه و ۲۴ ساعته در دیتابیس  
✅ **جستجوی موازی**: استفاده از ۳ کوئری همزمان برای نتایج بهتر

## ساختار فایل‌ها

### 1. API Endpoint

```
src/app/api/shopping/products-under-6m/route.ts
```

### 2. کامپوننت نمایش

```
src/components/shared/product/products-under-6m-grid.tsx
```

### 3. صفحه اصلی

```
src/app/(root)/discounts/page.tsx
```

### 4. مدل دیتابیس

```
src/lib/db/models/discount-product.model.ts
```

## نحوه استفاده

### 1. دسترسی به API

```bash
GET /api/shopping/products-under-6m
GET /api/shopping/products-under-6m?refresh=true
```

### 2. دسترسی به صفحه

```
/discounts
```

### 3. تست API

```
/test-products-under-6m
```

## کوئری‌های جستجو

### پوشاک مردانه

- `erkek giyim indirim`
- `erkek ayakkabı indirim`
- `erkek çanta indirim`
- `erkek aksesuar indirim`

### پوشاک کودکان

- `çocuk giyim indirim`
- `çocuk ayakkabı indirim`
- `çocuk oyuncak indirim`

### الکترونیک

- `telefon aksesuar indirim`
- `bilgisayar aksesuar indirim`
- `kulaklık indirim`

### ورزشی

- `spor malzemeleri indirim`
- `fitness ekipmanları indirim`

## فیلتر محصولات زنان

کلمات کلیدی که باعث حذف محصول می‌شوند:

```typescript
const womenKeywords = [
  "kadın",
  "kız",
  "bayan",
  "kadınlar",
  "kızlar",
  "bayanlar",
  "kadın giyim",
  "kız giyim",
  "bayan giyim",
  "elbise",
  "bluz",
  "etek",
  "tayt",
  "legging",
  "kadın spor",
  "kız spor",
  "bayan spor",
  // ... و موارد دیگر
];
```

## تبدیل ارز

### نرخ تبدیل

- **۱ لیر ترکیه = ۳۰,۰۰۰ تومان** (ثابت)
- **۱ تومان = ۱۰ ریال**

### مثال

- محصول ۱۰۰ لیری = ۳,۰۰۰,۰۰۰ تومان = ۳۰,۰۰۰,۰۰۰ ریال
- محدودیت: حداکثر ۶,۰۰۰,۰۰۰ ریال

## کش و بهینه‌سازی

### کش حافظه

- مدت: ۳۰ دقیقه
- کلید: `products_under_6m_rials`

### کش دیتابیس

- مدت: ۲۴ ساعت
- TTL: `expiresAt` field
- حداکثر: ۴۰ محصول

### بهینه‌سازی

- جستجوی موازی با ۳ کوئری
- فیلتر در سطح API
- حذف محصولات تکراری
- مرتب‌سازی بر اساس قیمت

## پیام‌های خطا

### خطاهای رایج

```typescript
// عدم تنظیم API Key
{
  error: "Search service is not configured";
}

// خطا در جستجو
{
  error: "خطا در جستجوی محصولات زیر ۶ میلیون ریال";
}

// عدم یافتن محصول
{
  message: "هیچ محصولی زیر ۶ میلیون ریال یافت نشد";
}
```

## تنظیمات محیطی

### متغیرهای مورد نیاز

```bash
SERPAPI_KEY=your_serpapi_key_here
```

### اتصال دیتابیس

```typescript
import { connectToDatabase } from "@/lib/db";
await connectToDatabase();
```

## نمونه خروجی

### پاسخ موفق

```json
{
  "products": [
    {
      "id": "product_123",
      "title": "تی‌شرت مردانه",
      "price": 150,
      "currency": "TRY",
      "priceInRial": 4500000,
      "image": "image_url",
      "source": "Google Shopping"
    }
  ],
  "total": 1,
  "message": "۱ محصول زیر ۶ میلیون ریال یافت شد",
  "cached": false,
  "source": "serpapi"
}
```

## عیب‌یابی

### مشکلات رایج

1. **عدم اتصال به SerpAPI**: بررسی API Key
2. **خطای دیتابیس**: بررسی اتصال MongoDB
3. **عدم یافتن محصول**: بررسی کوئری‌های جستجو
4. **مشکل تبدیل ارز**: بررسی تابع `convertTRYToRial`

### لاگ‌های مفید

```typescript
console.log("🔍 Starting products under 6 million Rials fetch...");
console.log(
  `✅ Found ${filteredProducts.length} non-women's products under 6M Rials`
);
console.log(`💾 Stored ${bulkOps.length} products under 6M Rials in DB`);
```

## توسعه و بهبود

### ایده‌های آینده

- اضافه کردن فیلترهای بیشتر (رنگ، سایز، برند)
- بهبود الگوریتم تشخیص محصولات زنان
- اضافه کردن مقایسه قیمت با فروشگاه‌های ایرانی
- سیستم اعلان برای محصولات جدید

### مشارکت

برای بهبود این سیستم، لطفاً:

1. تست کنید و باگ‌ها را گزارش دهید
2. پیشنهادات خود را ارائه دهید
3. کد بهبود یافته را ارسال کنید
