import { NextRequest, NextResponse } from "next/server";
import { getJson } from "serpapi";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "test";

    console.log("🔍 Debug API called with query:", query);

    const startTime = Date.now();

    // Test SERPAPI directly
    const serpApiParams = {
      engine: "google_shopping",
      q: query,
      gl: "tr",
      hl: "tr",
      num: 5, // Small number for testing
      device: "desktop",
      api_key: process.env.SERPAPI_KEY,
    };

    console.log("🔍 Testing SERPAPI with params:", serpApiParams);

    let results;
    let error = null;

    try {
      results = await getJson(serpApiParams);
      console.log("✅ SERPAPI test successful");
    } catch (serpError) {
      console.error("❌ SERPAPI test failed:", serpError);
      error =
        serpError instanceof Error
          ? serpError.message
          : "Unknown SERPAPI error";
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    return NextResponse.json({
      success: !error,
      query: query,
      duration_ms: duration,
      error: error,
      results_count: results?.shopping_results?.length || 0,
      has_results: !!results?.shopping_results,
      timestamp: new Date().toISOString(),
      environment: {
        serpapi_configured: !!process.env.SERPAPI_KEY,
        openai_configured: !!process.env.OPENAI_API_KEY,
        mongodb_configured: !!process.env.MONGODB_URI,
      },
    });
  } catch (error) {
    console.error("❌ Debug API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
