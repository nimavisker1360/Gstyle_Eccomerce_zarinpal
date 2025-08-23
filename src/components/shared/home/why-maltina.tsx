import { CreditCard, RotateCcw, Truck, ShieldCheck } from "lucide-react";

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function WhyMaltina() {
  const features: FeatureItem[] = [
    {
      icon: <CreditCard className="w-7 h-7 text-white" />,
      title: "دارای درگاه پرداخت زرین پال",
    },
    {
      icon: <RotateCcw className="w-7 h-7 text-white" />,
      title: "پاسخ گویی سریع",
    },
    {
      icon: <Truck className="w-7 h-7 text-white" />,
      title: "حمل رایگان داخل کشور",
    },
    {
      icon: <ShieldCheck className="w-7 h-7 text-white" />,
      title: "تضمین زمان تحویل کالا",
    },
  ];

  return (
    <div className="sm:max-w-7xl sm:mx-auto sm:px-6">
      <div className="rounded-xl bg-white border border-gray-200 shadow-lg">
        <div className="px-4 sm:px-8 py-6">
          <h3
            className="text-center text-lg sm:text-xl font-bold text-green-700 mb-6"
            style={{ fontFamily: "IRANSans, sans-serif" }}
          >
            چرا از جی استایل خرید کنیم؟
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {features.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mb-3 shadow-sm">
                  {item.icon}
                </div>
                <div
                  className="text-sm sm:text-base text-green-700 leading-6"
                  style={{ fontFamily: "IRANSans, sans-serif" }}
                >
                  {item.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
