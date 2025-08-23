"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { updateUserAvatar } from "@/lib/actions/user.actions";
import FullscreenLoading from "@/components/shared/fullscreen-loading";
import { useSession } from "next-auth/react";

type Props = {
  userId: string;
  inputId: string;
  formClass: string;
  fileInputWrapperClass: string;
  fileInputClass: string;
  fileInputLabelClass: string;
  filePlaceholderClass: string;
  submitButtonClass: string;
  formId?: string;
  hideSubmitButton?: boolean;
};

export default function AvatarUploadForm(props: Props) {
  const {
    userId,
    inputId,
    formClass,
    fileInputWrapperClass,
    fileInputClass,
    fileInputLabelClass,
    filePlaceholderClass,
    submitButtonClass,
    formId,
    hideSubmitButton,
  } = props;

  const formRef = useRef<HTMLFormElement>(null);
  const { update } = useSession();
  // Keep overlay visible for at least 3 seconds
  const [minHoldActive, setMinHoldActive] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setMinHoldActive(true);
    try {
      const result = await updateUserAvatar(formData);
      if (result.success && result.image) {
        // Update the session with the new avatar image
        await update({ image: result.image });
      }
    } catch (error) {
      console.error("Avatar upload error:", error);
    }
    setTimeout(() => setMinHoldActive(false), 3000);
  };

  function PendingOverlay({ active }: { active: boolean }) {
    const { pending } = useFormStatus();
    if (!pending && !active) return null;
    return <FullscreenLoading title="در حال ذخیره آواتار..." />;
  }

  return (
    <>
      <form
        id={formId}
        ref={formRef}
        action={handleSubmit}
        className={formClass}
        encType="multipart/form-data"
      >
        <PendingOverlay active={minHoldActive} />
        <input type="hidden" name="userId" value={userId} />
        <div className={fileInputWrapperClass}>
          <input
            id={inputId}
            type="file"
            name="avatar"
            accept="image/png,image/jpeg,image/webp"
            className={fileInputClass}
          />
          <label htmlFor={inputId} className={fileInputLabelClass}>
            انتخاب فایل
          </label>
          <div className={filePlaceholderClass}>فایلی انتخاب نشده</div>
        </div>
        {!hideSubmitButton && (
          <button type="submit" className={submitButtonClass}>
            ذخیره آواتار
          </button>
        )}
      </form>
    </>
  );
}
