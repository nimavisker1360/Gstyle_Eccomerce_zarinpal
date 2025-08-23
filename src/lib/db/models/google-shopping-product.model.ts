import { Document, Model, model, models, Schema } from "mongoose";

export interface IGoogleShoppingProduct extends Document {
  id: string;
  title: string;
  title_fa: string; // Persian translation of title
  price: string;
  link: string;
  thumbnail: string;
  source: string;
  category: string;
  createdAt: Date;
  expiresAt: Date; // TTL field for automatic deletion
}

export interface IGoogleShoppingProductModel
  extends Model<IGoogleShoppingProduct> {
  limitProductsPerCategory(
    category: string,
    maxProducts?: number
  ): Promise<void>;
  getCachedProducts(
    category: string,
    limit?: number
  ): Promise<IGoogleShoppingProduct[]>;
  hasEnoughCachedProducts(
    category: string,
    minProducts?: number
  ): Promise<boolean>;
}

const googleShoppingProductSchema = new Schema<IGoogleShoppingProduct>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    title_fa: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      // 3 days TTL by default for long-term cache in MongoDB
      default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for category and createdAt for efficient querying
googleShoppingProductSchema.index({ category: 1, createdAt: -1 });

// Static method to limit products per category
googleShoppingProductSchema.statics.limitProductsPerCategory = async function (
  category: string,
  maxProducts: number = 60
) {
  try {
    const count = await this.countDocuments({ category }).maxTimeMS(10000);

    if (count > maxProducts) {
      // Get the oldest products to delete
      const productsToDelete = await this.find({ category })
        .sort({ createdAt: 1 })
        .limit(count - maxProducts)
        .select("_id")
        .maxTimeMS(10000);

      if (productsToDelete.length > 0) {
        const idsToDelete = productsToDelete.map(
          (p: IGoogleShoppingProduct) => p._id
        );
        await this.deleteMany({ _id: { $in: idsToDelete } }).maxTimeMS(10000);
        console.log(
          `🗑️ Deleted ${productsToDelete.length} old products from category: ${category}`
        );
      }
    }
  } catch (error) {
    console.error(
      `❌ Error in limitProductsPerCategory for ${category}:`,
      error
    );
    // Don't throw error, just log it to prevent API failures
  }
};

// Static method to get cached products for a category
googleShoppingProductSchema.statics.getCachedProducts = async function (
  category: string,
  limit: number = 60
) {
  try {
    return await this.find({ category })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select(
        "id title title_fa price link thumbnail source category createdAt"
      )
      .lean()
      .maxTimeMS(10000);
  } catch (error) {
    console.error(`❌ Error in getCachedProducts for ${category}:`, error);
    return []; // Return empty array instead of throwing
  }
};

// Static method to check if category has enough cached products
googleShoppingProductSchema.statics.hasEnoughCachedProducts = async function (
  category: string,
  minProducts: number = 30
) {
  try {
    const count = await this.countDocuments({ category }).maxTimeMS(10000);
    return count >= minProducts;
  } catch (error) {
    console.error(
      `❌ Error in hasEnoughCachedProducts for ${category}:`,
      error
    );
    return false; // Return false instead of throwing
  }
};

const GoogleShoppingProduct =
  (models.GoogleShoppingProduct as IGoogleShoppingProductModel) ||
  model<IGoogleShoppingProduct, IGoogleShoppingProductModel>(
    "GoogleShoppingProduct",
    googleShoppingProductSchema
  );

export default GoogleShoppingProduct;
