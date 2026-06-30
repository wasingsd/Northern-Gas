import { Plus, Search, CheckCircle2, Clock, Printer } from "lucide-react";
import Link from "next/link";
import ReturnActionButtons from "./ReturnActionButtons";

import prisma from "@/lib/prisma";

export default async function ReturnsListPage() {
  const receipts = await prisma.returnReceipt.findMany({
    include: {
      customer: true,
      items: {
        include: { cylinder: true }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">รายการรับถังเปล่าคืน</h2>
          <p className="text-sm text-gray-500">ตรวจสอบและอนุมัติการรับถังเปล่าเข้าคลัง</p>
        </div>
        <Link
          href="/dashboard/returns/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          <Plus className="h-4 w-4" />
          สร้างรายการรับคืน
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่ใบรับ, ชื่อลูกค้า..."
              className="w-full rounded-lg border border-border pl-9 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-gray-700">
              <tr>
                <th className="px-6 py-4 font-medium">เลขที่ใบรับ</th>
                <th className="px-6 py-4 font-medium">ลูกค้า</th>
                <th className="px-6 py-4 font-medium">จำนวนถังรับคืน</th>
                <th className="px-6 py-4 font-medium text-center">สถานะ</th>
                <th className="px-6 py-4 font-medium text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {receipts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    ยังไม่มีรายการรับถังคืน
                  </td>
                </tr>
              ) : (
                receipts.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-primary">
                      {r.receiptNo}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{r.customer.name}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(r.createdAt).toLocaleString("th-TH")}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {r.items.length} ถัง
                    </td>

                    <td className="px-6 py-4 text-center">
                      {r.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-yellow-50 text-yellow-700">
                          <Clock className="h-3 w-3" />
                          รออนุมัติ
                        </span>
                      )}
                      {r.status === "COMPLETED" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-green-50 text-green-700">
                          <CheckCircle2 className="h-3 w-3" />
                          รับเข้าคลังแล้ว
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-2">
                        {r.status === "PENDING" && (
                          <ReturnActionButtons receiptId={r.id} />
                        )}
                        {r.status === "COMPLETED" && (
                          <a 
                            href={`/print/returns/${r.id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-1.5 rounded bg-gray-800 text-white text-xs py-1.5 font-medium hover:bg-gray-900 transition-colors"
                          >
                            <Printer className="h-3.5 w-3.5" /> พิมพ์ใบรับคืน
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
