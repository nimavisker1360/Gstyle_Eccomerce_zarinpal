# جی استایل - فروشگاه آنلاین محصولات ترکیه

این پروژه یک فروشگاه آنلاین برای محصولات ترکیه است که با Next.js و TypeScript ساخته شده است.

## ویژگی‌های اصلی

- 🔍 **جستجوی پیشرفته محصولات**: جستجوی محصولات از فروشگاه‌های آنلاین ترکیه
- 🛒 **سیستم خرید**: پرداخت با پی‌پال و استرایپ
- 📧 **سیستم ایمیل**: ارسال ایمیل‌های تأیید و اطلاع‌رسانی
- 📱 **طراحی ریسپانسیو**: سازگار با تمام دستگاه‌ها
- 🌐 **پشتیبانی از RTL**: مناسب برای زبان فارسی

## نصب و راه‌اندازی

### پیش‌نیازها

- Node.js 18 یا بالاتر
- npm یا yarn

### نصب

```bash
# کلون کردن پروژه
git clone <repository-url>
cd gstyle-eccomerce

# نصب وابستگی‌ها
npm install

# کپی کردن فایل محیط
cp .env.example .env.local
```

### تنظیم متغیرهای محیطی

فایل `.env.local` را ایجاد کنید و متغیرهای زیر را تنظیم کنید:

```env
# API Keys برای جستجوی محصولات
SERPAPI_KEY=your_serpapi_key_here
OPENAI_API_KEY=your_openai_api_key_here

# پایگاه داده
MONGODB_URI=your_mongodb_connection_string

# پرداخت
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_APP_SECRET=your_paypal_app_secret

# ایمیل
RESEND_API_KEY=your_resend_api_key
SENDER_EMAIL=your_sender_email

# تلگرام
TELEGRAM_SUPPORT=@your_telegram_support
```

### راه‌اندازی API Keys

#### 1. SERPAPI (برای جستجوی محصولات)

- به [SerpAPI](https://serpapi.com/) بروید
- حساب کاربری ایجاد کنید
- API key را دریافت کنید
- آن را در `SERPAPI_KEY` قرار دهید

#### 2. OpenAI (برای ترجمه و بهبود جستجو)

- به [OpenAI](https://openai.com/) بروید
- حساب کاربری ایجاد کنید
- API key را دریافت کنید
- آن را در `OPENAI_API_KEY` قرار دهید

### اجرای پروژه

```bash
# اجرای در حالت توسعه
npm run dev

# ساخت برای تولید
npm run build

# اجرای در حالت تولید
npm start
```

## ویژگی‌های جستجو

### بهبودهای اخیر

1. **جستجوی دقیق‌تر**: بهبود الگوریتم جستجو برای یافتن محصولات بیشتر
2. **فیلترینگ هوشمند**: پذیرش لینک‌های بیشتر برای نتایج بهتر
3. **ترجمه خودکار**: ترجمه عنوان و توضیحات محصولات به فارسی
4. **پیام‌های بهتر**: نمایش پیام‌های مناسب برای کاربر

### نحوه استفاده

1. در صفحه اصلی یا صفحه جستجو، محصول مورد نظر خود را جستجو کنید
2. سیستم به طور خودکار کوئری شما را بهبود می‌دهد
3. نتایج جستجو از فروشگاه‌های معتبر ترکیه نمایش داده می‌شود
4. می‌توانید مستقیماً به فروشگاه اصلی محصول بروید

### فروشگاه‌های پشتیبانی شده

- Hepsiburada
- Trendyol
- N11
- Amazon Turkey
- Zara Turkey
- H&M Turkey
- Sephora Turkey
- و بسیاری دیگر...

## ساختار پروژه

```
src/
├── app/                    # صفحات Next.js
│   ├── (home)/            # صفحه اصلی
│   ├── (root)/            # صفحات عمومی
│   └── api/               # API routes
├── components/             # کامپوننت‌های React
│   ├── shared/            # کامپوننت‌های مشترک
│   └── ui/                # کامپوننت‌های UI
├── lib/                   # کتابخانه‌ها و تنظیمات
└── types/                 # تعاریف TypeScript
```

## مشارکت

برای مشارکت در پروژه:

1. پروژه را fork کنید
2. یک branch جدید ایجاد کنید
3. تغییرات خود را commit کنید
4. Pull Request ارسال کنید

## لایسنس

این پروژه تحت لایسنس MIT منتشر شده است.
