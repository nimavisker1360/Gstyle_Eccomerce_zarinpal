# سیستم کش دسته‌بندی‌های محصولات

## خلاصه

این سیستم کش هوشمند برای دسته‌بندی‌های محصولات در منوی dropdown طراحی شده است که:

- **کش 30 دقیقه‌ای** برای دسته‌بندی‌ها در localStorage
- **بارگذاری خودکار** از API در صورت عدم وجود کش
- **فال‌بک به دسته‌بندی‌های پیش‌فرض** در صورت خطا
- **عملکرد سریع‌تر** با استفاده از کش محلی

## دسته‌بندی‌های پشتیبانی شده

### 🎽 مد و پوشاک (Fashion)

- **زنانه**: پیراهن، تاپ و بادی، شلوار جین، شومیز، تی شرت، و...
- **مردانه**: شلوارک، شلوار، پیراهن، تی شرت، پولوشرت، و...
- **بچه گانه**: دختر 1.5 تا 6 سال، پسر 6 تا 14 سال، نوزاد 0 تا 18 ماه

### 💄 لوازم آرایشی و بهداشتی (Beauty)

- **مراقبت از پوست**: محصولات مراقبت از پوست، ست مراقبت پوستی، و...
- **مراقبت از مو**: شامپو، نرم کننده مو، ماسک مو، و...
- **عطر و بدن**: عطر، ادکلن، لوسیون بدن، و...
- **سلامت و تغذیه**: انواع ویتامین ها، مکملهای ورزشی، و...

### 📱 الکترونیک (Electronics)

- **الکترونیک**: ساعت هوشمند، هدفون، لوازم جانبی، گوشی موبایل، لپ تاپ، و...

### 🏃‍♂️ لوازم ورزشی (Sports)

- **کفش ورزشی**: کفش دویدن، کفش پیاده‌روی، کفش بسکتبال، و...
- **لباس ورزشی**: تیشرت ورزشی، شلوار ورزشی، لباس فیتنس، و...
- **لوازم ورزشی**: ساک ورزشی، قمقمه ورزشی، ترموس ورزشی، و...

### 🐕 حیوانات خانگی (Pets)

- **حیوانات خانگی**: غذای سگ و گربه، تشویقی، قلاده، لباس و لوازم جانبی، و...

### 💊 ویتامین و دارو (Vitamins)

- **ویتامین و دارو**: مولتی ویتامین، کلسیم، ویتامین D، ملاتونین، و...

## ویژگی‌های سیستم کش

### 🔄 کش خودکار

- دسته‌بندی‌ها در localStorage ذخیره می‌شوند
- مدت زمان کش: 30 دقیقه
- بررسی خودکار اعتبار کش

### 📊 API Endpoint

```
GET /api/shopping/categories?category={category}
```

**پارامترها:**

- `category`: نام دسته‌بندی (fashion, beauty, electronics, sports, pets, vitamins)
- `type=all`: دریافت تمام دسته‌بندی‌ها

### 🗂️ ساختار پاسخ API

```json
{
  "success": true,
  "category": "fashion",
  "name": "مد و پوشاک",
  "categories": {
    "زنانه": ["پیراهن", "تاپ و بادی", ...],
    "مردانه": ["شلوارک", "شلوار", ...],
    "بچه گانه": ["دختر 1.5 تا 6 سال", ...]
  },
  "message": "Enhanced categories from cached products"
}
```

## کامپوننت‌های به‌روزرسانی شده

### 1. SportsDropdown

- **فایل**: `src/components/shared/header/sports-dropdown.tsx`
- **کش کلید**: `sports_categories_cache`
- **API**: `/api/shopping/categories?category=sports`

### 2. FashionDropdown

- **فایل**: `src/components/shared/header/fashion-dropdown.tsx`
- **کش کلید**: `fashion_categories_cache`
- **API**: `/api/shopping/categories?category=fashion`

### 3. BeautyDropdown

- **فایل**: `src/components/shared/header/beauty-dropdown.tsx`
- **کش کلید**: `beauty_categories_cache`
- **API**: `/api/shopping/categories?category=beauty`

### 4. ElectronicsDropdown

- **فایل**: `src/components/shared/header/electronics-dropdown.tsx`
- **کش کلید**: `electronics_categories_cache`
- **API**: `/api/shopping/categories?category=electronics`

### 5. PetsDropdown

- **فایل**: `src/components/shared/header/pets-dropdown.tsx`
- **کش کلید**: `pets_categories_cache`
- **API**: `/api/shopping/categories?category=pets`

### 6. VitaminDropdown

- **فایل**: `src/components/shared/header/vitamin-dropdown.tsx`
- **کش کلید**: `vitamin_categories_cache`
- **API**: `/api/shopping/categories?category=vitamins`

## عملکرد سیستم

### 1. بارگذاری اولیه

```typescript
// بررسی کش موجود
const cached = localStorage.getItem(CACHE_KEY);
const cacheTimestamp = localStorage.getItem(`${CACHE_KEY}_timestamp`);

if (cached && cacheTimestamp && now - timestamp < CACHE_EXPIRY) {
  // استفاده از کش موجود
  setCategories(JSON.parse(cached));
  return;
}
```

### 2. درخواست API

```typescript
// درخواست از API
const response = await fetch("/api/shopping/categories?category=sports");
const data = await response.json();

// کش کردن نتایج
localStorage.setItem(CACHE_KEY, JSON.stringify(data.categories));
localStorage.setItem(`${CACHE_KEY}_timestamp`, Date.now().toString());
```

### 3. مدیریت خطا

```typescript
// استفاده از دسته‌بندی‌های پیش‌فرض در صورت خطا
catch (error) {
  console.error("❌ Error loading categories:", error);
  setCategories(defaultCategories);
}
```

## مزایای سیستم

### ⚡ عملکرد سریع

- بارگذاری فوری از کش محلی
- کاهش درخواست‌های API
- تجربه کاربری بهتر

### 🔄 به‌روزرسانی خودکار

- کش 30 دقیقه‌ای برای تعادل بین سرعت و به‌روزرسانی
- بارگذاری خودکار از API در صورت انقضای کش

### 🛡️ قابلیت اطمینان

- استفاده از دسته‌بندی‌های پیش‌فرض در صورت خطا
- مدیریت خطاهای شبکه
- عملکرد پایدار

### 📱 سازگاری

- پشتیبانی از تمام دسته‌بندی‌های محصولات
- سازگار با سیستم کش موجود
- یکپارچه با API های موجود

## نکات مهم

1. **کش محلی**: تمام داده‌ها در localStorage مرورگر ذخیره می‌شوند
2. **مدت زمان کش**: 30 دقیقه برای تعادل بین سرعت و به‌روزرسانی
3. **فال‌بک**: در صورت خطا، از دسته‌بندی‌های پیش‌فرض استفاده می‌شود
4. **بهینه‌سازی**: کاهش درخواست‌های API و بهبود عملکرد
5. **قابلیت توسعه**: امکان اضافه کردن دسته‌بندی‌های جدید

## تست و بررسی

### بررسی کش

```javascript
// در کنسول مرورگر
localStorage.getItem("sports_categories_cache");
localStorage.getItem("fashion_categories_cache");
localStorage.getItem("beauty_categories_cache");
```

### پاک کردن کش

```javascript
// پاک کردن تمام کش‌های دسته‌بندی
localStorage.removeItem("sports_categories_cache");
localStorage.removeItem("sports_categories_cache_timestamp");
```

### تست API

```bash
# تست API دسته‌بندی‌ها
curl "http://localhost:3000/api/shopping/categories?category=sports"
curl "http://localhost:3000/api/shopping/categories?type=all"
```
