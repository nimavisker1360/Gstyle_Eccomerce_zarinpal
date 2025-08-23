import GoogleShoppingProducts from "@/components/shared/google-shopping-products";

export default function GoogleShoppingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1
            className="text-3xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: "IRANSans, sans-serif" }}
          >
            محصولات گوگل شاپینگ
          </h1>
          <p
            className="text-gray-600"
            style={{ fontFamily: "IRANSans, sans-serif" }}
          >
            محصولات دسته‌بندی شده از Google Shopping با ترجمه فارسی
          </p>
        </div>
      </div>

      <GoogleShoppingProducts />
    </div>
  );
}
