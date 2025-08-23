import { HomeBanner } from "@/components/shared/home/home-banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ShoppingProductsGrid from "@/components/shared/product/shopping-products-grid";
import LatestDiscountsSlider from "@/components/shared/product/latest-discounts-slider";
import WhyMaltina from "@/components/shared/home/why-maltina";
import CategoriesGrid from "@/components/shared/product/categories-grid";
import WeeklyTrends from "@/components/shared/product/weekly-trends";
import BrandsShowcase from "@/components/shared/product/brands-showcase";

export default async function HomePage() {
  const telegramSupport = process.env.TELEGRAM_SUPPORT || "@gstyle_support";

  return (
    <>
      <div className="pt-8">
        <HomeBanner />
      </div>

      {/* Why Maltina Section - directly under banners */}
      <div className="px-4 sm:px-0 pt-6 pb-4">
        <WhyMaltina />
      </div>

      {/* Latest Discounts Section - Now fetches from Google Shopping */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8">
        <LatestDiscountsSlider />
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8">
        <CategoriesGrid />
      </div>

      {/* Separator */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="border-t border-gray-200"></div>
      </div>

      {/* Weekly Trends Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <WeeklyTrends />
      </div>

      {/* Brands Showcase Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <BrandsShowcase />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="md:p-4 md:space-y-4 bg-border">
          {/* <Card className="w-full rounded-none">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-center">
                کاوش محصولات از ترکیه
              </CardTitle>
              <p className="text-sm text-gray-600 text-center">
                جستجو و خرید محصولات اصل از فروشگاه‌های معتبر ترکیه
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <ShoppingProductsGrid telegramSupport={telegramSupport} />
            </CardContent>
          </Card> */}
        </div>
      </div>
    </>
  );
}
