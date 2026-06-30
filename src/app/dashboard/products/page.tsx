import { Plus, Search, Eye } from "lucide-react";
import Link from "next/link";
import DeleteProductButton from "./DeleteProductButton";

import prisma from "@/lib/prisma";

export default async function ProductsPage() {
  const cylinders = await prisma.cylinder.findMany({
    include: { currentCustomer: true, product: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">รายการสินค้า (ถังแก๊ส)</h2>
          <p className="text-sm text-gray-500">คลังสินค้าและถังแก๊สทั้งหมดในระบบ</p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          <Plus className="h-4 w-4" />
          ขึ้นทะเบียนถังใหม่
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาเลขตัวถัง, QR Code..."
              className="w-full rounded-lg border border-border pl-9 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-gray-700">
              <tr>
                <th className="px-6 py-4 font-medium">เลขตัวถัง</th>
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
                    <td className="px-6 py-4 text-gray-700">{c.product?.name || "-"}</td>
                    <td className="px-6 py-4 text-gray-700">{c.qrCode}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium 
                        ${c.status === 'READY_TO_DISPATCH' ? 'bg-green-50 text-green-700' : 
                          c.status === 'WITH_CUSTOMER' ? 'bg-blue-50 text-blue-700' : 
                          c.status === 'RECEIVED_EMPTY' ? 'bg-yellow-50 text-yellow-700' : 
                          c.status === 'IN_PROCESS' ? 'bg-purple-50 text-purple-700' :  
                          c.status === 'RETURN_REQUESTED' ? 'bg-orange-50 text-orange-700' : 
                          c.status === 'SENT' ? 'bg-indigo-50 text-indigo-700' : 
                          c.status === 'RECEIVED' ? 'bg-teal-50 text-teal-700' : 
                          c.status === 'IN_REFILL' ? 'bg-fuchsia-50 text-fuchsia-700' : 
                          'bg-gray-100 text-gray-700'}`}>
                        {c.status === 'READY_TO_DISPATCH' ? 'พร้อมใช้งาน' : 
                         c.status === 'WITH_CUSTOMER' ? 'อยู่กับลูกค้า' : 
                         c.status === 'RECEIVED_EMPTY' ? 'ถังเปล่า' : 
                         c.status === 'IN_PROCESS' ? 'ส่งบรรจุที่โรงงาน' : 
                         c.status === 'RETURN_REQUESTED' ? 'ลูกค้ารอคืนถัง' : 
                         c.status === 'SENT' ? 'ส่งโรงบรรจุ' : 
                         c.status === 'RECEIVED' ? 'รับจากโรงบรรจุ' : 
                         c.status === 'IN_REFILL' ? 'กำลังบรรจุแก๊ส' : 
                         c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/products/${c.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                        title="ดูรายละเอียดการเคลื่อนไหว"
                      >
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
      </div>
    </div>
  );
}
