"use client";

import { useRouter } from "next/navigation";
import { updateUserAvatar } from "@/lib/actions/user.actions";
import { useSession } from "next-auth/react";

type Props = {
  userId?: string | null;
  avatarInputId?: string; // default: "avatar-upload"
  redirectTo?: string; // default: "/"
};

export default function AccountConfirmButton({
  userId,
  avatarInputId = "avatar-upload",
  redirectTo = "/",
}: Props) {
  const router = useRouter();
  const { update } = useSession();

  const handleClick = async () => {
    // Trigger mobile save in MobileNumberInput (if it's in editing mode)
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("account-confirm"));
    }

    // If an avatar file is selected, upload it directly via server action
    try {
      const input = document.getElementById(
        avatarInputId
      ) as HTMLInputElement | null;
      const file = input?.files?.[0];
      if (file && userId) {
        const formData = new FormData();
        formData.set("userId", userId);
        formData.set("avatar", file);
        const result = await updateUserAvatar(formData);

        // Update the session with the new avatar image
        if (result.success && result.image) {
          await update({ image: result.image });
        }
      }
    } catch {}

    // Navigate home
    router.push(redirectTo);
  };

  return (
    <div className="mt-4 flex justify-end">
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-white font-bold hover:bg-green-700"
      >
        تایید
      </button>
    </div>
  );
}
