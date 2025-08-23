import nodemailer from "nodemailer";
import { convertTRYToToman, formatToman } from "@/lib/utils";

// Email HTML generator utility
function generateEmailHTML(payload: EmailPayload): string {
  const {
    items,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    paymentMethod,
    shippingAddress,
  } = payload;

  const itemsHTML = items
    .map((item) => {
      const lineTotalToman = convertTRYToToman(item.price * item.quantity);
      const unitToman = convertTRYToToman(item.price);
      return `
    <tr style="border-bottom: 1px solid #f1f5f9;">
      <td style="padding: 12px; text-align: right;">
        ${
          item.image
            ? `<img src="${item.image}" alt="${item.name}" style="width: 64px; height: 64px; border-radius: 8px; object-fit: cover;">`
            : "بدون تصویر"
        }
      </td>
      <td style="padding: 12px; text-align: right;">
        <strong>${item.name}</strong><br>
        ${item.color ? `رنگ: ${item.color}` : ""} ${
          item.size ? `| سایز: ${item.size}` : ""
        }<br>
        تعداد: ${item.quantity}
        ${
          (item as any).note
            ? `<div style="margin-top:6px;color:#1e293b;font-size:12px;background:#fff7ed;border:1px solid #fdba74;border-radius:6px;padding:8px"><strong>یادداشت مشتری:</strong> ${String(
                (item as any).note
              ).slice(0, 800)}</div>`
            : ""
        }
      </td>
      <td style="padding: 12px; text-align: left;">
        ${formatToman(lineTotalToman)}<br>
        <span style="color:#64748b; font-size:12px;">(${formatToman(
          unitToman
        )} × ${item.quantity})</span>
      </td>
    </tr>
  `;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&display=swap');
        * { font-family: 'Vazirmatn', sans-serif; }
      </style>
    </head>
    <body style="direction: rtl; text-align: right; background-color: #ffffff; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb; text-align: center; font-size: 24px;">درخواست پشتیبانی سبد خرید</h1>
        
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
          <p><strong>روش پرداخت:</strong> ${paymentMethod || "انتخاب نشده"}</p>
          ${
            shippingAddress
              ? `
            <p><strong>نام مشتری:</strong> ${shippingAddress.fullName || "وارد نشده"}</p>
            <p><strong>تلفن:</strong> ${shippingAddress.phone || "وارد نشده"}</p>
          `
              : ""
          }
        </div>

        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="padding: 12px; text-align: right;">تصویر</th>
              <th style="padding: 12px; text-align: right;">محصول</th>
              <th style="padding: 12px; text-align: left;">قیمت</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <div style="margin-top: 20px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>مجموع محصولات:</span>
            <span>${formatToman(convertTRYToToman(itemsPrice))}</span>
          </div>
          ${
            taxPrice !== undefined
              ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>مالیات:</span>
              <span>${formatToman(convertTRYToToman(taxPrice))}</span>
            </div>
          `
              : ""
          }
          ${
            shippingPrice !== undefined
              ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>هزینه ارسال:</span>
              <span>${
                shippingPrice === 0
                  ? "رایگان"
                  : formatToman(convertTRYToToman(shippingPrice))
              }</span>
            </div>
          `
              : ""
          }
          <div style="display: flex; justify-content: space-between; margin-top: 12px; padding: 12px; background-color: #059669; color: white; border-radius: 8px;">
            <strong>جمع کل سفارش:</strong>
            <strong>${formatToman(convertTRYToToman(totalPrice))}</strong>
          </div>
        </div>

        <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-top: 20px; text-align: center;">
          <strong>توجه:</strong> این درخواست پشتیبانی از طرف مشتری ارسال شده است و نیاز به پیگیری دارد.
        </div>
      </div>
    </body>
    </html>
  `;
}

// Email service interfaces
export interface EmailPayload {
  items: Array<{
    name: string;
    image: string;
    quantity: number;
    price: number;
    color?: string;
    size?: string;
    note?: string;
  }>;
  itemsPrice: number;
  shippingPrice?: number;
  taxPrice?: number;
  totalPrice: number;
  paymentMethod?: string;
  shippingAddress?: {
    fullName?: string;
    phone?: string;
  };
  expectedDeliveryDate?: string | Date | null;
}

export interface EmailService {
  sendSupportEmail(to: string, payload: EmailPayload): Promise<boolean>;
}

// 1. Nodemailer with Gmail SMTP
export class GmailEmailService implements EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER, // your-email@gmail.com
        pass: process.env.GMAIL_APP_PASSWORD, // App password from Google Account
      },
    });
  }

  async sendSupportEmail(to: string, payload: EmailPayload): Promise<boolean> {
    try {
      const htmlContent = generateEmailHTML(payload);

      await this.transporter.sendMail({
        from: `"${process.env.SENDER_NAME || "جی استایل"}" <${process.env.GMAIL_USER}>`,
        to,
        subject: "درخواست پشتیبانی سبد خرید مشتری",
        html: htmlContent,
      });

      console.log("Gmail email sent successfully");
      return true;
    } catch (error) {
      console.error("Gmail email failed:", error);
      return false;
    }
  }
}

// 2. SendGrid API Service
export class SendGridEmailService implements EmailService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY || "";
  }

  async sendSupportEmail(to: string, payload: EmailPayload): Promise<boolean> {
    if (!this.apiKey) {
      console.warn("SendGrid API key not configured");
      return false;
    }

    try {
      const htmlContent = generateEmailHTML(payload);

      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: {
            email: process.env.SENDER_EMAIL || "info@gstylebot.com",
            name: process.env.SENDER_NAME || "جی استایل",
          },
          subject: "درخواست پشتیبانی سبد خرید مشتری",
          content: [{ type: "text/html", value: htmlContent }],
        }),
      });

      if (response.ok) {
        console.log("SendGrid email sent successfully");
        return true;
      } else {
        console.error("SendGrid error:", await response.text());
        return false;
      }
    } catch (error) {
      console.error("SendGrid email failed:", error);
      return false;
    }
  }
}

// 3. Custom SMTP Service (for any SMTP provider)
export class CustomSMTPEmailService implements EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // e.g., 'smtp.example.com'
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendSupportEmail(to: string, payload: EmailPayload): Promise<boolean> {
    try {
      const htmlContent = generateEmailHTML(payload);

      await this.transporter.sendMail({
        from: `"${process.env.SENDER_NAME || "جی استایل"}" <${process.env.SMTP_USER}>`,
        to,
        subject: "درخواست پشتیبانی سبد خرید مشتری",
        html: htmlContent,
      });

      console.log("Custom SMTP email sent successfully");
      return true;
    } catch (error) {
      console.error("Custom SMTP email failed:", error);
      return false;
    }
  }
}

// 4. Multiple Provider Fallback Service
export class FallbackEmailService implements EmailService {
  private services: EmailService[] = [];

  constructor() {
    // Try services in order of preference
    if (process.env.RESEND_API_KEY) {
      // Resend service would be implemented here if needed
    }
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      this.services.push(new GmailEmailService());
    }
    if (process.env.SENDGRID_API_KEY) {
      this.services.push(new SendGridEmailService());
    }
    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD
    ) {
      this.services.push(new CustomSMTPEmailService());
    }
  }

  async sendSupportEmail(to: string, payload: EmailPayload): Promise<boolean> {
    for (const service of this.services) {
      try {
        const success = await service.sendSupportEmail(to, payload);
        if (success) {
          return true;
        }
      } catch (error) {
        console.error("Email service failed, trying next...", error);
        continue;
      }
    }

    console.error("All email services failed");
    return false;
  }
}

// Email service factory
export function createEmailService(): EmailService {
  const emailProvider = process.env.EMAIL_PROVIDER || "fallback";

  switch (emailProvider.toLowerCase()) {
    case "gmail":
      return new GmailEmailService();
    case "sendgrid":
      return new SendGridEmailService();
    case "smtp":
      return new CustomSMTPEmailService();
    case "fallback":
    default:
      return new FallbackEmailService();
  }
}
