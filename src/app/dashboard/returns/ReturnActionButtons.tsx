"use client";

import { Check, X } from "lucide-react";
import { useTransition } from "react";
import { confirmReturnReceiptAction, cancelReturnReceiptAction } from "./actions";

export default function ReturnActionButtons({ receiptId }: { receiptId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    if (confirm("ยืนยันการรับถังเปล่าเข้าคลัง?")) {
      startTransition(() => {
        confirmReturnReceiptAction(receiptId);
      });
    }
  };

  const handleCancel = () => {
    if (confirm("คุณต้องการยกเลิกรายการรับคืนนี้ใช่หรือไม่? ถังจะถูกกลับไปอยู่สถานะ 'อยู่กับลูกค้า'")) {
      startTransition(() => {
        cancelReturnReceiptAction(receiptId);
      });
    }
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <button 
        onClick={handleConfirm}
        disabled={isPending}
        className="flex-1 rounded bg-green-600 text-white text-xs py-1.5 font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
      >
        <Check className="h-3 w-3" /> อนุมัติ
      </button>
      <button 
        onClick={handleCancel}
        disabled={isPending}
        className="flex-1 rounded bg-red-100 text-red-600 text-xs py-1.5 font-medium hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
      >
        <X className="h-3 w-3" /> ยกเลิก
      </button>
    </div>
  );
}
