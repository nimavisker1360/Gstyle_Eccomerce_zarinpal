import { NextRequest, NextResponse } from "next/server";
import { getJson } from "serpapi";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    console.log(`🔍 Debug search for query: "${query}"`);

    // Check if API keys are available
    if (!process.env.SERPAPI_KEY) {
      console.error("❌ SERPAPI_KEY is not configured");
      return NextResponse.json(
        { error: "Search service is not configured" },
        { status: 500 }
      );
    }

    // Simple search without any enhancement or filtering
    const serpApiParams = {
      engine: "google_shopping",
      q: query,
      gl: "tr", // ترکیه
      hl: "tr", // زبان ترکی
      location: "Turkey",
      num: 20,
      device: "desktop",
      api_key: process.env.SERPAPI_KEY,
    };

    console.log("🔍 Search parameters:", serpApiParams);

    const shoppingResults = await getJson(serpApiParams);

    console.log("🔍 Raw search results:", {
      hasResults: !!shoppingResults.shopping_results,
      resultCount: shoppingResults.shopping_results?.length || 0,
      searchInfo: shoppingResults.search_information,
      error: shoppingResults.error,
    });

    // Process products to match the main API structure
    const processedProducts = (shoppingResults.shopping_results || []).map(
      (product: any) => {
        // Clean and validate text first
        let title = product.title || "";
        let description = product.description || "";

        // Clean text to remove JSON-like structures
        if (title) {
          title = title
            .replace(
              /\{[\s]*"title"[\s]*:[\s]*"[^"]*"[\s]*,[\s]*"description"[\s]*:[\s]*"[^"]*"[\s]*\}/g,
              ""
            )
            .replace(/\{[\s]*"description"[\s]*:[\s]*"[^"]*"[\s]*\}/g, "")
            .replace(/\{[\s]*"title"[\s]*:[\s]*"[^"]*"[\s]*\}/g, "")
            .replace(/"title"[\s]*:[\s]*"[^"]*"/g, "")
            .replace(/"description"[\s]*:[\s]*"[^"]*"/g, "")
            .replace(/title[\s]*:[\s]*"[^"]*"/g, "")
            .replace(/description[\s]*:[\s]*"[^"]*"/g, "")
            .replace(/["'""]/g, "")
            .trim();
        }

        if (description) {
          description = description
            .replace(
              /\{[\s]*"title"[\s]*:[\s]*"[^"]*"[\s]*,[\s]*"description"[\s]*:[\s]*"[^"]*"[\s]*\}/g,
              ""
            )
            .replace(/\{[\s]*"description"[\s]*:[\s]*"[^"]*"[\s]*\}/g, "")
            .replace(/\{[\s]*"title"[\s]*:[\s]*"[^"]*"[\s]*\}/g, "")
            .replace(/"title"[\s]*:[\s]*"[^"]*"/g, "")
            .replace(/"description"[\s]*:[\s]*"[^"]*"/g, "")
            .replace(/title[\s]*:[\s]*"[^"]*"/g, "")
            .replace(/description[\s]*:[\s]*"[^"]*"/g, "")
            .replace(/["'""]/g, "")
            .trim();
        }

        // If description still contains JSON-like content, use title
        if (
          description &&
          (description.includes('"title"') ||
            description.includes('"description"') ||
            description.includes("title:") ||
            description.includes("description:"))
        ) {
          description = title || "توضیحات محصول";
        }

        // If description is empty, use title
        if (!description && title) {
          description = title;
        }

        return {
          id: product.product_id || `product-${Date.now()}-${Math.random()}`,
          title: title,
          originalTitle: product.title || "",
          price:
            parseFloat(
              product.price?.replace(/[^\d.,]/g, "").replace(",", ".")
            ) || 0,
          originalPrice: product.original_price
            ? parseFloat(
                product.original_price.replace(/[^\d.,]/g, "").replace(",", ".")
              )
            : null,
          currency: product.price?.replace(/[\d.,]/g, "").trim() || "TL",
          image: product.thumbnail || "",
          description: description,
          originalDescription: product.description || "",
          link: product.product_link || product.link || null,
          googleShoppingLink: product.link || "",
          source: product.merchant?.name || "Unknown",
          rating: parseFloat(product.rating) || 0,
          reviews: parseInt(product.reviews) || 0,
          delivery: product.delivery || "اطلاعات ارسال موجود نیست",
        };
      }
    );

    // Return processed results
    return NextResponse.json({
      products: processedProducts,
      message: `تعداد نتایج: ${processedProducts.length}`,
      search_query: query,
      raw_results: shoppingResults,
    });
  } catch (error) {
    console.error("❌ Debug search error:", error);
    return NextResponse.json(
      { error: "خطا در جستجو. لطفاً دوباره تلاش کنید." },
      { status: 500 }
    );
  }
}
