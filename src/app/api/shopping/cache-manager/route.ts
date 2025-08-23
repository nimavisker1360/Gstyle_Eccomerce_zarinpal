import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import GoogleShoppingProduct from "@/lib/db/models/google-shopping-product.model";

// Cache management API
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const category = searchParams.get("category");

    if (action === "stats") {
      // Get cache statistics
      const stats = await GoogleShoppingProduct.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
            oldestProduct: { $min: "$createdAt" },
            newestProduct: { $max: "$createdAt" },
          },
        },
        {
          $sort: { count: -1 },
        },
      ]);

      return NextResponse.json({
        success: true,
        stats,
        totalProducts: await GoogleShoppingProduct.countDocuments(),
        categories: stats.map((s) => s._id),
      });
    }

    if (action === "cleanup") {
      // Clean up old products and limit per category
      const categories = await GoogleShoppingProduct.distinct("category");
      let totalDeleted = 0;

      for (const cat of categories) {
        const deleted = await GoogleShoppingProduct.limitProductsPerCategory(
          cat,
          60
        );
        const count = await GoogleShoppingProduct.countDocuments({
          category: cat,
        });
        console.log(`📊 Category ${cat}: ${count} products`);
      }

      return NextResponse.json({
        success: true,
        message: "Cache cleanup completed",
        categories: categories.length,
      });
    }

    if (action === "get-cached" && category) {
      // Get cached products for a specific category
      const products = await GoogleShoppingProduct.getCachedProducts(
        category,
        60
      );

      return NextResponse.json({
        success: true,
        category,
        products: products.map((p) => ({
          id: p.id,
          title: p.title_fa,
          originalTitle: p.title,
          price: parseFloat(p.price),
          image: p.thumbnail,
          link: p.link,
          source: p.source,
          createdAt: p.createdAt,
        })),
        count: products.length,
      });
    }

    return NextResponse.json(
      {
        error: "Invalid action. Use: stats, cleanup, or get-cached",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("❌ Cache manager error:", error);
    return NextResponse.json(
      {
        error: "Cache management failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST method for manual cache operations
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { action, category, products } = body;

    if (action === "save-products" && category && products) {
      // Save new products to cache
      const savedProducts = [];

      for (const product of products) {
        try {
          const productData = {
            id: product.id,
            title: product.originalTitle || product.title,
            title_fa: product.title,
            price: product.price.toString(),
            link: product.link,
            thumbnail: product.image,
            source: product.source || "فروشگاه آنلاین",
            category: category,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          };

          const savedProduct = new GoogleShoppingProduct(productData);
          await savedProduct.save();
          savedProducts.push(savedProduct);
        } catch (error) {
          console.error(`❌ Error saving product ${product.id}:`, error);
        }
      }

      // Limit products per category after saving
      await GoogleShoppingProduct.limitProductsPerCategory(category, 60);

      return NextResponse.json({
        success: true,
        message: `Saved ${savedProducts.length} products to cache`,
        category,
        savedCount: savedProducts.length,
      });
    }

    return NextResponse.json(
      {
        error: "Invalid action or missing parameters",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("❌ Cache manager POST error:", error);
    return NextResponse.json(
      {
        error: "Cache operation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
