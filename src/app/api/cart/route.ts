import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import Cart from "@/lib/db/models/cart.model";
import { Cart as CartType } from "@/types";
import { calcDeliveryDateAndPrice } from "@/lib/actions/order.actions";

export async function GET() {
  try {
    await connectToDatabase();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: true, data: null });
    }
    const doc = await Cart.findOne({ user: session.user.id });
    return NextResponse.json({ success: true, data: doc });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Failed to load cart" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );

    const body = (await req.json()) as CartType;
    const recomputed = calcDeliveryDateAndPrice({
      items: body.items,
      shippingAddress: body.shippingAddress,
      deliveryDateIndex: body.deliveryDateIndex,
    });

    const payload = {
      user: session.user.id,
      // include any optional per-item fields like note
      items: body.items,
      itemsPrice: recomputed.itemsPrice,
      taxPrice: recomputed.taxPrice,
      shippingPrice: recomputed.shippingPrice,
      totalPrice: recomputed.totalPrice,
      paymentMethod: body.paymentMethod,
      shippingAddress: body.shippingAddress,
      deliveryDateIndex: recomputed.deliveryDateIndex,
      expectedDeliveryDate: undefined,
    };

    const doc = await Cart.findOneAndUpdate(
      { user: session.user.id },
      payload,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return NextResponse.json({ success: true, data: doc });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Failed to save cart" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await connectToDatabase();
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );

    // Clear the user's cart from the server
    await Cart.findOneAndDelete({ user: session.user.id });
    return NextResponse.json({ success: true, message: "Cart cleared" });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Failed to clear cart" },
      { status: 500 }
    );
  }
}
