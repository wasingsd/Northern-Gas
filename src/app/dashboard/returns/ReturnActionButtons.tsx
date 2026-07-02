"use client";

import { Check, X, Loader2, Printer, ClipboardCheck } from "lucide-react";
import { useTransition } from "react";
import { cancelReturnReceiptAction } from "./actions";
import Link from "next/link";

export default function ReturnActionButtons({ receiptId, userRole = "OWNER" }: { receiptId: string, userRole?: string }) {
  const [isPending, startTransition] = useTransition();

  const handleCancel = () => {
    if (confirm("คุณต้องการยกเลิกรายการรับคืนนี้ใช่หรือไม่? ถังจะถูกกลับไปอยู่สถานะ 'อยู่กับลูกค้า'")) {
      startTransition(() => {
        cancelReturnReceiptAction(receiptId);
      });
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {userRole !== "DRIVER" && (
        <div className="flex items-center gap-2 w-full">
          <Link 
            href={`/dashboard/returns/${receiptId}/verify`}
            className="flex-1 rounded bg-blue-600 text-white text-xs py-2 font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <ClipboardCheck className="h-3.5 w-3.5" />
            ตรวจสอบรายการ
          </Link>
          <button 
            onClick={handleCancel}
            disabled={isPending}
            className="flex-1 rounded bg-red-100 text-red-600 text-xs py-2 font-medium hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
            {isPending ? "กำลังยกเลิก..." : "ยกเลิก"}
          </button>
        </div>
      )}
      <a href={`/print/returns/${receiptId}`} target="_blank" rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-1.5 rounded bg-gray-800 text-white text-xs py-2 font-medium hover:bg-gray-900 transition-colors">
        <Printer className="h-3.5 w-3.5" /> พิมพ์ใบรับคืน (ชั่วคราว)
      </a>
    </div>
  );
}
