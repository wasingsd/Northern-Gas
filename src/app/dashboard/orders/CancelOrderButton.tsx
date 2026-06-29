"use client";

import { useState, useTransition } from "react";
import { cancelOrderAction } from "./actions";

export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCancel = () => {
    startTransition(async () => {
      try {
        await cancelOrderAction(orderId);
        setIsOpen(false);
      } catch (error) {
        alert(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการยกเลิกรายการ");
      }
    });
  };

  return (
    <>
      <button 
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded bg-red-50 text-red-600 text-xs px-3 py-1.5 font-medium hover:bg-red-100 transition-colors border border-red-200"
      >
        ยกเลิก
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 transform transition-all animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">ยืนยันการยกเลิกออเดอร์?</h3>
            <p className="text-sm text-gray-500 mb-6">
              คุณต้องการยกเลิกรายการส่งถังนี้ใช่หรือไม่? 
              <br/>ถังที่เลือกไว้ทั้งหมดจะถูกส่งคืนกลับสู่สต๊อกและสามารถนำไปจัดส่งให้ลูกค้ารายอื่นได้
            </p>
            
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                ปิด
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[80px]"
              >
                {isPending ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                ) : (
                  "ยืนยันยกเลิก"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
