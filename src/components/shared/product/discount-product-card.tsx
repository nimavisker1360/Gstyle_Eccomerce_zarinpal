"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Star, Plus } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import useCartStore from "@/hooks/use-cart-store";
import {
  generateId,
  round2,
  convertTRYToToman,
  formatToman,
  convertTRYToRial,
  formatRial,
} from "@/lib/utils";

interface ShoppingProduct {
  id: string;
  title: string;
  originalTitle?: string;
  price: number;
  previousPrice?: number | null;
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
  priceInRial?: number; // Add support for Rial price
}

interface DiscountProductCardProps {
  product: ShoppingProduct;
}

const DiscountProductCard = ({ product }: DiscountProductCardProps) => {
  const { toast } = useToast();
  const { addItem } = useCartStore();
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  // Price computations
  const displayedPriceToman = convertTRYToToman(product.price);
  const displayedPriceRial =
    product.priceInRial || convertTRYToRial(product.price);

  const basePrice: number | null =
    typeof product.previousPrice === "number" && product.previousPrice > 0
      ? product.previousPrice
      : typeof product.originalPrice === "number" && product.originalPrice > 0
        ? product.originalPrice
        : null;
  const basePriceToman =
    basePrice !== null ? convertTRYToToman(basePrice) : null;
  const hasDiscount =
    typeof basePrice === "number" && basePrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((basePrice! - product.price) / basePrice!) * 100)
    : 0;

  // Check if product is under 6 million Rials
  const isUnder6MRials = displayedPriceRial <= 6000000;

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    const roundedRating = Math.round(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3 h-3 ${
            i <= roundedRating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      );
    }
    return stars;
  };

  const priceInTRY = product.price;

  const handleAddToCart = () => {
    try {
      const cartItem = {
        clientId: generateId(),
        product: product.id,
        size: "متوسط", // Default size
        color: "مشکی", // Default color
        countInStock: 10, // Default stock
        name: product.title,
        slug: product.id,
        category: "تخفیف‌دار",
        price: round2(priceInTRY),
        quantity: 1,
        image: product.image,
      };

      addItem(cartItem, 1);
      setIsAddedToCart(true);
      toast({
        description: "به سبد خرید اضافه شد",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message,
      });
    }
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200 bg-white">
      <CardContent className="p-4">
        {/* Product Image with Discount Badge and Price Badge */}
        <div className="relative mb-3">
          <div className="relative w-full h-48 bg-gray-50 rounded-lg overflow-hidden">
            <Image
              src={product.image || "/images/placeholder.jpg"}
              alt={product.title}
              fill
              className="object-contain hover:scale-105 transition-transform duration-200"
              sizes="280px"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/images/placeholder.jpg";
              }}
            />
          </div>

          {/* Percent badge on image (top-right) */}
          {hasDiscount && (
            <div className="absolute top-2 right-2 text-red-600 bg-white/90 border border-red-200 px-2 py-0.5 rounded text-xs font-bold shadow-sm">
              %{discountPercent}
            </div>
          )}

          {/* Add to Cart Button */}
          <div className="absolute top-2 right-2">
            <Button
              size="sm"
              className="bg-green-500 hover:bg-green-600 text-white p-2 h-8 w-8 rounded-full"
              onClick={handleAddToCart}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Source/Store Name */}
        <div className="mb-1">
          <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
            {product.source}
          </span>
        </div>

        {/* Product Title */}
        <div className="mb-2">
          <div
            className="text-sm font-medium text-black line-clamp-2 text-right min-h-[2.5rem]"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
            title={product.title}
          >
            {product.title}
          </div>
        </div>

        {/* Rating and Reviews */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            {renderStars(product.rating)}
          </div>
          <span className="text-xs text-gray-500">({product.reviews})</span>
        </div>

        {/* Price column: old (Rial) above, new (Toman) below */}
        <div className="flex flex-col items-end text-right gap-1">
          {hasDiscount && basePriceToman !== null && (
            <span className="text-xs md:text-sm text-gray-500 line-through tabular-nums">
              {formatToman(basePriceToman)}
            </span>
          )}
          <span className="text-sm md:text-base font-medium text-red-600 tabular-nums">
            {formatToman(displayedPriceToman)}
          </span>
          {/* Show Rial price below Toman price */}
          <span className="text-xs text-gray-600 tabular-nums">
            {formatRial(displayedPriceRial)}
          </span>
        </div>

        {/* Action Button - Hide when added to cart */}
        {!isAddedToCart && (
          <div className="mt-3">
            {product.googleShoppingLink ? (
              <Button
                className="w-full text-sm bg-blue-600 hover:bg-blue-700 text-white"
                asChild
              >
                <Link
                  href={product.googleShoppingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  مشاهده در فروشگاه
                </Link>
              </Button>
            ) : (
              <Button className="w-full text-sm" disabled>
                نا موجود
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiscountProductCard;
