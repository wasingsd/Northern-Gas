"use client";

import { useState } from "react";
import { receiveRefillBatchAction } from "./actions";
import { Download } from "lucide-react";

export default function ReceiveBatchButton({ batchId }: { batchId: string }) {
  const [loading, setLoading] = useState(false);

  const handleReceive = async () => {
    if (!confirm("คุณต้องการรับถังแก็สในรอบนี้ทั้งหมดกลับเข้าคลังใช่หรือไม่?\n\n(ถังทุกใบจะเปลี่ยนเป็นสถานะ 'พร้อมขาย')")) {
      return;
    }
    
    setLoading(true);
    await receiveRefillBatchAction(batchId);
    setLoading(false);
  };

  return (
    <button
      onClick={handleReceive}
      disabled={loading}
      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors disabled:opacity-50"
    >
      <Download className="h-4 w-4" />
      {loading ? "กำลังรับ..." : "รับทั้งลอตเข้าคลัง"}
    </button>
  );
}
