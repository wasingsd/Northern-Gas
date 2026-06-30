"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import React from "react";

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pendingText?: string;
  defaultText: React.ReactNode;
  icon?: React.ReactNode;
}

export default function SubmitButton({
  pendingText = "กำลังดำเนินการ...",
  defaultText,
  icon,
  className,
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      disabled={pending || disabled}
      className={`relative inline-flex items-center justify-center gap-2 ${className}`}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {pendingText}
        </>
      ) : (
        <>
          {icon}
          {defaultText}
        </>
      )}
    </button>
  );
}
