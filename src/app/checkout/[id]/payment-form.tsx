"use client";

import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  approvePayPalOrder,
  createPayPalOrder,
} from "@/lib/actions/order.actions";
import { IOrder } from "@/lib/db/models/order.model";
import { formatDateTime } from "@/lib/utils";

import CheckoutFooter from "../checkout-footer";
import { redirect, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ProductPrice from "@/components/shared/product/product-price";
// Stripe removed

export default function OrderPaymentForm({
  order,
  paypalClientId,
  clientSecret,
}: {
  order: IOrder;
  paypalClientId: string;
  isAdmin: boolean;
  clientSecret: string | null;
}) {
  const router = useRouter();
  const {
    shippingAddress,
    items,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod,
    expectedDeliveryDate,
    isPaid,
  } = order;
  const { toast } = useToast();

  if (isPaid) {
    redirect(`/account`);
  }
  function PrintLoadingState() {
    const [{ isPending, isRejected }] = usePayPalScriptReducer();
    let status = "";
    if (isPending) {
      status = "Loading PayPal...";
    } else if (isRejected) {
      status = "Error in loading PayPal.";
    }
    return status;
  }
  const handleCreatePayPalOrder = async () => {
    const res = await createPayPalOrder(order._id);
    if (!res.success)
      return toast({
        description: res.message,
        variant: "destructive",
      });
    return res.data;
  };
  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    const res = await approvePayPalOrder(order._id, data);
    toast({
      description: res.message,
      variant: res.success ? "default" : "destructive",
    });
  };

  const CheckoutSummary = () => (
    <Card>
      <CardContent className="p-4">
        <div>
          <div className="text-xl text-sky-500">خلاصه سفارش</div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sky-500">محصولات:</span>
              <span className="text-emerald-700">
                <ProductPrice price={itemsPrice} plain />
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sky-500">ارسال و دستمزد:</span>
              <span className="text-emerald-700">
                {shippingPrice === undefined ? (
                  "--"
                ) : shippingPrice === 0 ? (
                  "FREE"
                ) : (
                  <ProductPrice price={shippingPrice} plain />
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sky-500"> مالیات:</span>
              <span className="text-emerald-700">
                {taxPrice === undefined ? (
                  "--"
                ) : (
                  <ProductPrice price={taxPrice} plain />
                )}
              </span>
            </div>
            <div className="flex justify-between  pt-1 text-lg text-emerald-700">
              <span> جمع کل سفارش:</span>
              <span className="font-semibold">
                <ProductPrice
                  price={itemsPrice + (shippingPrice ?? 0) + (taxPrice ?? 0)}
                  plain
                />
              </span>
            </div>

            {!isPaid && paymentMethod === "PayPal" && (
              <div>
                <PayPalScriptProvider options={{ clientId: paypalClientId }}>
                  <PrintLoadingState />
                  <PayPalButtons
                    createOrder={handleCreatePayPalOrder}
                    onApprove={handleApprovePayPalOrder}
                  />
                </PayPalScriptProvider>
              </div>
            )}
            {/* Stripe removed */}

            {!isPaid && paymentMethod === "Cash On Delivery" && (
              <Button
                className="w-full rounded-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => router.push(`/account`)}
              >
                Go to account
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
  // Stripe removed
  return (
    <main dir="rtl" className="max-w-6xl mx-auto text-right highlight-link">
      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          {/* Shipping Address */}
          <div>
            <div className="grid md:grid-cols-3 my-3 pb-3">
              <div className="text-lg font-bold text-sky-700">
                <span>آدرس ارسال</span>
              </div>
              <div className="col-span-2">
                <p>
                  {shippingAddress.fullName} <br />
                  {shippingAddress.street} <br />
                  {`${shippingAddress.city}, ${shippingAddress.province}, ${shippingAddress.postalCode}, ${shippingAddress.country}`}
                </p>
              </div>
            </div>
          </div>

          {/* payment method */}
          <div className="border-y">
            <div className="grid md:grid-cols-3 my-3 pb-3">
              <div className="text-lg font-bold text-sky-700">
                <span>روش پرداخت</span>
              </div>
              <div className="col-span-2">
                <p>{paymentMethod}</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 my-3 pb-3">
            <div className="flex text-lg font-bold text-sky-700">
              <span>محصولات و ارسال</span>
            </div>
            <div className="col-span-2">
              <p>
                تاریخ تحویل:
                {formatDateTime(expectedDeliveryDate).dateOnly}
              </p>
              <ul>
                {items.map((item) => (
                  <li key={item.slug}>
                    {item.name} x {item.quantity} = {item.price}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="block md:hidden">
            <CheckoutSummary />
          </div>

          <CheckoutFooter />
        </div>
        <div className="hidden md:block">
          <CheckoutSummary />
        </div>
      </div>
    </main>
  );
}
