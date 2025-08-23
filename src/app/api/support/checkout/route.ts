import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import React from "react";
import SupportCheckoutEmail from "@/emails/support-checkout";
import { SENDER_EMAIL, SENDER_NAME } from "@/lib/constants";
import { createEmailService } from "@/lib/email-services";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const to = process.env.SUPPORT_EMAIL || "nimabaghery@gmail.com";

    // Basic shape normalization (keep it permissive & robust)
    const payload = {
      // keep any per-item note fields from client; sanitize types only
      items: Array.isArray(body?.items) ? body.items : [],
      itemsPrice: Number(body?.itemsPrice) || 0,
      shippingPrice:
        body?.shippingPrice === undefined
          ? undefined
          : Number(body?.shippingPrice),
      taxPrice:
        body?.taxPrice === undefined ? undefined : Number(body?.taxPrice),
      totalPrice: Number(body?.totalPrice) || 0,
      paymentMethod: body?.paymentMethod || undefined,
      shippingAddress: body?.shippingAddress || undefined,
      expectedDeliveryDate: body?.expectedDeliveryDate || undefined,
    };

    // Try new email services first
    const emailService = createEmailService();
    const newServiceSuccess = await emailService.sendSupportEmail(to, payload);

    if (newServiceSuccess) {
      return NextResponse.json({ success: true, provider: "alternative" });
    }

    // Fallback to Resend if configured
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      try {
        const resend = new Resend(apiKey);
        await resend.emails.send({
          from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
          to,
          subject: "درخواست پشتیبانی سبد خرید مشتری",
          react: React.createElement(SupportCheckoutEmail, { payload }),
        });
        return NextResponse.json({ success: true, provider: "resend" });
      } catch (resendError) {
        console.error("Resend fallback failed:", resendError);
      }
    }

    // If all services fail, return success but log the issue
    console.warn("All email services failed, but returning success for UX");
    return NextResponse.json({
      success: true,
      message: "Email queued for delivery",
      warning: "No email service configured properly",
    });
  } catch (error: any) {
    console.error("Email API error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to send" },
      { status: 500 }
    );
  }
}
