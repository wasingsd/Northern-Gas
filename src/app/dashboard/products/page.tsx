import { Plus, Search, Eye } from "lucide-react";
import Link from "next/link";
import DeleteProductButton from "./DeleteProductButton";

import prisma from "@/lib/prisma";

const statusMap: Record<string, { label: string; color: string }> = {
  READY_TO_DISPATCH: { label: "พร้อมใช้งาน", color: "bg-green-50 text-green-700" },
  WITH_CUSTOMER: { label: "อยู่กับลูกค้า", color: "bg-blue-50 text-blue-700" },
  RECEIVED_EMPTY: { label: "ถังเปล่า", color: "bg-yellow-50 text-yellow-700" },
  IN_PROCESS: { label: "ส่งบรรจุที่โรงงาน", color: "bg-purple-50 text-purple-700" },
  RETURN_REQUESTED: { label: "ลูกค้ารอคืนถัง", color: "bg-orange-50 text-orange-700" },
  SENT: { label: "ส่งโรงบรรจุ", color: "bg-indigo-50 text-indigo-700" },
  RECEIVED: { label: "รับจากโรงบรรจุ", color: "bg-teal-50 text-teal-700" },
  IN_REFILL: { label: "กำลังบรรจุแก๊ส", color: "bg-fuchsia-50 text-fuchsia-700" },
};

function StatusBadge({ status }: { status: string }) {
  const s = statusMap[status] || { label: status, color: "bg-gray-100 text-gray-700" };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${s.color}`}>{s.label}</span>;
}

export default async function ProductsPage() {
  const cylinders = await prisma.cylinder.findMany({
    include: { currentCustomer: true, product: true, owner: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">รายการสินค้า (ถังแก๊ส)</h2>
          <p className="text-sm text-gray-500">คลังสินค้าและถังแก๊สทั้งหมดในระบบ</p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 sm:py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          <Plus className="h-4 w-4" />
          ขึ้นทะเบียนถังใหม่
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาเลขตัวถัง, QR Code..."
              className="w-full rounded-lg border border-border pl-9 pr-4 py-2.5 text-base sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-gray-700">
              <tr>
                <th className="px-6 py-4 font-medium">เลขตัวถัง</th>
                <th className="px-6 py-4 font-medium">เจ้าของถัง</th>
                <th className="px-6 py-4 font-medium">ประเภทถัง</th>
                <th className="px-6 py-4 font-medium">QR Code</th>
                <th className="px-6 py-4 font-medium text-center">สถานะปัจจุบัน</th>
                <th className="px-6 py-4 font-medium text-right">รายละเอียด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cylinders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    ยังไม่มีข้อมูลถังแก๊สในระบบ
                  </td>
                </tr>
              ) : (
                cylinders.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-primary">
                      <Link href={`/dashboard/products/${c.id}`} className="hover:underline">
                        {c.cylinderNo || "-"}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {c.owner ? <span className="text-gray-900 font-medium">{c.owner.name}</span> : <span className="text-gray-400">ถังร้าน/หมุนเวียน</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{c.product?.name || "-"}</td>
                    <td className="px-6 py-4 text-gray-700">{c.qrCode}</td>
                    <td className="px-6 py-4 text-center"><StatusBadge status={c.status} /></td>
                    <td className="px-6 py-4 flex items-center justify-end gap-2">
                      <Link href={`/dashboard/products/${c.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                        title="ดูรายละเอียดการเคลื่อนไหว">
                        <Eye className="h-4 w-4" /> ดู
                      </Link>
                      <DeleteProductButton id={c.id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-border">
          {cylinders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">ยังไม่มีข้อมูลถังแก๊สในระบบ</div>
          ) : (
            cylinders.map((c) => (
              <div key={c.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/dashboard/products/${c.id}`} className="text-primary font-bold text-base hover:underline">
                      {c.cylinderNo || "-"}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5 text-sm text-gray-600">
                      <div>{c.product?.name || "-"}</div>
                      <div className="border-l border-gray-300 pl-2">
                        {c.owner ? <span className="text-gray-900 font-medium">{c.owner.name}</span> : "ถังร้าน/หมุนเวียน"}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <div className="text-xs text-gray-500">QR: {c.qrCode}</div>
                <div className="flex items-center gap-2 pt-1">
                  <Link href={`/dashboard/products/${c.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm py-2.5 font-medium hover:bg-blue-100 transition-colors">
                    <Eye className="h-4 w-4" /> ดูรายละเอียด
                  </Link>
                  <DeleteProductButton id={c.id} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
