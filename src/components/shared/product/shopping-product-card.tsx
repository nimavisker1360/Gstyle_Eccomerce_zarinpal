import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  ExternalLink,
  MessageCircle,
  ShoppingCart,
  Plus,
} from "lucide-react";
import useCartStore from "@/hooks/use-cart-store";
import { convertTRYToToman, formatToman } from "@/lib/utils";
import { OrderItem } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface ShoppingProduct {
  id: string;
  title: string;
  originalTitle?: string;
  price: number;
  originalPrice?: number | null;
  currency: string;
  image: string;
  description: string;
  originalDescription?: string;
  link?: string;
  googleShoppingLink?: string;
  source: string;
  rating: number;
  reviews: number;
  delivery: string;
}

interface ShoppingProductCardProps {
  product: ShoppingProduct;
  telegramSupport?: string;
  isSearchResult?: boolean;
}

export default function ShoppingProductCard({
  product,
  telegramSupport,
  isSearchResult = false,
}: ShoppingProductCardProps) {
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const handleAddToCart = async () => {
    try {
      const orderItem: OrderItem = {
        clientId: `${product.id}-${Date.now()}`, // Unique client ID
        product: product.id,
        name: product.title,
        slug: product.title.toLowerCase().replace(/\s+/g, "-"),
        category: "general", // Default category since shopping products don't have categories
        quantity: 1,
        countInStock: 99, // Default stock since shopping products don't have stock info
        image: product.image,
        price: product.price,
        size: undefined,
        color: undefined,
      };

      await addItem(orderItem, 1);
      toast({
        variant: "success",
        description: "به سبد خرید اضافه شد",
      });
    } catch (error) {
      console.error("خطا در اضافه کردن به سبد خرید:", error);
      // Optional: Show error message to user
    }
  };
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star
            key={i}
            className="w-3 h-3 fill-yellow-400 text-yellow-400 opacity-50"
          />
        );
      } else {
        stars.push(<Star key={i} className="w-3 h-3 text-gray-300" />);
      }
    }
    return stars;
  };

  const formatPriceToman = (price: number, currency: string) => {
    const isTRY =
      (currency || "").toUpperCase() === "TRY" ||
      (currency || "").toUpperCase() === "TL";
    const tryAmount = isTRY ? price : price; // assume TRY for shopping results
    return formatToman(convertTRYToToman(tryAmount));
  };

  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.originalPrice! - product.price) / product.originalPrice!) *
          100
      )
    : 0;

  return (
    <Card
      className={`w-full hover:shadow-lg transition-shadow duration-200 ${
        isSearchResult ? "border-2 border-green-500 shadow-green-100" : ""
      }`}
    >
      <CardContent className="p-3 flex flex-col">
        {/* تصویر محصول */}
        <div className="relative mb-2">
          <div className="relative w-full h-52 bg-gray-50 rounded-lg overflow-hidden">
            <Image
              src={product.image || "/images/placeholder.jpg"}
              alt={product.title}
              fill
              className="object-contain hover:scale-105 transition-transform duration-200"
              sizes="200px"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/images/placeholder.jpg";
              }}
            />
          </div>
          {hasDiscount && (
            <Badge className="absolute top-1 left-1 bg-red-500 text-white text-xs">
              {discountPercentage}% تخفیف
            </Badge>
          )}

          {/* دکمه اضافه به سبد خرید */}
          <button
            onClick={handleAddToCart}
            className="absolute top-1 right-1 w-6 h-6 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors duration-200 shadow-md"
            title="اضافه به سبد خرید"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* نام فروشگاه */}
        <p className="text-xs text-blue-600 mb-1 font-medium">
          {product.source}
        </p>

        {/* عنوان محصول */}
        <h3 className="font-semibold text-xs mb-1 line-clamp-2 h-8">
          {product.title}
        </h3>

        {/* توضیحات */}
        <p className="text-xs text-gray-600 mb-2 line-clamp-2 h-8">
          {product.description}
        </p>

        {/* قیمت */}
        <div className="mb-2">
          <span className="text-base font-bold text-green-700 block">
            {formatPriceToman(product.price, product.currency)}
          </span>
        </div>

        {/* دکمه خرید */}
        <div>
          {product.link ? (
            <Button
              asChild
              className="w-full bg-green-600 hover:bg-green-700 text-white mb-1 h-8"
              size="sm"
            >
              <Link
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 text-xs"
              >
                <ShoppingCart className="w-3 h-3" />
                خرید از {product.source}
              </Link>
            </Button>
          ) : (
            <Button
              className="w-full bg-gray-500 text-white mb-1 h-8"
              size="sm"
              disabled
            >
              <span className="flex items-center justify-center text-xs">
                ناموجود
              </span>
            </Button>
          )}

          {/* دکمه‌های ثانویه */}
          <div className="grid grid-cols-2 gap-1">
            {/* دکمه مقایسه قیمت */}
            {product.googleShoppingLink && (
              <Button
                asChild
                variant="outline"
                className="w-full h-7"
                size="sm"
              >
                <Link
                  href={product.googleShoppingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center text-xs"
                >
                  مقایسه قیمت
                </Link>
              </Button>
            )}

            {/* دکمه پشتیبانی */}
            {telegramSupport && (
              <Button
                asChild
                variant="secondary"
                className={`w-full h-7 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 ${
                  product.googleShoppingLink ? "" : "col-span-2"
                }`}
                size="sm"
              >
                <Link
                  href={`https://t.me/${telegramSupport.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center text-xs"
                >
                  پشتیبانی
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
