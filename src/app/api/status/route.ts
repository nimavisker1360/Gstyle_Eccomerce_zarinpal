import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log("🔍 Status check initiated");

    const status = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: {
        node_env: process.env.NODE_ENV,
        serpapi_configured: !!process.env.SERPAPI_KEY,
        openai_configured: !!process.env.OPENAI_API_KEY,
        mongodb_configured: !!process.env.MONGODB_URI,
        stripe_configured: !!process.env.STRIPE_SECRET_KEY,
        resend_configured: !!process.env.RESEND_API_KEY,
      },
      checks: {
        database: false,
        serpapi: false,
        overall: false,
      },
      errors: [] as string[],
    };

    // Test database connection
    try {
      await connectToDatabase();
      status.checks.database = true;
      console.log("✅ Database connection successful");
    } catch (dbError) {
      console.error("❌ Database connection failed:", dbError);
      status.errors.push(
        `Database: ${dbError instanceof Error ? dbError.message : "Unknown error"}`
      );
    }

    // Test SERPAPI (if configured)
    if (process.env.SERPAPI_KEY) {
      try {
        const { getJson } = await import("serpapi");

        const testParams = {
          engine: "google_shopping",
          q: "test",
          gl: "tr",
          hl: "tr",
          num: 1,
          device: "desktop",
          api_key: process.env.SERPAPI_KEY,
        };

        const results = await getJson(testParams);
        status.checks.serpapi = true;
        console.log("✅ SERPAPI test successful");
      } catch (serpError) {
        console.error("❌ SERPAPI test failed:", serpError);
        status.errors.push(
          `SERPAPI: ${serpError instanceof Error ? serpError.message : "Unknown error"}`
        );
      }
    } else {
      console.log("⚠️ SERPAPI_KEY not configured, skipping test");
    }

    // Overall status
    status.checks.overall =
      status.checks.database &&
      (process.env.SERPAPI_KEY ? status.checks.serpapi : true);

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    return NextResponse.json({
      ...status,
      response_time_ms: responseTime,
      status: status.checks.overall ? "healthy" : "unhealthy",
    });
  } catch (error) {
    console.error("❌ Status check failed:", error);
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        response_time_ms: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
