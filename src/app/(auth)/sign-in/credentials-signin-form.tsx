"use client";
import { redirect, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { IUserSignIn } from "@/types";

import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserSignInSchema } from "@/lib/validator";
import { APP_NAME } from "@/lib/constants";

const signInDefaultValues = {
  email: "",
  mobile: "",
  password: "",
};

export default function CredentialsSignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const form = useForm<IUserSignIn>({
    resolver: zodResolver(UserSignInSchema),
    defaultValues: signInDefaultValues,
  });

  const { control, handleSubmit } = form;

  const onSubmit = async (data: IUserSignIn) => {
    try {
      console.log("Attempting sign in with:", data.email);

      // First test credentials using our test API
      const testResponse = await fetch("/api/test-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const testResult = await testResponse.json();
      console.log("Test API result:", testResult);

      if (!testResult.success) {
        toast({
          title: "Error",
          description: testResult.error || "Authentication failed",
          variant: "destructive",
        });
        return;
      }

      if (!testResult.passwordValid) {
        toast({
          title: "Error",
          description: "Invalid password",
          variant: "destructive",
        });
        return;
      }

      // If credentials are valid, attempt NextAuth sign-in
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      console.log("Sign in result:", result);

      if (result?.error) {
        console.log("Sign in failed:", result.error);
        toast({
          title: "Error",
          description: "NextAuth authentication failed",
          variant: "destructive",
        });
      } else {
        console.log("Sign in successful, redirecting...");
        window.location.href = callbackUrl;
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Error",
        description: "Authentication failed",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} dir="rtl">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <div className="space-y-6">
          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-right w-full">ایمیل</FormLabel>
                <FormControl>
                  <Input
                    className="text-right"
                    placeholder="آدرس ایمیل را وارد کنید"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="mobile"
            render={({ field }) => (
              <FormItem className="w-full">
                {/* <FormLabel className="text-right w-full">
                  شماره موبایل (اختیاری)
                </FormLabel> */}
                <FormControl>
                  {/* <Input
                    className="text-right"
                    type="tel"
                    {...field}
                    placeholder="شماره موبایل را وارد کنید "
                  /> */}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="password"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-right w-full">رمز عبور</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    className="text-right"
                    placeholder="رمز عبور را وارد کنید"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <Button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              ورود
            </Button>
          </div>
          {/* <div className="text-sm text-right">
            با انجام ورود، با قوانین {APP_NAME} موافقت می‌کنید:{" "}
            <Link href="/page/conditions-of-use">شرایط استفاده</Link> و{" "}
            <Link href="/page/privacy-policy">قوانین و مقررات</Link>.
          </div> */}
        </div>
      </form>
    </Form>
  );
}
