import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/db/models/user.model";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log("Testing auth for:", email);

    await connectToDatabase();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found",
        userExists: false,
      });
    }

    console.log("User found:", user.email, user.name);

    const isPasswordValid = await bcrypt.compare(password, user.password);

    console.log("Password valid:", isPasswordValid);

    return NextResponse.json({
      success: true,
      userExists: true,
      passwordValid: isPasswordValid,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Test auth error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Database error",
      },
      { status: 500 }
    );
  }
}
