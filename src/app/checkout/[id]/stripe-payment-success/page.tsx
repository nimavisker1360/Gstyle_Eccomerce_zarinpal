import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getOrderById } from "@/lib/actions/order.actions";

export default async function SuccessPage(props: {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{ payment_intent?: string }>;
}) {
  const params = await props.params;
  const { id } = params;
  const searchParams = await props.searchParams;

  // Get the order
  const order = await getOrderById(id);
  if (!order) {
    console.log("Order not found:", id);
    notFound();
  }

  // If payment_intent is not provided, check if order is already paid
  if (!searchParams.payment_intent) {
    console.log("No payment_intent provided, checking if order is paid");
    if (order.isPaid) {
      return (
        <div className="max-w-4xl w-full mx-auto space-y-8">
          <div className="flex flex-col gap-6 items-center ">
            <h1 className="font-bold text-2xl lg:text-3xl">
              Thanks for your purchase
            </h1>
            <div>We are now processing your order.</div>
            <Button asChild>
              <Link href={`/account`}>Go to account</Link>
            </Button>
          </div>
        </div>
      );
    } else {
      console.log(
        "Order not paid and no payment_intent, redirecting to checkout"
      );
      return redirect(`/checkout/${id}`);
    }
  }

  // Stripe removed: fallback to order status only
  if (order.isPaid) {
    return (
      <div className="max-w-4xl w-full mx-auto space-y-8">
        <div className="flex flex-col gap-6 items-center ">
          <h1 className="font-bold text-2xl lg:text-3xl">
            Thanks for your purchase
          </h1>
          <div>We are now processing your order.</div>
          <Button asChild>
            <Link href={`/account`}>Go to account</Link>
          </Button>
        </div>
      </div>
    );
  }
  return redirect(`/checkout/${id}`);
}
