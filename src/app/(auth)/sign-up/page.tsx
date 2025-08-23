import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SignUpForm from "./signup-form";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default async function SignUp(props: {
  searchParams: Promise<{
    callbackUrl: string;
  }>;
}) {
  const searchParams = await props.searchParams;

  const { callbackUrl = "/" } = searchParams;

  const session = await auth();
  if (session) {
    return redirect(callbackUrl);
  }

  return (
    <div className="w-full" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-center title-black">
            ساخت حساب کاربری
          </CardTitle>
        </CardHeader>

        <CardContent>
          <SignUpForm />
        </CardContent>
      </Card>
    </div>
  );
}
