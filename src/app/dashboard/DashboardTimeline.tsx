"use client";

import Link from "next/link";
import dayjs from "dayjs";

export default function DashboardTimeline({ logs }: { logs: any[] }) {

  return (
    <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden mt-8">
      <div className="p-4 border-b border-border bg-gray-50">
        <h3 className="text-lg font-bold text-foreground">ภาพรวมการเคลื่อนไหวของถัง (Timeline)</h3>
        <p className="text-sm text-gray-500">ติดตามสถานะถังแก๊สที่มีการเข้า-ออกระบบในช่วงเวลาที่เลือก</p>
      </div>
      
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-white text-gray-700 sticky top-0 shadow-sm z-10">
            <tr>
              <th className="px-6 py-4 font-medium">วัน/เวลา</th>
              <th className="px-6 py-4 font-medium">เลขตัวถัง</th>
              <th className="px-6 py-4 font-medium">เหตุการณ์</th>
              <th className="px-6 py-4 font-medium">รายละเอียดเพิ่มเติม</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  ไม่มีประวัติความเคลื่อนไหวในช่วงเวลาที่เลือก
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const daysPassed = dayjs().diff(dayjs(log.createdAt), 'day');
                return (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    <div>{new Date(log.createdAt).toLocaleString("th-TH")}</div>
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
  );
}
