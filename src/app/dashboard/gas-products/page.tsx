import { Plus, Edit } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import DeleteGasProductButton from "./DeleteGasProductButton";

export default async function GasProductsPage() {
  const products = await prisma.gasProduct.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { cylinders: true }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">ประเภทสินค้า (Gas Products)</h2>
          <p className="text-sm text-gray-500">จัดการประเภทและขนาดของถังแก๊ส</p>
        </div>
        <Link
          href="/dashboard/gas-products/new"
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 sm:py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          <Plus className="h-4 w-4" />
          เพิ่มประเภทสินค้า
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-gray-700">
              <tr>
                <th className="px-6 py-4 font-medium">ชื่อประเภทสินค้า</th>
                <th className="px-6 py-4 font-medium">ขนาด</th>
                <th className="px-6 py-4 font-medium">จำนวนถังในระบบ</th>
                <th className="px-6 py-4 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    ยังไม่มีข้อมูลประเภทสินค้า
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-primary">{p.name}</td>
                    <td className="px-6 py-4 text-gray-800">{p.size}</td>
                    <td className="px-6 py-4 text-gray-700">{p._count.cylinders} ใบ</td>
                    <td className="px-6 py-4 flex items-center justify-end gap-2">
                      <Link href={`/dashboard/gas-products/${p.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1" title="แก้ไข">
                        <Edit className="h-4 w-4" /> แก้ไข
                      </Link>
                      <DeleteGasProductButton id={p.id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-border">
          {products.length === 0 ? (
            <div className="p-8 text-center text-gray-500">ยังไม่มีข้อมูลประเภทสินค้า</div>
          ) : (
            products.map((p) => (
              <div key={p.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-primary text-base">{p.name}</div>
                    <div className="text-sm text-gray-600 mt-0.5">ขนาด: {p.size}</div>
                  </div>
                  <span className="text-sm text-gray-700 font-medium bg-gray-100 px-2.5 py-1 rounded-full">
                    {p._count.cylinders} ใบ
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Link href={`/dashboard/gas-products/${p.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm py-2.5 font-medium hover:bg-blue-100 transition-colors">
                    <Edit className="h-4 w-4" /> แก้ไข
                  </Link>
                  <DeleteGasProductButton id={p.id} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
