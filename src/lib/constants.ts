export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "جی استایل";
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export const SENDER_EMAIL = process.env.SENDER_EMAIL || "info@gstylebot.com";
export const SENDER_NAME = process.env.SENDER_NAME || APP_NAME;
export const APP_SLOGAN =
  process.env.NEXT_PUBLIC_APP_SLOGAN || "کمتر خرج کن، بیشتر لذت ببر";
export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
  "فروشگاه آنلاین با بهترین محصولات و قیمت‌ها";

export const APP_COPYRIGHT =
  process.env.NEXT_PUBLIC_APP_COPYRIGHT ||
  `کلیه حقوق محفوظ است © ۲۰۲۵ ${APP_NAME}`;

export const PAGE_SIZE = Number(process.env.PAGE_SIZE || 109);

export const FREE_SHIPPING_MIN_PRICE = Number(
  process.env.FREE_SHIPPING_MIN_PRICE || 35
);

export const AVAILABLE_PAYMENT_METHODS = [
  {
    name: "پی‌پال",
    commission: 0,
    isDefault: true,
  },
  {
    name: "استرایپ",
    commission: 0,
    isDefault: false,
  },
  {
    name: "پرداخت در محل",
    commission: 0,
    isDefault: false,
  },
];
export const DEFAULT_PAYMENT_METHOD =
  process.env.DEFAULT_PAYMENT_METHOD || "پی‌پال";

export const AVAILABLE_DELIVERY_DATES = [
  {
    name: "فردا",
    daysToDeliver: 1,
    shippingPrice: 12.9,
    freeShippingMinPrice: 0,
  },
  {
    name: "۳ روز آینده",
    daysToDeliver: 3,
    shippingPrice: 6.9,
    freeShippingMinPrice: 0,
  },
  {
    name: "۵ روز آینده",
    daysToDeliver: 5,
    shippingPrice: 4.9,
    freeShippingMinPrice: 35,
  },
];
