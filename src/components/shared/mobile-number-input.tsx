"use client";

import { useState, useEffect } from "react";
import type React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Save, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { updateUserMobile } from "@/lib/actions/user.actions";

interface MobileNumberInputProps {
  userId: string;
  currentMobile: string;
  onUpdate?: (mobile: string) => void;
  exposeApiRef?: React.MutableRefObject<{
    save: () => Promise<boolean>;
  } | null>;
}

export default function MobileNumberInput({
  userId,
  currentMobile,
  onUpdate,
  exposeApiRef,
}: MobileNumberInputProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [mobile, setMobile] = useState(currentMobile);
  const [isLoading, setIsLoading] = useState(false);
  const [displayMobile, setDisplayMobile] = useState(currentMobile);

  // Update local state when currentMobile prop changes
  useEffect(() => {
    setMobile(currentMobile);
    setDisplayMobile(currentMobile);
  }, [currentMobile]);

  const handleSave = async () => {
    if (!mobile.trim()) {
      toast({
        title: "خطا",
        description: "شماره موبایل نمی‌تواند خالی باشد",
        variant: "destructive",
      });
      return;
    }

    if (!/^09\d{9}$/.test(mobile)) {
      toast({
        title: "خطا",
        description: "شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateUserMobile(userId, mobile);

      if (result.success) {
        toast({
          title: "موفقیت",
          description: result.message,
          variant: "default",
        });
        setIsEditing(false);

        // Update the display immediately
        setDisplayMobile(mobile);

        // Update the parent component with the new mobile number
        onUpdate?.(mobile);

        // Refresh the page to update the session and profile data
        router.refresh();
      } else {
        toast({
          title: "خطا",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در به‌روزرسانی شماره موبایل",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Allow a global confirm action to trigger save (used by account confirm button)
  useEffect(() => {
    const handler = async () => {
      if (isEditing) {
        await handleSave();
      }
    };
    window.addEventListener("account-confirm", handler as EventListener);
    return () => {
      window.removeEventListener("account-confirm", handler as EventListener);
    };
  }, [isEditing, mobile]);

  const handleCancel = () => {
    setMobile(currentMobile);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 flex-1 justify-end w-full">
          <Input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="شماره موبایل (مثال: 09123456789)"
            className="text-right"
            dir="rtl"
            maxLength={11}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSave();
              }
            }}
          />
        </div>
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Save className="w-4 h-4" />
          {isLoading ? "در حال ذخیره..." : "ذخیره"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
        >
          <X className="w-4 h-4" />
          لغو
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 flex-1 justify-end w-full">
        <span className="text-sm text-gray-700 text-right" dir="rtl">
          {displayMobile || "شماره موبایل تنظیم نشده"}
        </span>
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handleEdit}
        className="text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400"
      >
        <Edit2 className="w-4 h-4" />
        {displayMobile ? "ویرایش" : "افزودن"}
      </Button>
    </div>
  );
}
