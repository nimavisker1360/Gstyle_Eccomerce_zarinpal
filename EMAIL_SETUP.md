# راهنمای تنظیم ایمیل

سیستم از چندین سرویس ایمیل پشتیبانی می‌کند. می‌توانید هر کدام را که دوست دارید انتخاب کنید:

## گزینه‌های موجود:

### 1. **Gmail SMTP** (ساده و رایگان)

```env
EMAIL_PROVIDER=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password
```

**مراحل تنظیم Gmail:**

1. به [Google Account Settings](https://myaccount.google.com/) بروید
2. "Security" → "2-Step Verification" را فعال کنید
3. "App passwords" بسازید
4. رمز 16 کاراکتری را در `GMAIL_APP_PASSWORD` قرار دهید

### 2. **SendGrid** (حرفه‌ای)

```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key_here
```

**مراحل تنظیم SendGrid:**

1. در [SendGrid](https://sendgrid.com/) ثبت‌نام کنید
2. API Key بسازید
3. کلید را در `SENDGRID_API_KEY` قرار دهید

### 3. **SMTP دلخواه** (هر سرویسی)

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASSWORD=your-password
```

### 4. **Resend** (قبلی)

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=your_resend_api_key_here
```

### 5. **Fallback** (پیش‌فرض - تمام گزینه‌ها)

```env
EMAIL_PROVIDER=fallback
```

این گزینه همه سرویس‌های موجود را به ترتیب امتحان می‌کند.

## تنظیمات عمومی:

```env
SUPPORT_EMAIL=nimabaghery@gmail.com
SENDER_EMAIL=info@gstylebot.com
SENDER_NAME="جی استایل"
```

## توصیه‌ها:

- **برای تست سریع:** Gmail SMTP
- **برای پروداکشن:** SendGrid یا Resend
- **برای انعطاف:** Fallback mode

## تست سیستم:

```bash
curl -X POST http://localhost:3000/api/support/checkout \
  -H "Content-Type: application/json" \
  -d '{"items":[{"name":"تست","image":"","price":1000,"quantity":1}],"itemsPrice":1000,"totalPrice":1000}'
```
