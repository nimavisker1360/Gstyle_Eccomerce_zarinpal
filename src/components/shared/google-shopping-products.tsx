"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ExternalLink, Star } from "lucide-react";

interface GoogleShoppingProduct {
  _id: string;
  id: string;
  title: string;
  title_fa: string;
  price: string;
  link: string;
  thumbnail: string;
  source: string;
  category: string;
  createdAt: string;
}

interface CategoryProducts {
  [category: string]: GoogleShoppingProduct[];
}

const categoryLabels: { [key: string]: string } = {
  fashion: "مد و لباس",
  beauty: "آرایشی و بهداشتی",
  electronics: "الکترونیک",
  sports: "ورزشی",
  pets: "حیوانات خانگی",
  vitamins: "ویتامین و مکمل",
  accessories: "لوازم جانبی",
};

export default function GoogleShoppingProducts() {
  const [products, setProducts] = useState<CategoryProducts>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchQueries = useMemo(
    () => ({
      fashion: "women clothing fashion",
      beauty: "cosmetics makeup skincare",
      electronics: "smartphone laptop tablet",
      sports: "sports equipment fitness",
      pets: "pet food pet accessories",
      vitamins: "vitamins supplements health",
      accessories: "jewelry watches bags",
    }),
    []
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const categoryProducts: CategoryProducts = {};

        // Fetch products for each category
        for (const [category, query] of Object.entries(searchQueries)) {
          try {
            const response = await fetch(
              `/api/shopping/google-shopping?category=${category}&query=${encodeURIComponent(query)}`
            );

            if (response.ok) {
              const data = await response.json();
              if (data.products && data.products.length > 0) {
                categoryProducts[category] = data.products;
              }
            }
          } catch (error) {
            console.error(`Error fetching ${category} products:`, error);
          }
        }

        setProducts(categoryProducts);
      } catch (error) {
        setError("خطا در بارگذاری محصولات");
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQueries]);

  const handleAddToCart = (product: GoogleShoppingProduct) => {
    // TODO: Implement add to cart functionality
    console.log("Adding to cart:", product);
  };

  const handleViewProduct = (product: GoogleShoppingProduct) => {
    window.open(product.link, "_blank");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-1/3 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-1/2" />
                  <Skeleton className="h-10 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>تلاش مجدد</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {Object.entries(products).map(([category, categoryProducts]) => (
        <div key={category} className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: "IRANSans, sans-serif" }}
            >
              {categoryLabels[category] || category}
            </h2>
            <Badge variant="secondary" className="text-sm">
              {categoryProducts.length} محصول
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categoryProducts.map((product) => (
              <Card
                key={product._id}
                className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative">
                  <Image
                    src={product.thumbnail}
                    alt={product.title}
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/placeholder.jpg";
                    }}
                  />
                  <Badge className="absolute top-2 right-2 bg-blue-600">
                    {product.source}
                  </Badge>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle
                    className="text-sm font-medium text-black line-clamp-2"
                    style={{ fontFamily: "IRANSans, sans-serif" }}
                  >
                    {product.title_fa}
                  </CardTitle>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {product.title}
                  </p>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-base font-medium text-green-600"
                      style={{ fontFamily: "IRANSans, sans-serif" }}
                    >
                      {product.price}
                    </span>
                    <div className="flex items-center text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-xs ml-1">4.5</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      افزودن
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewProduct(product)}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {Object.keys(products).length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">هیچ محصولی یافت نشد</p>
          <Button onClick={() => window.location.reload()}>
            بارگذاری مجدد
          </Button>
        </div>
      )}
    </div>
  );
}
