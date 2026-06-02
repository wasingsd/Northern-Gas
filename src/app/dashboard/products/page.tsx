import { PrismaClient } from "@prisma/client";
import { Plus } from "lucide-react";
import Link from "next/link";
import DeleteProductButton from "./DeleteProductButton";

const prisma = new PrismaClient();

export default async function ProductsPage() {
  const products = await prisma.gasProduct.findMany({
    orderBy: { sizeKg: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">สินค้าแก๊ส</h2>
          <p className="text-sm text-gray-500">จัดการข้อมูลสินค้าและราคา</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-foreground text-lg">รายการสินค้า</h3>
          <Link
            href="/dashboard/products/new"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
          >
            <Plus className="h-4 w-4" />
            เพิ่มสินค้าใหม่
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-gray-700">
              <tr>
                <th className="px-6 py-4 font-medium">ชื่อสินค้า</th>
                <th className="px-6 py-4 font-medium">ขนาด (กก.)</th>
                <th className="px-6 py-4 font-medium text-center">สถานะ</th>
                <th className="px-6 py-4 font-medium text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    ยังไม่มีข้อมูลสินค้า
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{p.name}</td>
                    <td className="px-6 py-4 text-gray-700">{p.sizeKg}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${p.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {p.active ? "ใช้งาน" : "ปิดใช้งาน"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-primary hover:underline text-sm font-medium">
                        แก้ไข
                      </button>
                      <DeleteProductButton id={p.id} />
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
