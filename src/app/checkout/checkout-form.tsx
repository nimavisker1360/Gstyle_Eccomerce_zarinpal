"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calculateFutureDate,
  formatDateTime,
  timeUntilMidnight,
} from "@/lib/utils";
import { ShippingAddressSchema } from "@/lib/validator";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import CheckoutFooter from "./checkout-footer";
import { ShippingAddress } from "@/types";
import useIsMounted from "@/hooks/use-is-mounted";
import Link from "next/link";
import useCartStore from "@/hooks/use-cart-store";
import ProductPrice from "@/components/shared/product/product-price";
import {
  APP_NAME,
  AVAILABLE_DELIVERY_DATES,
  AVAILABLE_PAYMENT_METHODS,
  DEFAULT_PAYMENT_METHOD,
} from "@/lib/constants";
import { toast } from "@/hooks/use-toast";
import { createOrder } from "@/lib/actions/order.actions";
import FullscreenLoading from "@/components/shared/fullscreen-loading";
import { ArrowLeft } from "lucide-react";

const shippingAddressDefaultValues = {
  fullName: "",
  street: "",
  city: "",
  postalCode: "",
  province: "",
  phone: "",
  country: "",
};

const CheckoutForm = () => {
  const router = useRouter();

  const {
    cart: {
      items,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      shippingAddress,
      deliveryDateIndex,
      paymentMethod = DEFAULT_PAYMENT_METHOD,
    },
    setShippingAddress,
    setPaymentMethod,
    updateItem,
    removeItem,
    setDeliveryDateIndex,
    clearCart,
  } = useCartStore();
  const isMounted = useIsMounted();
  const [isSendingToSupport, setIsSendingToSupport] = useState(false);

  const shippingAddressForm = useForm<any>({
    resolver: zodResolver(ShippingAddressSchema),
    defaultValues: shippingAddress || shippingAddressDefaultValues,
  });
  const onSubmitShippingAddress: SubmitHandler<ShippingAddress> = async (
    values
  ) => {
    setShippingAddress(values);
    try {
      setIsSendingToSupport(true);
      // Prepare minimal payload for support
      const payload = {
        // include notes as-is so support can read them
        items,
        itemsPrice: effectiveItemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice: computedTotal,
        paymentMethod,
        shippingAddress: values,
        expectedDeliveryDate:
          deliveryDateIndex !== undefined
            ? calculateFutureDate(
                AVAILABLE_DELIVERY_DATES[deliveryDateIndex].daysToDeliver
              )
            : undefined,
      };

      await fetch("/api/support/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      toast({
        description: "اطلاعات شما برای پشتیبانی ارسال شد.",
        variant: "success",
      });

      // Reset the form
      shippingAddressForm.reset();

      // Reset checkout states to go back to first step
      setIsAddressSelected(false);
      setIsPaymentMethodSelected(false);
      setIsDeliveryDateSelected(false);

      // Clear shipping address from cart
      setShippingAddress(shippingAddressDefaultValues);

      // brief delay for UX so the loader is visible
      setTimeout(() => router.push("/"), 400);
    } catch {
      toast({
        description: "ارسال ناموفق بود. دوباره تلاش کنید.",
        variant: "destructive",
      });
    } finally {
      // keep loader until navigation happens; do not turn off immediately
    }
  };

  useEffect(() => {
    if (!isMounted || !shippingAddress || !shippingAddress.fullName) return;
    shippingAddressForm.setValue("fullName", shippingAddress.fullName);
    // street removed
    // Simplified fields per new checkout form
    shippingAddressForm.setValue("phone", shippingAddress.phone);
  }, [items, isMounted, router, shippingAddress, shippingAddressForm]);

  const [isAddressSelected, setIsAddressSelected] = useState<boolean>(false);
  const [isPaymentMethodSelected, setIsPaymentMethodSelected] =
    useState<boolean>(false);
  const [isDeliveryDateSelected, setIsDeliveryDateSelected] =
    useState<boolean>(false);

  const handlePlaceOrder = async () => {
    // TODO: place order
    const res = await createOrder({
      items,
      shippingAddress,
      expectedDeliveryDate: calculateFutureDate(
        AVAILABLE_DELIVERY_DATES[deliveryDateIndex!].daysToDeliver
      ),
      deliveryDateIndex,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    });
    if (!res.success) {
      toast({
        description: res.message,
        variant: "destructive",
      });
    } else {
      toast({
        description: res.message,
        variant: "default",
      });
      clearCart();
      router.push(`/checkout/${res.data?.orderId}`);
    }
  };
  const handleSelectPaymentMethod = () => {
    setIsAddressSelected(true);
    setIsPaymentMethodSelected(true);
  };
  const handleSelectShippingAddress = () => {
    shippingAddressForm.handleSubmit(onSubmitShippingAddress)();
  };
  const effectiveItemsPrice =
    itemsPrice && itemsPrice > 0
      ? itemsPrice
      : items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const computedTotal =
    effectiveItemsPrice + (shippingPrice ?? 0) + (taxPrice ?? 0);
  const CheckoutSummary = () => (
    <Card>
      <CardContent className="p-4">
        {/* Removed initial summary action button */}
        {isAddressSelected && !isPaymentMethodSelected && (
          <div className=" mb-4">
            <Button
              className="rounded-full w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={handleSelectPaymentMethod}
            >
              استفاده از این روش پرداخت
            </Button>

            <p className="text-xs text-center py-2">
              روش پرداخت را انتخاب کنید تا ادامه دهید. هنوز فرصت بررسی و ویرایش
              سفارش خود را قبل از نهایی شدن خواهید داشت.
            </p>
          </div>
        )}
        {isPaymentMethodSelected && isAddressSelected && (
          <div>
            <Button
              onClick={handlePlaceOrder}
              className="rounded-full w-full bg-green-600 hover:bg-green-700 text-white"
            >
              ثبت سفارش
            </Button>
            <p className="text-xs text-center py-2">
              با ثبت سفارش، شما با{" "}
              <Link href="/page/privacy-policy">حریم خصوصی</Link> و
              <Link href="/page/conditions-of-use"> شرایط استفاده</Link>{" "}
              {APP_NAME} موافقت می‌کنید.
            </p>
          </div>
        )}

        <div>
          <div className="text-xl text-sky-500">خلاصه سفارش</div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sky-500">محصولات:</span>
              <span className="text-emerald-700">
                <ProductPrice price={effectiveItemsPrice} plain />
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sky-500">ارسال و دستمزد:</span>
              <span className="text-emerald-700">
                {shippingPrice === undefined ? (
                  "--"
                ) : shippingPrice === 0 ? (
                  "رایگان"
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
            <div className="flex justify-between  pt-4 text-lg text-emerald-700">
              <span> جمع کل سفارش:</span>
              <span className="font-semibold">
                <ProductPrice price={computedTotal} plain />
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <main dir="rtl" className="max-w-6xl mx-auto text-right highlight-link">
      {isSendingToSupport && (
        <FullscreenLoading
          title="در حال ارسال به پشتیبانی..."
          subtitle="لطفاً صبر کنید، به‌زودی به خانه هدایت می‌شوید"
        />
      )}

      {/* Back Button */}
      <div className="mb-4 flex justify-end">
        <Button
          onClick={() => router.back()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0"
        >
          <ArrowLeft className="w-4 h-4" />
          بازگشت
        </Button>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          {/* shipping address */}
          <div>
            {isAddressSelected && shippingAddress ? (
              <div className="grid grid-cols-1 md:grid-cols-12    my-3  pb-3">
                <div className="col-span-5 flex text-lg font-bold ">
                  <span className="w-8">۱ </span>
                  <span>آدرس ارسال</span>
                </div>
                <div className="col-span-5 ">
                  <p>
                    {shippingAddress.fullName} <br />
                    {shippingAddress.phone}
                  </p>
                </div>
                <div className="col-span-2">
                  <Button
                    variant={"outline"}
                    onClick={() => {
                      setIsAddressSelected(false);
                      setIsPaymentMethodSelected(true);
                      setIsDeliveryDateSelected(true);
                    }}
                  >
                    تغییر
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex text-primary text-lg font-bold my-2"></div>
                <Form {...shippingAddressForm}>
                  <form
                    method="post"
                    onSubmit={shippingAddressForm.handleSubmit(
                      onSubmitShippingAddress
                    )}
                    className="space-y-4"
                  >
                    <Card className="md:ml-8 my-4 rounded-none md:rounded-lg">
                      <CardContent className="p-4 space-y-2">
                        <div className="text-center text-xs md:text-sm text-muted-foreground">
                          وارد کردن مشخصات
                        </div>
                        <div className="flex flex-col gap-5 md:flex-row">
                          <FormField
                            control={shippingAddressForm.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>نام کامل</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        {/* Address field removed per request */}
                        {/* Removed city/province/country fields per request */}
                        <div className="flex flex-col gap-5 md:flex-row">
                          {/* Removed postal code as requested */}
                          <FormField
                            control={shippingAddressForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>شماره تلفن</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="  p-4">
                        <Button
                          type="submit"
                          className="w-full rounded-none md:rounded-lg font-bold bg-green-600 hover:bg-green-700 text-white border-0 py-4 text-base md:py-2 md:text-sm"
                        >
                          ارسال به پشتیبانی
                        </Button>
                      </CardFooter>
                    </Card>
                  </form>
                </Form>
              </>
            )}
          </div>
          {/* payment method */}
          <div className="border-y">
            {isPaymentMethodSelected && paymentMethod ? (
              <div className="flex items-center justify-between my-3 pb-3 gap-4">
                <div>
                  <p>{paymentMethod}</p>
                </div>
                <div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsPaymentMethodSelected(false);
                      if (paymentMethod) setIsDeliveryDateSelected(true);
                    }}
                  >
                    تغییر
                  </Button>
                </div>
              </div>
            ) : isAddressSelected ? (
              <>
                {/* removed step 2 heading */}
                <Card className="md:ml-8 my-4 rounded-none md:rounded-lg">
                  <CardContent className="p-4">
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(value) => setPaymentMethod(value)}
                    >
                      {AVAILABLE_PAYMENT_METHODS.map((pm) => (
                        <div key={pm.name} className="flex items-center py-1 ">
                          <RadioGroupItem
                            value={pm.name}
                            id={`payment-${pm.name}`}
                          />
                          <Label
                            className="font-bold pl-2 cursor-pointer"
                            htmlFor={`payment-${pm.name}`}
                          >
                            {pm.name}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                  <CardFooter className="p-4">
                    <Button
                      onClick={handleSelectPaymentMethod}
                      className="rounded-full font-bold"
                    >
                      استفاده از این روش پرداخت
                    </Button>
                  </CardFooter>
                </Card>
              </>
            ) : null}
          </div>
          {/* items and delivery date */}
          <div>
            {isDeliveryDateSelected && deliveryDateIndex != undefined ? (
              <div className="flex items-start justify-between my-3 pb-3 gap-4">
                <div>
                  <p>
                    تاریخ تحویل:{" "}
                    {
                      formatDateTime(
                        calculateFutureDate(
                          AVAILABLE_DELIVERY_DATES[deliveryDateIndex]
                            .daysToDeliver
                        )
                      ).dateOnly
                    }
                  </p>
                  <ul>
                    {items.map((item, _index) => (
                      <li key={_index}>
                        {item.name} x {item.quantity} = {item.price}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Button
                    variant={"outline"}
                    onClick={() => {
                      setIsPaymentMethodSelected(true);
                      setIsDeliveryDateSelected(false);
                    }}
                  >
                    تغییر
                  </Button>
                </div>
              </div>
            ) : isPaymentMethodSelected && isAddressSelected ? (
              <>
                {/* removed step 3 heading */}
                <Card className="md:ml-8 rounded-none md:rounded-lg">
                  <CardContent className="p-4">
                    <p className="mb-2">
                      <span className="text-lg font-bold text-green-700">
                        تحویل در{" "}
                        {
                          formatDateTime(
                            calculateFutureDate(
                              AVAILABLE_DELIVERY_DATES[deliveryDateIndex!]
                                .daysToDeliver
                            )
                          ).dateOnly
                        }
                      </span>{" "}
                      اگر در {timeUntilMidnight().hours} ساعت و{" "}
                      {timeUntilMidnight().minutes} دقیقه آینده سفارش دهید.
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        {items.map((item, _index) => (
                          <div key={_index} className="flex gap-4 py-2">
                            <div className="relative w-16 h-16">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="20vw"
                                style={{
                                  objectFit: "contain",
                                }}
                              />
                            </div>

                            <div className="flex-1">
                              <p className="font-semibold">
                                {item.name}, {item.color}, {item.size}
                              </p>
                              <p className="font-bold">
                                <ProductPrice price={item.price} plain />
                              </p>

                              <Select
                                value={item.quantity.toString()}
                                onValueChange={(value) => {
                                  if (value === "0") removeItem(item);
                                  else updateItem(item, Number(value));
                                }}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue>
                                    تعداد: {item.quantity}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent position="popper">
                                  {Array.from({
                                    length: item.countInStock,
                                  }).map((_, i) => (
                                    <SelectItem key={i + 1} value={`${i + 1}`}>
                                      {i + 1}
                                    </SelectItem>
                                  ))}
                                  <SelectItem key="delete" value="0">
                                    حذف
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div>
                        <div className=" font-bold">
                          <p className="mb-2"> سرعت ارسال را انتخاب کنید:</p>

                          <ul>
                            <RadioGroup
                              value={
                                AVAILABLE_DELIVERY_DATES[deliveryDateIndex!]
                                  .name
                              }
                              onValueChange={(value) =>
                                setDeliveryDateIndex(
                                  AVAILABLE_DELIVERY_DATES.findIndex(
                                    (address) => address.name === value
                                  )!
                                )
                              }
                            >
                              {AVAILABLE_DELIVERY_DATES.map((dd) => (
                                <div key={dd.name} className="flex">
                                  <RadioGroupItem
                                    value={dd.name}
                                    id={`address-${dd.name}`}
                                  />
                                  <Label
                                    className="pl-2 space-y-2 cursor-pointer"
                                    htmlFor={`address-${dd.name}`}
                                  >
                                    <div className="text-green-700 font-semibold">
                                      {
                                        formatDateTime(
                                          calculateFutureDate(dd.daysToDeliver)
                                        ).dateOnly
                                      }
                                    </div>
                                    <div>
                                      {(dd.freeShippingMinPrice > 0 &&
                                      itemsPrice >= dd.freeShippingMinPrice
                                        ? 0
                                        : dd.shippingPrice) === 0 ? (
                                        "ارسال رایگان"
                                      ) : (
                                        <ProductPrice
                                          price={dd.shippingPrice}
                                          plain
                                        />
                                      )}
                                    </div>
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </ul>
                          {/* Order totals breakdown with highlighted total */}
                          <div className="mt-6 border-t pt-4 space-y-2 font-normal">
                            <div className="flex justify-between">
                              <span className="text-sky-500">محصولات:</span>
                              <span className="text-emerald-700">
                                <ProductPrice
                                  price={effectiveItemsPrice}
                                  plain
                                />
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sky-500">مالیات:</span>
                              <span className="text-emerald-700">
                                {taxPrice === undefined ? (
                                  "--"
                                ) : (
                                  <ProductPrice price={taxPrice} plain />
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sky-500">ارسال:</span>
                              <span className="text-emerald-700">
                                {shippingPrice === undefined ? (
                                  "--"
                                ) : shippingPrice === 0 ? (
                                  "رایگان"
                                ) : (
                                  <ProductPrice price={shippingPrice} plain />
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between items-center bg-green-600 text-white rounded-md px-3 py-2 mt-2">
                              <span className="font-bold">جمع کل</span>
                              <span className="font-semibold">
                                <ProductPrice price={computedTotal} plain />
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>
          {isPaymentMethodSelected && isAddressSelected && (
            <div className="mt-6">
              <div className="block md:hidden">
                <CheckoutSummary />
              </div>

              <Card className="hidden md:block ">
                <CardContent className="p-4 flex flex-col md:flex-row justify-between items-center gap-3">
                  <Button onClick={handlePlaceOrder} className="rounded-full">
                    ثبت سفارش
                  </Button>
                  <div className="flex-1">
                    <p className="font-bold text-lg">
                      جمع کل سفارش:{" "}
                      <span className="font-semibold text-emerald-700">
                        <ProductPrice price={computedTotal} plain />
                      </span>
                    </p>
                    <p className="text-xs">
                      {" "}
                      با ثبت سفارش، شما با {APP_NAME}&apos;s{" "}
                      <Link href="/page/privacy-policy">حریم خصوصی</Link> و
                      <Link href="/page/conditions-of-use"> شرایط استفاده</Link>
                      موافقت می‌کنید.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <CheckoutFooter />
        </div>
        <div className="hidden md:block">
          <CheckoutSummary />
        </div>
      </div>
    </main>
  );
};
export default CheckoutForm;
