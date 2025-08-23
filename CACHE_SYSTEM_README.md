# سیستم کش محصولات

## خلاصه

این سیستم کش هوشمند برای مدیریت محصولات در دیتابیس طراحی شده است که:

- **حداکثر 60 محصول** از هر دسته‌بندی در دیتابیس نگه می‌دارد
- **هر 24 ساعت** محصولات قدیمی را به صورت خودکار پاک می‌کند
- **ساختار نمایش** را تغییر نمی‌دهد
- **عملکرد سریع‌تر** با استفاده از کش دیتابیس

## ویژگی‌ها

### 🔄 کش خودکار

- محصولات در دیتابیس MongoDB ذخیره می‌شوند
- TTL Index برای حذف خودکار بعد از 24 ساعت
- حداقل 30 محصول برای فعال شدن کش

### 📊 مدیریت دسته‌بندی

- **fashion**: مد و پوشاک
- **beauty**: زیبایی و آرایش
- **electronics**: الکترونیک
- **sports**: ورزشی
- **pets**: حیوانات خانگی
- **vitamins**: ویتامین و دارو
- **other**: سایر

### 🗂️ محدودیت‌ها

- حداکثر 60 محصول در هر دسته‌بندی
- حذف خودکار محصولات قدیمی
- حفظ جدیدترین محصولات

## API Endpoints

### 1. جستجوی محصولات

```
GET /api/shopping?q={query}
```

- ابتدا کش دیتابیس را بررسی می‌کند
- اگر محصولات کافی موجود باشد، از کش برمی‌گرداند
- در غیر این صورت، جستجوی جدید انجام می‌دهد

### 2. مدیریت کش

```
GET /api/shopping/cache-manager?action={action}
```

**Actions:**

- `stats`: آمار کش
- `cleanup`: پاک کردن کش قدیمی
- `get-cached&category={category}`: دریافت محصولات کش شده

### 3. Cron Job

```
GET /api/cron/cleanup-cache?secret={secret}
```

- پاک کردن خودکار محصولات قدیمی
- محدود کردن تعداد محصولات در هر دسته

## صفحات مدیریت

### صفحه مدیریت کش

```
/cache-manager
```

- نمایش آمار کش
- کنترل دستی کش
- نظارت بر عملکرد

## نحوه کارکرد

### 1. جستجوی اولیه

```typescript
// بررسی کش دیتابیس
const hasCachedProducts = await GoogleShoppingProduct.hasEnoughCachedProducts(
  queryType,
  30
);

if (hasCachedProducts) {
  // برگرداندن محصولات از کش
  const cachedProducts = await GoogleShoppingProduct.getCachedProducts(
    queryType,
    60
  );
  return formattedProducts;
}
```

### 2. ذخیره محصولات جدید

```typescript
// ذخیره در دیتابیس
const productData = {
  id: product.id,
  title: product.title,
  title_fa: persianTitle,
  price: price.toString(),
  link: storeLink,
  thumbnail: product.thumbnail,
  source: product.source,
  category: queryType,
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 ساعت
};

await new GoogleShoppingProduct(productData).save();
```

### 3. مدیریت محدودیت‌ها

```typescript
// محدود کردن تعداد محصولات
await GoogleShoppingProduct.limitProductsPerCategory(category, 60);
```

## مزایا

### ⚡ سرعت

- کاهش زمان پاسخ‌دهی
- کاهش درخواست‌های API
- کش هوشمند بر اساس دسته‌بندی

### 💾 بهینه‌سازی حافظه

- حداکثر 60 محصول در هر دسته
- حذف خودکار محصولات قدیمی
- مدیریت خودکار فضای دیتابیس

### 🔄 به‌روزرسانی خودکار

- محصولات جدید جایگزین قدیمی‌ها
- حفظ تازگی اطلاعات
- عملکرد مداوم

## تنظیمات

### متغیرهای محیطی

```env
CRON_SECRET=your_secret_key  # برای cron job
```

### تنظیمات TTL

```typescript
// 24 ساعت
expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000);
```

### تنظیمات محدودیت

```typescript
const MAX_PRODUCTS_PER_CATEGORY = 60;
const MIN_PRODUCTS_FOR_CACHE = 30;
```

## نظارت و مدیریت

### آمار کش

```typescript
const stats = await GoogleShoppingProduct.aggregate([
  {
    $group: {
      _id: "$category",
      count: { $sum: 1 },
      oldestProduct: { $min: "$createdAt" },
      newestProduct: { $max: "$createdAt" },
    },
  },
]);
```

### پاک کردن دستی

```typescript
// پاک کردن کش قدیمی
await GoogleShoppingProduct.limitProductsPerCategory(category, 60);
```

## Cron Job Setup

برای تنظیم cron job خودکار:

```bash
# هر ساعت
0 * * * * curl "https://your-domain.com/api/cron/cleanup-cache?secret=your_secret"

# یا هر 6 ساعت
0 */6 * * * curl "https://your-domain.com/api/cron/cleanup-cache?secret=your_secret"
```

## نکات مهم

1. **ساختار نمایش**: هیچ تغییری در UI ایجاد نشده
2. **عملکرد**: سرعت جستجو بهبود یافته
3. **حافظه**: مدیریت خودکار فضای دیتابیس
4. **تازگی**: محصولات هر 24 ساعت به‌روزرسانی می‌شوند
5. **مقیاس‌پذیری**: قابلیت افزایش تعداد دسته‌بندی‌ها

## عیب‌یابی

### مشکل: محصولات کش نمی‌شوند

- بررسی اتصال دیتابیس
- بررسی تعداد محصولات (حداقل 30)
- بررسی دسته‌بندی صحیح

### مشکل: کش پاک نمی‌شود

- بررسی TTL Index
- بررسی cron job
- بررسی دسترسی‌های دیتابیس

### مشکل: عملکرد کند

- بررسی تعداد محصولات در هر دسته
- بررسی ایندکس‌های دیتابیس
- بررسی اتصال شبکه
