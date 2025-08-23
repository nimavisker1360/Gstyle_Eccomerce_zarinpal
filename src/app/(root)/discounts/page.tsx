import ProductsUnder6MGrid from "@/components/shared/product/products-under-6m-grid";

export const metadata = {
  title: "محصولات زیر ۶ میلیون تومان | GStyle",
  description:
    "بهترین محصولات با قیمت زیر ۶ میلیون تومان از فروشگاه‌های معتبر ترکیه. شامل پوشاک، الکترونیک، ورزشی و لوازم جانبی.",
  keywords:
    "محصولات ارزان, تخفیف, زیر ۶ میلیون تومان, فروشگاه ترکیه, گوگل شاپینگ",
};

export default function DiscountsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ProductsUnder6MGrid />
    </div>
  );
}
