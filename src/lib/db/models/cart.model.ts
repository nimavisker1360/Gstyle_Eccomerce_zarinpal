import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICartItem {
  clientId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
  note?: string;
  product: string; // product id
  countInStock: number;
}

export interface ICartDoc extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  itemsPrice: number;
  taxPrice?: number;
  shippingPrice?: number;
  totalPrice: number;
  paymentMethod?: string;
  shippingAddress?: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  deliveryDateIndex?: number;
  expectedDeliveryDate?: Date;
  updatedAt: Date;
  createdAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    clientId: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    color: { type: String },
    size: { type: String },
    note: { type: String },
    product: { type: String, required: true },
    countInStock: { type: Number, required: true },
  },
  { _id: false }
);

const CartSchema = new Schema<ICartDoc>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      index: true,
    },
    items: { type: [CartItemSchema], default: [] },
    itemsPrice: { type: Number, required: true, default: 0 },
    taxPrice: { type: Number },
    shippingPrice: { type: Number },
    totalPrice: { type: Number, required: true, default: 0 },
    paymentMethod: { type: String },
    shippingAddress: {
      fullName: String,
      address: String,
      city: String,
      postalCode: String,
      country: String,
    },
    deliveryDateIndex: { type: Number },
    expectedDeliveryDate: { type: Date },
  },
  { timestamps: true }
);

const Cart: Model<ICartDoc> =
  mongoose.models.Cart || mongoose.model<ICartDoc>("Cart", CartSchema);

export default Cart;
