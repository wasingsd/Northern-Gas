"use client";

import { useState } from "react";
import { acceptJobAction, completeJobAction } from "../actions";
import { CheckCircle, Truck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DriverActionButtons({ jobId, status }: { jobId: string, status: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAccept = async () => {
    setLoading(true);
    await acceptJobAction(jobId);
    setLoading(false);
  };

  const handleComplete = async () => {
    if (!confirm("คุณเก็บเงินลูกค้าและส่งมอบถังแก๊สเรียบร้อยแล้วใช่หรือไม่?")) return;
    setLoading(true);
    await completeJobAction(jobId);
    setLoading(false);
    router.push("/driver");
  };

  if (status === "DELIVERED") {
    return (
      <div className="w-full py-4 bg-gray-800/80 border border-gray-700/50 text-gray-400 text-center rounded-2xl font-bold flex items-center justify-center gap-2">
        <CheckCircle className="h-5 w-5" />
        ส่งมอบสำเร็จแล้ว
      </div>
    );
  }

  if (status === "WAITING") {
    return (
      <button 
        onClick={handleAccept}
        disabled={loading}
        className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-bold text-lg disabled:opacity-50 transition-colors shadow-lg shadow-orange-900/50"
      >
        {loading ? "กำลังรับงาน..." : "กดรับงานนี้"}
      </button>
    );
  }

  // OUT_FOR_DELIVERY
  return (
    <button 
      onClick={handleComplete}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg disabled:opacity-50 transition-colors shadow-lg shadow-blue-900/50"
    >
      <CheckCircle className="h-6 w-6" />
      {loading ? "กำลังบันทึก..." : "ส่งมอบและเก็บเงินสำเร็จ"}
    </button>
  );
}
