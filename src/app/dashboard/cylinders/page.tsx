import { Search } from "lucide-react";
import Link from "next/link";
import dayjs from "dayjs";

import prisma from "@/lib/prisma";

export default async function CylindersTrackingPage() {
  const logs = await prisma.cylinderLog.findMany({
    include: { cylinder: true },
    orderBy: { createdAt: "desc" },
    take: 100, // Show latest 100 events
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">ติดตามสถานะถังแก๊ส (Timeline)</h2>
          <p className="text-sm text-gray-500">ประวัติความเคลื่อนไหวล่าสุดของถังทั้งหมดในระบบ</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาเลขตัวถัง, รหัสถัง, เหตุการณ์..."
              className="w-full rounded-lg border border-border pl-9 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-gray-700">
              <tr>
                <th className="px-6 py-4 font-medium">วัน/เวลา</th>
                <th className="px-6 py-4 font-medium">เลขตัวถัง</th>
                <th className="px-6 py-4 font-medium">รหัสถัง</th>
                <th className="px-6 py-4 font-medium">เหตุการณ์</th>
                <th className="px-6 py-4 font-medium">รายละเอียดเพิ่มเติม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    ยังไม่มีประวัติความเคลื่อนไหวในระบบ
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const daysPassed = dayjs().diff(dayjs(log.createdAt), 'day');
                  return (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      <div>{log.createdAt.toLocaleString("th-TH")}</div>
                      {daysPassed > 0 ? (
                        <div className="text-xs font-bold text-orange-500 mt-1">{daysPassed} วันที่ผ่านมา</div>
                      ) : (
                        <div className="text-xs font-bold text-green-600 mt-1">วันนี้</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-primary">
                      <Link href={`/dashboard/products/${log.cylinderId}`} className="hover:underline">
                        {log.cylinder.cylinderNo || "-"}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-800">{log.cylinder.cylinderCode || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium 
                        ${log.status === 'READY_TO_DISPATCH' ? 'bg-green-50 text-green-700' : 
                          log.status === 'WITH_CUSTOMER' ? 'bg-blue-50 text-blue-700' : 
                          log.status === 'RECEIVED_EMPTY' ? 'bg-yellow-50 text-yellow-700' : 
                          log.status === 'IN_PROCESS' ? 'bg-purple-50 text-purple-700' : 
                          log.status === 'RETURN_REQUESTED' ? 'bg-orange-50 text-orange-700' : 
                          'bg-gray-100 text-gray-700'}`}>
                        {log.status === 'READY_TO_DISPATCH' ? 'เตรียมจัดส่ง / คลังสินค้า' : 
                         log.status === 'WITH_CUSTOMER' ? 'ส่งมอบให้ลูกค้า' : 
                         log.status === 'RECEIVED_EMPTY' ? 'รับถังเปล่าคืน' : 
                         log.status === 'IN_PROCESS' ? 'ส่งบรรจุที่โรงงาน' : 
                         log.status === 'RETURN_REQUESTED' ? 'ลูกค้ารอคืนถัง' : 
                         log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{log.notes || "-"}</td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
