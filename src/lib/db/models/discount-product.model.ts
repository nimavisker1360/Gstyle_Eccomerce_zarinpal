import { Document, Model, model, models, Schema } from "mongoose";

export interface IDiscountProduct extends Document {
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
  priceInRial?: number; // Price in Iranian Rials
  createdAt: Date;
  expiresAt: Date; // TTL for daily cache
}

export interface IDiscountProductModel extends Model<IDiscountProduct> {}

const discountProductSchema = new Schema<IDiscountProduct>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    originalTitle: { type: String },
    price: { type: Number, required: true },
    previousPrice: { type: Number, default: null },
    originalPrice: { type: Number, default: null },
    currency: { type: String, default: "TRY" },
    image: { type: String, required: true },
    description: { type: String, required: true },
    originalDescription: { type: String },
    link: { type: String },
    googleShoppingLink: { type: String },
    source: { type: String, default: "Google Shopping" },
    rating: { type: Number, default: 4 },
    reviews: { type: Number, default: 100 },
    delivery: { type: String, default: "" },
    priceInRial: { type: Number }, // Price in Iranian Rials
    createdAt: { type: Date, default: Date.now },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true }
);

discountProductSchema.index({ createdAt: -1 });
discountProductSchema.index({ priceInRial: 1 }); // Index for price filtering

const DiscountProduct =
  (models.DiscountProduct as IDiscountProductModel) ||
  model<IDiscountProduct, IDiscountProductModel>(
    "DiscountProduct",
    discountProductSchema
  );

export default DiscountProduct;
