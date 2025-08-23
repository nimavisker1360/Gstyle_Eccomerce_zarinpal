"use client";

import { useEffect, useState } from "react";

type AvatarPreviewProps = {
  initialSrc: string;
  inputId: string;
  containerClassName: string;
  imageClassName: string;
  fallbackClassName: string;
};

export default function AvatarPreview(props: AvatarPreviewProps) {
  const {
    initialSrc,
    inputId,
    containerClassName,
    imageClassName,
    fallbackClassName,
  } = props;
  const [src, setSrc] = useState<string>(initialSrc);

  useEffect(() => {
    const input = document.getElementById(inputId) as HTMLInputElement | null;
    if (!input) return;

    const handleChange = () => {
      const file = input.files?.[0];
      if (file) {
        const objectUrl = URL.createObjectURL(file);
        setSrc(objectUrl);
      }
    };

    input.addEventListener("change", handleChange);
    return () => {
      input.removeEventListener("change", handleChange);
    };
  }, [inputId]);

  return (
    <div className={containerClassName}>
      {src ? (
        <img src={src} alt="avatar" className={imageClassName} />
      ) : (
        <div className={fallbackClassName}>بدون تصویر</div>
      )}
    </div>
  );
}
