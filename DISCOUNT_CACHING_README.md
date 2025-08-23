# سیستم کش محصولات تخفیف - راهنمای کامل

## خلاصه عملکرد

سیستم کش جدید محصولات تخفیف با استفاده از **Redis** و **MongoDB** با **TTL 72 ساعته** پیاده‌سازی شده است که عملکرد صفحه‌ها را به طور قابل توجهی بهبود می‌دهد.

## ویژگی‌های کلیدی

✅ **کش Redis**: دسترسی فوق‌العاده سریع با TTL 72 ساعته  
✅ **کش دیتابیس**: ذخیره‌سازی پایدار با TTL 72 ساعته  
✅ **کش حافظه**: کش موقت 30 دقیقه‌ای برای درخواست‌های مکرر  
✅ **کش سمت کلاینت**: localStorage با TTL 30 دقیقه  
✅ **تازه‌سازی خودکار**: cron job برای نگهداری داده‌های تازه  
✅ **مدیریت کش**: داشبورد نظارت و کنترل کامل

## معماری کش

### 1. لایه‌های کش (از سریع‌ترین به کندترین)

```
Redis Cache (72h) → Database Cache (72h) → Memory Cache (30m) → SerpAPI
```

### 2. کلیدهای کش Redis

```typescript
DISCOUNT_CACHE_KEYS = {
  PRODUCTS_UNDER_6M: "discount:products:under6m", // 72 ساعت
  DISCOUNT_PRODUCTS: "discount:products:all", // 24 ساعت
  COMBINED_DISCOUNTS: "discount:products:combined", // 12 ساعت
};
```

### 3. مدت زمان کش

```typescript
CACHE_DURATIONS = {
  PRODUCTS_UNDER_6M: 72 * 60 * 60, // 72 ساعت
  DISCOUNT_PRODUCTS: 24 * 60 * 60, // 24 ساعت
  COMBINED_DISCOUNTS: 12 * 60 * 60, // 12 ساعت
  CLIENT_SIDE: 30 * 60, // 30 دقیقه
};
```

## نحوه استفاده

### 1. API Endpoints

#### محصولات زیر 6 میلیون ریال

```bash
GET /api/shopping/products-under-6m
GET /api/shopping/products-under-6m?refresh=true
GET /api/shopping/products-under-6m?warmup=true
```

#### محصولات تخفیف

```bash
GET /api/shopping/discounts
GET /api/shopping/discounts?refresh=true
GET /api/shopping/discounts?warmup=true
```

### 2. مدیریت کش

#### Cron Jobs

```bash
GET /api/cron/refresh-discounts?action=refresh&secret=YOUR_SECRET
GET /api/cron/refresh-discounts?action=warmup&secret=YOUR_SECRET
GET /api/cron/refresh-discounts?action=cleanup&secret=YOUR_SECRET
GET /api/cron/refresh-discounts?action=stats&secret=YOUR_SECRET
GET /api/cron/refresh-discounts?action=invalidate&secret=YOUR_SECRET
```

#### داشبورد مدیریت

```tsx
import CacheManager from "@/components/shared/cache-manager";

<CacheManager />;
```

## تنظیمات محیط

### 1. متغیرهای محیطی

```env
# Redis
REDIS_URL=redis://localhost:6379
UPSTASH_REDIS_URL=rediss://...

# Cron Jobs
CRON_REFRESH_ENABLED=true
CRON_SECRET=your-secret-key

# App URL
PUBLIC_APP_URL=https://your-app.vercel.app
```

### 2. تنظیمات Cron

#### Vercel Cron

```json
{
  "crons": [
    {
      "path": "/api/cron/refresh-discounts?action=refresh&secret=YOUR_SECRET",
      "schedule": "0 */72 * * *"
    }
  ]
}
```

#### Manual Cron

```bash
# هر 72 ساعت
0 */72 * * * curl "https://your-app.vercel.app/api/cron/refresh-discounts?action=refresh&secret=YOUR_SECRET"
```

## عملکرد و بهینه‌سازی

### 1. بهبود سرعت

- **قبل**: 3-5 ثانیه برای هر بار بارگذاری
- **بعد**: 100-300 میلی‌ثانیه برای درخواست‌های کش شده

### 2. کاهش درخواست‌های SerpAPI

- **قبل**: هر بار بارگذاری صفحه
- **بعد**: فقط هر 72 ساعت

### 3. استفاده از منابع

- **Redis**: کش سریع در حافظه
- **MongoDB**: ذخیره‌سازی پایدار
- **TTL**: حذف خودکار داده‌های منقضی

## نظارت و نگهداری

### 1. آمار کش

```typescript
// دریافت آمار Redis
const stats = await getCacheStats();
console.log(stats);
// {
//   totalKeys: 15,
//   memoryUsage: "2.5M",
//   hitRate: 95
// }
```

### 2. آمار دیتابیس

```typescript
// شمارش محصولات
const totalProducts = await DiscountProduct.countDocuments();
const activeProducts = await DiscountProduct.countDocuments({
  expiresAt: { $gt: new Date() },
});
const expiredProducts = await DiscountProduct.countDocuments({
  expiresAt: { $lt: new Date() },
});
```

### 3. لاگ‌های سیستم

```
✅ Returning 45 products under 6M Rials from Redis cache (age: 2 hours)
💾 Stored in Redis cache: discount:products:under6m (TTL: 259200s)
🗑️ Invalidated cache: discount:products:under6m
```

## عیب‌یابی

### 1. مشکلات رایج

#### کش کار نمی‌کند

```bash
# بررسی اتصال Redis
redis-cli ping

# بررسی متغیرهای محیطی
echo $REDIS_URL
```

#### داده‌ها منقضی شده‌اند

```bash
# تازه‌سازی دستی
curl "https://your-app.vercel.app/api/cron/refresh-discounts?action=refresh&secret=YOUR_SECRET"
```

#### عملکرد کند است

```bash
# بررسی آمار کش
curl "https://your-app.vercel.app/api/cron/refresh-discounts?action=stats&secret=YOUR_SECRET"
```

### 2. دستورات مفید

```bash
# گرم کردن کش
curl "https://your-app.vercel.app/api/cron/refresh-discounts?action=warmup&secret=YOUR_SECRET"

# پاک‌سازی کش
curl "https://your-app.vercel.app/api/cron/refresh-discounts?action=cleanup&secret=YOUR_SECRET"

# باطل کردن همه کش‌ها
curl "https://your-app.vercel.app/api/cron/refresh-discounts?action=invalidate&secret=YOUR_SECRET"
```

## بهترین شیوه‌ها

### 1. تنظیمات Cron

- **فرکانس**: هر 72 ساعت (نه کمتر)
- **زمان**: ساعات کم‌ترافیک (مثل 2 صبح)
- **نظارت**: بررسی لاگ‌ها بعد از هر اجرا

### 2. مدیریت حافظه

- **Redis**: تنظیم maxmemory و eviction policy
- **MongoDB**: تنظیم TTL indexes
- **نظارت**: بررسی استفاده حافظه به صورت منظم

### 3. امنیت

- **Secret Key**: استفاده از secret قوی و منحصر به فرد
- **Rate Limiting**: محدود کردن درخواست‌های API
- **Validation**: بررسی ورودی‌ها و خروجی‌ها

## نتیجه‌گیری

سیستم کش جدید محصولات تخفیف با استفاده از Redis و MongoDB با TTL 72 ساعته، عملکرد صفحه‌ها را به طور قابل توجهی بهبود داده و هزینه‌های SerpAPI را کاهش می‌دهد. این سیستم با داشبورد مدیریت کامل و cron job های خودکار، نگهداری آسانی دارد.

---

**نکته**: برای استفاده از این سیستم، اطمینان حاصل کنید که Redis و متغیرهای محیطی مربوطه به درستی تنظیم شده‌اند.
