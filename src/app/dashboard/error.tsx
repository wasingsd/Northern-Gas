"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard caught error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 p-8 text-center shadow-sm">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h2 className="mb-2 text-xl font-bold text-gray-900">อ๊ะ! เกิดข้อผิดพลาดบางอย่าง</h2>
      <p className="mb-6 max-w-md text-sm text-gray-600">
        ระบบไม่สามารถประมวลผลคำสั่งของคุณได้ในขณะนี้ อาจเกิดจากปัญหาการเชื่อมต่อหรือข้อมูลไม่สมบูรณ์
        <br />
        <span className="mt-2 block text-xs text-red-500 font-mono bg-red-100/50 p-2 rounded">
          {error.message || "Unknown error"}
        </span>
      </p>
      
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700"
      >
        <RefreshCcw className="h-4 w-4" />
        ลองใหม่อีกครั้ง
      </button>
    </div>
  );
}
