import { auth } from "@/auth";
import { getUserProfile } from "@/lib/actions/user.actions";
import styles from "./account.module.css";
import MobileNumberInput from "@/components/shared/mobile-number-input";
import AvatarPreview from "@/components/shared/avatar-preview";
import AvatarUploadForm from "@/components/shared/avatar-upload-form";
import AccountConfirmButton from "@/components/shared/account-confirm-button";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();
  const user = session?.user;
  const profile = user?.id ? await getUserProfile(user.id) : null;

  const email = profile?.email || user?.email || "";
  const crypto = await import("crypto");
  const hash = email
    ? crypto.createHash("md5").update(email.trim().toLowerCase()).digest("hex")
    : "";

  // Fallback chain for avatar resolution (highest to lowest):
  // 1) Stored user image in DB
  // 2) Image from auth provider session (e.g., Google)
  // 3) Unavatar resolved from email (uses Google/Gmail when available)
  // 4) Gravatar identicon
  const gravatarAvatar = hash
    ? `https://www.gravatar.com/avatar/${hash}?d=identicon&s=256`
    : "";
  const unavatarFromEmail = email
    ? `https://unavatar.io/${encodeURIComponent(email)}?fallback=${encodeURIComponent(
        gravatarAvatar
      )}`
    : "";

  const initialAvatar =
    profile?.image || user?.image || unavatarFromEmail || gravatarAvatar || "";

  return (
    <div className={`font-iransans ${styles.container}`} dir="rtl">
      <h1 className={styles.title}>حساب کاربری شما</h1>

      <div className={styles.card}>
        <div className={styles.headerRow}>
          <AvatarPreview
            initialSrc={initialAvatar}
            inputId="avatar-upload"
            containerClassName={styles.avatar}
            imageClassName={styles.avatarImg}
            fallbackClassName={styles.noImage}
          />

          <div className={styles.info}>
            <div className={styles.name}>
              {profile?.name || user?.name || "کاربر"}
            </div>
            <div className={styles.email}>{profile?.email || user?.email}</div>
          </div>
        </div>

        {user?.id && (
          <AvatarUploadForm
            userId={user.id}
            inputId="avatar-upload"
            formClass={styles.form}
            fileInputWrapperClass={styles.fileInputWrapper}
            fileInputClass={styles.fileInput}
            fileInputLabelClass={styles.fileInputLabel}
            filePlaceholderClass={styles.filePlaceholder}
            submitButtonClass={styles.submitButton}
            formId="avatar-upload-form"
            hideSubmitButton
          />
        )}

        <form className={styles.profileForm}>
          <div className={styles.formRow}>
            <label className={styles.label}>نام و نام‌خانوادگی</label>
            <input
              className={styles.input}
              readOnly
              value={profile?.name || user?.name || ""}
            />
          </div>
          <div className={styles.formRow}>
            <label className={styles.label}>ایمیل</label>
            <input className={styles.input} readOnly value={email} />
          </div>
          <div className={styles.formRow}>
            <label className={styles.label}>شماره موبایل</label>
            {user?.id ? (
              <MobileNumberInput
                userId={user.id}
                currentMobile={profile?.mobile || ""}
              />
            ) : (
              <input
                className={styles.input}
                readOnly
                value={profile?.mobile || ""}
                placeholder="—"
              />
            )}
          </div>
        </form>
        <AccountConfirmButton userId={user?.id ?? null} />
      </div>
    </div>
  );
}
