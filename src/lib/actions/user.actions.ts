"use server";
import { signIn, signOut } from "@/auth";
import { IUserSignIn, IUserSignUp } from "@/types";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/db/models/user.model";
import { formatError } from "../utils";
import { revalidatePath } from "next/cache";

import bcrypt from "bcryptjs";
import { UserSignUpSchema } from "../validator";

export async function signInWithCredentials(user: IUserSignIn) {
  try {
    const result = await signIn("credentials", {
      email: user.email,
      password: user.password,
      redirect: false,
    });

    console.log("NextAuth signIn result:", result);

    if (result?.error) {
      return { error: result.error, status: "error" };
    }

    if (result?.ok) {
      return { success: true, status: "success" };
    }

    return { error: "Authentication failed", status: "error" };
  } catch (error) {
    console.error("SignIn error:", error);
    return { error: "Authentication failed", status: "error" };
  }
}

export async function testUserCredentials(user: IUserSignIn) {
  try {
    await connectToDatabase();
    const dbUser = await User.findOne({ email: user.email });

    if (!dbUser) {
      return { error: "User not found", userExists: false };
    }

    const isPasswordValid = await bcrypt.compare(
      user.password,
      dbUser.password
    );

    return {
      userExists: true,
      passwordValid: isPasswordValid,
      user: {
        id: dbUser._id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
      },
    };
  } catch (error) {
    console.error("Test credentials error:", error);
    return { error: "Database error", userExists: false };
  }
}

export const SignOut = async () => {
  const redirectTo = await signOut({ redirect: false });
  redirect(redirectTo.redirect);
};

export const SignInWithGoogle = async () => {
  await signIn("google");
};
export async function registerUser(userSignUp: IUserSignUp) {
  try {
    const user = await UserSignUpSchema.parseAsync({
      name: userSignUp.name,
      email: userSignUp.email,
      mobile: userSignUp.mobile,
      password: userSignUp.password,
      confirmPassword: userSignUp.confirmPassword,
    });

    await connectToDatabase();
    await User.create({
      ...user,
      password: await bcrypt.hash(user.password, 5),
    });
    return { success: true, message: "User created successfully" };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}

// Fetch minimal profile for account page
export async function getUserProfile(userId: string) {
  try {
    await connectToDatabase();
    const user = await User.findById(userId).select(
      "name email image mobile address.phone"
    );
    if (!user) return null;
    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      image: user.image,
      mobile: user.mobile || "",
      phone: user.address?.phone || "",
    };
  } catch (error) {
    console.error("getUserProfile error", error);
    return null;
  }
}

// Update user's mobile number
export async function updateUserMobile(userId: string, mobile: string) {
  try {
    await connectToDatabase();
    await User.findByIdAndUpdate(userId, { mobile }, { new: true });

    revalidatePath("/(root)/account");
    revalidatePath("/account");
    return { success: true, message: "شماره موبایل با موفقیت به‌روزرسانی شد" };
  } catch (error) {
    console.error("updateUserMobile error", error);
    return { success: false, error: "خطا در به‌روزرسانی شماره موبایل" };
  }
}

// Update user's avatar image; stores as base64 data URL for simplicity
export async function updateUserAvatar(formData: FormData) {
  try {
    const userId = formData.get("userId") as string | null;
    const file = formData.get("avatar") as File | null;

    if (!userId) {
      return { success: false, error: "شناسه کاربر یافت نشد" };
    }
    if (!file || file.size === 0) {
      return { success: false, error: "تصویر نامعتبر است" };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Best-effort mime detection from filename
    const fileName = (file as any).name || "avatar.png";
    const extension = fileName.split(".").pop()?.toLowerCase();
    const mime =
      extension === "jpg" || extension === "jpeg"
        ? "image/jpeg"
        : extension === "png"
          ? "image/png"
          : extension === "webp"
            ? "image/webp"
            : "image/png";

    const base64 = `data:${mime};base64,${buffer.toString("base64")}`;

    await connectToDatabase();
    await User.findByIdAndUpdate(userId, { image: base64 }, { new: true });

    // Revalidate account route so fresh image is shown on the same page
    revalidatePath("/(root)/account");
    revalidatePath("/account");
    return { success: true, image: base64 };
  } catch (error) {
    console.error("updateUserAvatar error", error);
    return { success: false, error: "خطا در ذخیره تصویر" };
  }
}
