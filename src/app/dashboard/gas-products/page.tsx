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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">ประเภทสินค้า (Gas Products)</h2>
          <p className="text-sm text-gray-500">จัดการประเภทและขนาดของถังแก๊ส</p>
        </div>
        <Link
          href="/dashboard/gas-products/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          <Plus className="h-4 w-4" />
          เพิ่มประเภทสินค้า
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
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
                      <Link
                        href={`/dashboard/gas-products/${p.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                        title="แก้ไข"
                      >
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
      </div>
    </div>
  );
}
