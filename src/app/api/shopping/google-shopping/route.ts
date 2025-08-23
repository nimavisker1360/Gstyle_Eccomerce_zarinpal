import { NextRequest, NextResponse } from "next/server";
import { getJson } from "serpapi";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { connectToDatabase } from "@/lib/db";
import GoogleShoppingProduct from "@/lib/db/models/google-shopping-product.model";

// Category mapping for Persian translations
const categoryMapping: { [key: string]: string } = {
  fashion: "مد و لباس",
  beauty: "آرایشی و بهداشتی",
  electronics: "الکترونیک",
  sports: "ورزشی",
  pets: "حیوانات خانگی",
  vitamins: "ویتامین و مکمل",
  accessories: "لوازم جانبی",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const query = searchParams.get("query");

    if (!category || !query) {
      return NextResponse.json(
        { error: "Category and query parameters are required" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Check if products exist in MongoDB for this category and query
    const existingProducts = await GoogleShoppingProduct.find({
      category: category,
      title: { $regex: query, $options: "i" },
    })
      .sort({ createdAt: -1 })
      .limit(20);

    if (existingProducts.length > 0) {
      console.log(
        `Found ${existingProducts.length} existing products for category: ${category}`
      );
      return NextResponse.json({
        products: existingProducts,
        source: "mongodb",
        count: existingProducts.length,
      });
    }

    // If no products found in MongoDB, fetch from SerpApi
    console.log(
      `No existing products found. Fetching from SerpApi for category: ${category}, query: ${query}`
    );

    const serpApiKey = process.env.SERPAPI_KEY;
    if (!serpApiKey) {
      return NextResponse.json(
        { error: "SERPAPI_KEY environment variable is required" },
        { status: 500 }
      );
    }

    // Fetch products from Google Shopping
    const searchResults = await getJson({
      engine: "google_shopping",
      q: query,
      api_key: serpApiKey,
      gl: "tr", // Turkey
      hl: "tr", // Turkish language
      location: "Turkey",
      num: 20,
    });

    if (
      !searchResults.shopping_results ||
      searchResults.shopping_results.length === 0
    ) {
      return NextResponse.json(
        { error: "No products found for the given query" },
        { status: 404 }
      );
    }

    const products = searchResults.shopping_results;
    const translatedProducts = [];

    // Translate product titles to Persian using OpenAI
    for (const product of products) {
      try {
        // Generate Persian translation
        const translationResult = await generateText({
          model: openai("gpt-3.5-turbo"),
          prompt: `Translate the following product title to Persian (Farsi). 
          Return only the Persian translation, nothing else. 
          Make it a coherent sentence of 5-10 words, not word-for-word literal translation.
          
          Product title: "${product.title}"
          
          Persian translation:`,
          maxOutputTokens: 100,
        });

        const title_fa = translationResult.text.trim();

        // Create product object
        const productData = {
          id:
            product.product_id ||
            `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: product.title,
          title_fa: title_fa,
          price: product.price || "قیمت نامشخص",
          link: product.link || product.product_link,
          thumbnail: product.thumbnail || product.image,
          source: product.source || "Google Shopping",
          category: category,
          createdAt: new Date(),
        };

        // Save to MongoDB
        const savedProduct = new GoogleShoppingProduct(productData);
        await savedProduct.save();

        translatedProducts.push(savedProduct);
      } catch (error) {
        console.error("Error translating/saving product:", error);
        // Continue with other products even if one fails
      }
    }

    return NextResponse.json({
      products: translatedProducts,
      source: "serpapi",
      count: translatedProducts.length,
      category: category,
      category_fa: categoryMapping[category] || category,
    });
  } catch (error) {
    console.error("Error in Google Shopping API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
