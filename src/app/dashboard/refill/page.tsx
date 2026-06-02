import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { Plus, CheckCircle2, Clock } from "lucide-react";
import ReceiveBatchButton from "./ReceiveBatchButton";

const prisma = new PrismaClient();

export default async function RefillPage() {
  const batches = await prisma.refillBatch.findMany({
    include: { cylinders: true },
    orderBy: { sentAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">งานบรรจุแก๊ส</h2>
          <p className="text-sm text-gray-500">จัดการส่งถังเปล่าไปโรงบรรจุและรับถังแก๊สคืน</p>
        </div>
        <Link 
          href="/dashboard/refill/new" 
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm"
        >
          <Plus className="h-4 w-4" />
          สร้างรอบส่งบรรจุใหม่
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-border text-gray-600 font-medium">
            <tr>
              <th className="px-6 py-4">รอบที่</th>
              <th className="px-6 py-4">วันที่ส่ง</th>
              <th className="px-6 py-4">จำนวนถัง</th>
              <th className="px-6 py-4">สถานะ</th>
              <th className="px-6 py-4 text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {batches.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  ยังไม่มีประวัติการส่งบรรจุแก๊ส
                </td>
              </tr>
            ) : batches.map(batch => (
              <tr key={batch.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">{batch.batchNo}</td>
                <td className="px-6 py-4 text-gray-600">{batch.sentAt.toLocaleString('th-TH')}</td>
                <td className="px-6 py-4 text-gray-600">{batch.cylinders.length} ใบ</td>
                <td className="px-6 py-4">
                  {batch.status === "SENT" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Clock className="h-3.5 w-3.5" />
                      กำลังส่งบรรจุ
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      รับเข้าคลังแล้ว ({batch.receivedAt?.toLocaleDateString('th-TH')})
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {batch.status === "SENT" && (
                    <ReceiveBatchButton batchId={batch.id} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
