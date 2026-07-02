"use client";

import { useState } from "react";
import { receiveRefillBatchAction } from "./actions";
import { Download, CheckCircle2, AlertCircle } from "lucide-react";

export default function ReceiveBatchButton({ batchId }: { batchId: string }) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleConfirm = () => {
    setShowConfirm(true);
  };

  const executeReceive = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      await receiveRefillBatchAction(batchId);
      setShowSuccess(true);
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการรับเข้าคลัง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleConfirm}
        disabled={loading}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        {loading ? "กำลังรับ..." : "รับทั้งลอตเข้าคลัง"}
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in duration-200 mx-4">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-yellow-100 mb-4">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">ยืนยันการรับเข้าคลัง</h3>
            <p className="text-sm text-gray-500 mb-6">คุณต้องการรับถังแก็สในรอบนี้ทั้งหมดกลับเข้าคลังใช่หรือไม่?<br/><br/><span className="text-xs text-gray-400">(ถังทุกใบจะเปลี่ยนเป็นสถานะ 'พร้อมขาย')</span></p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2.5 rounded-lg transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={executeReceive}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg transition-colors"
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in duration-200 mx-4">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">รับเข้าคลังสำเร็จ!</h3>
            <p className="text-sm text-gray-500 mb-6">ถังแก๊สทั้งหมดได้ถูกอัปเดตเป็น 'พร้อมขาย' เรียบร้อยแล้ว</p>
            <button
              type="button"
              onClick={() => setShowSuccess(false)}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}
    </>
  );
}
