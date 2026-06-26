import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import { createCylinderAction } from "../actions";

const prisma = new PrismaClient();

export default async function NewCylinderPage() {
  const products = await prisma.gasProduct.findMany({ where: { active: true } });

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/cylinders" className="rounded-full p-2 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-foreground">ขึ้นทะเบียนถังใหม่</h2>
          <p className="text-sm text-gray-500">นำถังแก๊สเข้าสู่ระบบติดตาม</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <form action={createCylinderAction} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Asset Code (รหัสสลักถัง)</label>
              <input
                type="text"
                name="assetCode"
                required
                className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                placeholder="เช่น PT-15KG-001"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">QR Code (รหัสสำหรับสแกน)</label>
              <input
                type="text"
                name="qrCode"
                required
                className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                placeholder="เอาเครื่องสแกนยิงช่องนี้"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">ประเภทสินค้า (ขนาดถัง)</label>
              <select
                name="productId"
                required
                className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors bg-white"
              >
                <option value="">-- เลือกขนาดถัง --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sizeKg} กก.)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
            <Link
              href="/dashboard/cylinders"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-border rounded-lg hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
            >
              ขึ้นทะเบียนถัง
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
