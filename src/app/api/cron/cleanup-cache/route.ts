import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import GoogleShoppingProduct from "@/lib/db/models/google-shopping-product.model";

// Cron job for automatic cache cleanup
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret if provided
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    console.log("🕐 Starting automatic cache cleanup...");

    // Get all categories
    const categories = await GoogleShoppingProduct.distinct("category");
    let totalDeleted = 0;
    let totalProducts = 0;

    for (const category of categories) {
      const beforeCount = await GoogleShoppingProduct.countDocuments({
        category,
      });
      totalProducts += beforeCount;

      // Limit products per category to 60
      await GoogleShoppingProduct.limitProductsPerCategory(category, 60);

      const afterCount = await GoogleShoppingProduct.countDocuments({
        category,
      });
      const deleted = beforeCount - afterCount;
      totalDeleted += deleted;

      console.log(
        `📊 Category ${category}: ${beforeCount} → ${afterCount} (deleted: ${deleted})`
      );
    }

    // Also clean up expired products (older than 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const expiredCount = await GoogleShoppingProduct.countDocuments({
      createdAt: { $lt: twentyFourHoursAgo },
    });

    if (expiredCount > 0) {
      await GoogleShoppingProduct.deleteMany({
        createdAt: { $lt: twentyFourHoursAgo },
      });
      console.log(`🗑️ Deleted ${expiredCount} expired products`);
      totalDeleted += expiredCount;
    }

    const finalStats = await GoogleShoppingProduct.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    console.log("✅ Cache cleanup completed");

    return NextResponse.json({
      success: true,
      message: "Cache cleanup completed",
      stats: {
        totalDeleted,
        totalProducts,
        categories: finalStats.length,
        categoryStats: finalStats,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Cache cleanup error:", error);
    return NextResponse.json(
      {
        error: "Cache cleanup failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
