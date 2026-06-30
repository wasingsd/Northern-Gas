"use client";

import Link from "next/link";
import dayjs from "dayjs";

const statusMap: Record<string, { label: string; color: string }> = {
  READY_TO_DISPATCH: { label: "พร้อมจัดส่ง", color: "bg-green-50 text-green-700" },
  WITH_CUSTOMER: { label: "ส่งมอบลูกค้า", color: "bg-blue-50 text-blue-700" },
  RECEIVED_EMPTY: { label: "รับถังเปล่าคืน", color: "bg-yellow-50 text-yellow-700" },
  IN_PROCESS: { label: "ส่งบรรจุโรงงาน", color: "bg-purple-50 text-purple-700" },
  RETURN_REQUESTED: { label: "ลูกค้ารอคืนถัง", color: "bg-orange-50 text-orange-700" },
  SENT: { label: "ส่งโรงบรรจุ", color: "bg-indigo-50 text-indigo-700" },
  RECEIVED: { label: "รับจากโรงบรรจุ", color: "bg-teal-50 text-teal-700" },
  IN_REFILL: { label: "กำลังบรรจุแก๊ส", color: "bg-fuchsia-50 text-fuchsia-700" },
};

function StatusBadge({ status }: { status: string }) {
  const s = statusMap[status] || { label: status, color: "bg-gray-100 text-gray-700" };
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${s.color}`}>{s.label}</span>;
}

export default function DashboardTimeline({ logs }: { logs: any[] }) {

  return (
    <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden mt-8">
      <div className="p-4 border-b border-border bg-gray-50">
        <h3 className="text-lg font-bold text-foreground">ภาพรวมการเคลื่อนไหวของถัง (Timeline)</h3>
        <p className="text-sm text-gray-500">ติดตามสถานะถังแก๊สที่มีการเข้า-ออกระบบในช่วงเวลาที่เลือก</p>
      </div>
      
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto max-h-[600px] overflow-y-auto">
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
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
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
                  <td className="px-6 py-4"><StatusBadge status={log.status} /></td>
                  <td className="px-6 py-4 text-gray-700">{log.notes || "-"}</td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden max-h-[500px] overflow-y-auto divide-y divide-border">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            ไม่มีประวัติความเคลื่อนไหวในช่วงเวลาที่เลือก
          </div>
        ) : (
          logs.map((log) => {
            const daysPassed = dayjs().diff(dayjs(log.createdAt), 'day');
            return (
              <div key={log.id} className="p-3 space-y-1.5">
                {/* Row 1: Time + Cylinder + Status */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500">
                    {new Date(log.createdAt).toLocaleString("th-TH", { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <Link href={`/dashboard/products/${log.cylinderId}`} className="font-bold text-primary text-sm hover:underline">
                    {log.cylinder.cylinderNo || "-"}
                  </Link>
                  <StatusBadge status={log.status} />
                </div>
                {/* Row 2: Notes */}
                {log.notes && (
                  <div className="text-xs text-gray-600 pl-0.5">{log.notes}</div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
