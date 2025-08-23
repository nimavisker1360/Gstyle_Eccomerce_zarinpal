"use client";
import BrowsingHistoryList from "@/components/shared/browsing-history-list";
import ProductPrice from "@/components/shared/product/product-price";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useCartStore from "@/hooks/use-cart-store";
import { APP_NAME, FREE_SHIPPING_MIN_PRICE } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import React from "react";
import { CardDescription } from "@/components/ui/card";

export default function CartPage() {
  const {
    cart: { items },
    updateItem,
    removeItem,
    updateItemNote,
  } = useCartStore();
  const computedItemsPrice = React.useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items]
  );
  const router = useRouter();
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4  md:gap-4">
        {items.length === 0 ? (
          <Card className="col-span-4 rounded-none bg-gradient-to-l from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-10">
              <div
                dir="rtl"
                className="flex items-center justify-between gap-6"
              >
                <div className="flex-1 text-right">
                  <h2 className="text-2xl md:text-3xl font-bold text-black">
                    سبد خرید شما خالی است
                  </h2>
                  <p className="mt-2 text-xs md:text-sm text-black">
                    هنوز محصولی اضافه نکرده‌اید. برای شروع خرید، به صفحه اصلی
                    بروید.
                  </p>
                  <div className="mt-6 flex justify-end">
                    <Link href="/" className="inline-flex">
                      <Button className="rounded-full bg-green-600 hover:bg-green-700 px-6">
                        ادامه خرید در {APP_NAME}
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="hidden md:flex items-center justify-center w-28 h-28 md:w-32 md:h-32 rounded-full bg-white/80 border border-blue-100 shadow-sm text-green-700">
                  <ShoppingCart className="w-12 h-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="col-span-3">
              <Card className="rounded-none bg-gradient-to-l from-green-50 to-blue-50 border-green-200">
                <CardHeader className="text-3xl pb-0 text-right">
                  سبد خرید
                  <CardDescription className="text-sm text-green-700 text-right">
                    اقلام انتخاب‌شده شما در زیر نمایش داده می‌شود
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 order-cards-alt">
                  <div className="flex justify-end border-b border-green-200 mb-4 text-green-700">
                    قیمت
                  </div>

                  {items.map((item) => (
                    <div
                      key={item.clientId}
                      className="order-item-row flex flex-col md:flex-row justify-between py-4 gap-4"
                    >
                      <Link href={`/product/${item.slug}`}>
                        <div className="relative w-40 h-40">
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
                      </Link>

                      <div className="flex-1 space-y-4 text-right">
                        <Link
                          href={`/product/${item.slug}`}
                          className="text-lg hover:no-underline  "
                        >
                          {item.name}
                        </Link>
                        <div>
                          <p className="text-sm">
                            <span className="font-bold">رنگ: </span>{" "}
                            {item.color}
                          </p>
                          <p className="text-sm">
                            <span className="font-bold">سایز: </span>{" "}
                            {item.size}
                          </p>
                        </div>
                        <div className="flex gap-2 items-center justify-end">
                          <Select
                            value={item.quantity.toString()}
                            onValueChange={(value) =>
                              updateItem(item, Number(value))
                            }
                          >
                            <SelectTrigger className="w-auto">
                              <SelectValue>تعداد: {item.quantity}</SelectValue>
                            </SelectTrigger>
                            <SelectContent position="popper">
                              {Array.from({
                                length: item.countInStock,
                              }).map((_, i) => (
                                <SelectItem key={i + 1} value={`${i + 1}`}>
                                  {i + 1}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant={"outline"}
                            onClick={() => removeItem(item)}
                            className="border-red-200 text-red-700 hover:bg-red-50"
                          >
                            حذف
                          </Button>
                        </div>
                        {/* per-item note to ask questions */}
                        <div className="mt-2">
                          <label className="block text-sm mb-1">
                            توضیحات/سوال شما برای این آیتم
                          </label>
                          <Textarea
                            dir="rtl"
                            className="bg-white"
                            placeholder="اینجا سوال یا توضیح خود را درباره این محصول بنویسید..."
                            value={item.note ?? ""}
                            onChange={(e) =>
                              updateItemNote(item.clientId, e.target.value)
                            }
                          />
                          {/* auto-saved */}
                        </div>
                      </div>
                      <div>
                        <p className="text-right text-blue-700">
                          <span className="font-bold text-lg text-green-700">
                            <ProductPrice
                              price={item.price * item.quantity}
                              plain
                            />
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end text-lg my-2 text-right">
                    جمع کل (
                    {items.reduce((acc, item) => acc + item.quantity, 0)} آیتم):{" "}
                    <span className="font-bold ml-1 text-green-700">
                      <ProductPrice price={computedItemsPrice} plain />
                    </span>{" "}
                  </div>
                  <div className="flex justify-end mt-4">
                    <Link href="/">
                      <Button
                        variant="outline"
                        className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 px-4 py-2 text-sm"
                      >
                        بازگشت به صفحه اصلی
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className="rounded-none bg-gradient-to-l from-blue-50 to-green-50 border-blue-200">
                <CardContent className="py-4 space-y-4 text-right">
                  {computedItemsPrice < FREE_SHIPPING_MIN_PRICE ? (
                    <div className="flex-1">
                      اضافه کنید{" "}
                      <span className="text-green-700">
                        <ProductPrice
                          price={FREE_SHIPPING_MIN_PRICE - computedItemsPrice}
                          plain
                        />
                      </span>{" "}
                      از محصولات واجد شرایط به سفارش خود برای ارسال رایگان
                    </div>
                  ) : null}
                  <div className="text-lg">
                    جمع کل (
                    {items.reduce((acc, item) => acc + item.quantity, 0)} آیتم):{" "}
                    <span className="font-bold text-green-700">
                      <ProductPrice price={computedItemsPrice} plain />
                    </span>{" "}
                  </div>
                  <Button
                    onClick={() => router.push("/checkout")}
                    className="rounded-none w-full bg-green-600 hover:bg-green-700"
                  >
                    ادامه به تسویه حساب
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
      <BrowsingHistoryList className="mt-10" />
    </div>
  );
}
