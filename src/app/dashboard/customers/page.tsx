import { Plus, Search, MapPin, Phone } from "lucide-react";
import Link from "next/link";

import prisma from "@/lib/prisma";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">จัดการลูกค้า</h2>
          <p className="text-sm text-gray-500">รายชื่อลูกค้าและข้อมูลติดต่อ</p>
        </div>
        <Link
          href="/dashboard/customers/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          <Plus className="h-4 w-4" />
          เพิ่มลูกค้าใหม่
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, เบอร์โทร..."
              className="w-full rounded-lg border border-border pl-9 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-gray-700">
              <tr>
                <th className="px-6 py-4 font-medium">รหัสลูกค้า</th>
                <th className="px-6 py-4 font-medium">ชื่อลูกค้า</th>
                <th className="px-6 py-4 font-medium">ติดต่อ</th>
                <th className="px-6 py-4 font-medium">ประเภทผู้เสียภาษี</th>
                <th className="px-6 py-4 font-medium text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    ยังไม่มีข้อมูลลูกค้า
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-500">{c.customerCode || "-"}</td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {c.name}
                      {c.taxId && <div className="text-xs text-gray-400 mt-1">Tax ID: {c.taxId}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-gray-700">
                        {c.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-gray-400" />
                            {c.phone}
                          </div>
                        )}
                        {c.email && (
                          <div className="text-sm text-gray-500">
                            {c.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        c.taxType === 'CORPORATE' ? 'bg-blue-50 text-blue-700' : 
                        c.taxType === 'INDIVIDUAL' ? 'bg-green-50 text-green-700' : 
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {c.taxType === 'CORPORATE' ? 'นิติบุคคล' : 
                         c.taxType === 'INDIVIDUAL' ? 'บุคคลธรรมดา' : 'ไม่ระบุ'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link href={`/dashboard/customers/${c.id}/edit`} className="inline-block p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                        แก้ไข
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col divide-y divide-border">
          {customers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              ยังไม่มีข้อมูลลูกค้า
            </div>
          ) : (
            customers.map((c) => (
              <div key={c.id} className="p-4 space-y-3 bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-foreground text-lg">{c.name}</div>
                    <div className="text-sm font-medium text-gray-500 mt-0.5">รหัส: {c.customerCode || "-"}</div>
                  </div>
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                    c.taxType === 'CORPORATE' ? 'bg-blue-100 text-blue-800' : 
                    c.taxType === 'INDIVIDUAL' ? 'bg-green-100 text-green-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {c.taxType === 'CORPORATE' ? 'นิติบุคคล' : 
                     c.taxType === 'INDIVIDUAL' ? 'บุคคลธรรมดา' : 'ไม่ระบุ'}
                  </span>
                </div>
                
                <div className="flex flex-col gap-2 pt-1">
                  {c.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Phone className="h-4 w-4 text-gray-400" />
                      {c.phone}
                    </div>
                  )}
                  {c.taxId && (
                    <div className="text-sm text-gray-500">Tax ID: {c.taxId}</div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <Link 
                    href={`/dashboard/customers/${c.id}/edit`}
                    className="flex items-center gap-2 px-4 py-2 text-blue-700 bg-blue-50 rounded-lg font-medium active:bg-blue-100 transition-colors"
                  >
                    แก้ไข
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
