"use client";
import { useState } from "react";
import { redirect, useSearchParams } from "next/navigation";

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
import { IUserSignUp } from "@/types";
import {
  registerUser,
  signInWithCredentials,
} from "@/lib/actions/user.actions";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserSignUpSchema } from "@/lib/validator";
import { Separator } from "@/components/ui/separator";
import { APP_NAME } from "@/lib/constants";

const signUpDefaultValues = {
  name: "",
  email: "",
  mobile: "",
  password: "",
  confirmPassword: "",
};

export default function SignUpForm() {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const form = useForm<IUserSignUp>({
    resolver: zodResolver(UserSignUpSchema),
    defaultValues: signUpDefaultValues,
  });

  const { control, handleSubmit } = form;

  const onSubmit = async (data: IUserSignUp) => {
    try {
      const res = await registerUser(data);
      if (!res.success) {
        toast({
          title: "Error",
          description: res.error,
          variant: "destructive",
        });
        return;
      }

      // Automatically sign in the user after successful registration
      const signInResult = await signInWithCredentials({
        email: data.email,
        password: data.password,
      });

      if (signInResult?.error || signInResult?.status === "error") {
        toast({
          title: "Success",
          description: "Account created! Please sign in manually.",
          variant: "default",
        });
        window.location.href = `/sign-in?callbackUrl=${encodeURIComponent(
          callbackUrl
        )}`;
        return;
      }

      // Successfully signed in, redirect to home
      toast({
        title: "Success",
        description: "Account created and signed in successfully!",
        variant: "default",
      });

      redirect(callbackUrl);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
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
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-right w-full">نام</FormLabel>
                <FormControl>
                  <Input
                    className="text-right"
                    placeholder="نام را وارد کنید"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                <FormLabel className="text-right w-full">
                  شماره موبایل
                </FormLabel>
                <FormControl>
                  <Input
                    className="text-right"
                    placeholder="شماره موبایل را وارد کنید"
                    type="tel"
                    maxLength={11}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-gray-500 text-right mt-1">
                  شماره موبایل برای ارتباط بهتر و اطلاع‌رسانی سفارشات ضروری است
                </p>
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
          <FormField
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-right w-full">
                  تایید رمز عبور
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    className="text-right"
                    placeholder="تایید رمز عبور"
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
              disabled={!agreedToTerms}
              aria-disabled={!agreedToTerms}
              className={`w-full flex items-center justify-center gap-2 text-white ${
                agreedToTerms
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-green-500/50 hover:bg-green-500/50 cursor-not-allowed"
              }`}
            >
              ثبت نام
            </Button>
          </div>
          <div className="text-sm text-right">
            با ایجاد حساب کاربری، با قوانین {APP_NAME} موافقت می‌کنید:
            <div
              className="mt-2 flex flex-row-reverse items-center gap-2 justify-end"
              dir="rtl"
            >
              <input
                id="agree-terms"
                type="checkbox"
                className="w-4 h-4 cursor-pointer accent-emerald-600"
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                checked={agreedToTerms}
              />
              <label
                htmlFor="agree-terms"
                className="cursor-pointer select-none text-right"
              >
                <Link
                  href="/page/privacy-policy"
                  className="hover:!no-underline"
                >
                  قوانین و مقررات را قبول دارم{" "}
                </Link>
              </label>
            </div>
          </div>
          <Separator className="mb-4" />
          <div className="text-sm text-right">
            قبلاً حساب دارید؟{" "}
            <Link className="link" href={`/sign-in?callbackUrl=${callbackUrl}`}>
              ورود به حساب
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
}
