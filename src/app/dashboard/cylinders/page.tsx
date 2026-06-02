import { PrismaClient } from "@prisma/client";
import { Plus, Search, Database, Edit } from "lucide-react";
import Link from "next/link";
import DeleteCylinderButton from "./DeleteCylinderButton";

const prisma = new PrismaClient();

export default async function CylindersPage() {
  const cylinders = await prisma.cylinder.findMany({
    include: { currentCustomer: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">จัดการถังแก๊ส</h2>
          <p className="text-sm text-gray-500">ตรวจสอบและขึ้นทะเบียนถังแก๊ส</p>
        </div>
        <Link
          href="/dashboard/cylinders/new"
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
              placeholder="ค้นหา Asset Code, QR Code..."
              className="w-full rounded-lg border border-border pl-9 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-gray-700">
              <tr>
                <th className="px-6 py-4 font-medium">Asset Code</th>
                <th className="px-6 py-4 font-medium">QR Code</th>
                <th className="px-6 py-4 font-medium text-center">สถานะปัจจุบัน</th>
                <th className="px-6 py-4 font-medium">ถือครองโดย</th>
                <th className="px-6 py-4 font-medium text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cylinders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    ยังไม่มีข้อมูลถังในระบบ
                  </td>
                </tr>
              ) : (
                cylinders.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-primary">{c.assetCode}</td>
                    <td className="px-6 py-4 text-gray-700">{c.qrCode}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium 
                        ${c.status === 'READY_TO_DISPATCH' ? 'bg-green-50 text-green-700' : 
                          c.status === 'WITH_CUSTOMER' ? 'bg-blue-50 text-blue-700' : 
                          c.status === 'RECEIVED_EMPTY' ? 'bg-yellow-50 text-yellow-700' : 
                          'bg-gray-100 text-gray-700'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {c.currentCustomer ? (
                         <div className="font-medium text-gray-800">{c.currentCustomer.name}</div>
                      ) : (
                        <span className="text-gray-400">- คลังสินค้า -</span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/cylinders/${c.id}/edit`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="แก้ไขข้อมูล"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <DeleteCylinderButton id={c.id} />
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
