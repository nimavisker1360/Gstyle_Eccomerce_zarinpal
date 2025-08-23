import mongoose from "mongoose";

const cached = (global as any).mongoose || { conn: null, promise: null };

export const connectToDatabase = async (
  MONGODB_URI = process.env.MONGODB_URI
) => {
  if (cached.conn) {
    // Check if the connection is still alive
    try {
      await cached.conn.db.admin().ping();
      return cached.conn;
    } catch (error) {
      console.log("❌ Cached connection is dead, creating new connection...");
      cached.conn = null;
      cached.promise = null;
    }
  }

  if (!MONGODB_URI) throw new Error("MONGODB_URI is missing");

  try {
    cached.promise =
      cached.promise ||
      mongoose.connect(MONGODB_URI, {
        maxPoolSize: 5, // Reduced pool size
        serverSelectionTimeoutMS: 30000, // Increased timeout
        socketTimeoutMS: 60000, // Increased socket timeout
        bufferCommands: false, // Disable mongoose buffering
        connectTimeoutMS: 30000, // Increased connection timeout
        retryWrites: true,
        retryReads: true,
        w: "majority",
        // Add additional options for better stability
        maxIdleTimeMS: 30000,
        minPoolSize: 1,
        compressors: ["zlib"],
        zlibCompressionLevel: 6,
      });

    cached.conn = await cached.promise;
    console.log("✅ MongoDB connected successfully");
    return cached.conn;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    cached.promise = null;
    throw error;
  }
};
