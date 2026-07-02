import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createCylinderAction } from "../actions";
import SubmitButton from "@/components/SubmitButton";

import prisma from "@/lib/prisma";

export default async function NewProductPage() {
  const products = await prisma.gasProduct.findMany({
    orderBy: { name: "asc" }
  });
  
  const owners = await prisma.cylinderOwner.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products" className="rounded-full p-2 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-foreground">ขึ้นทะเบียนสินค้า (ถังแก๊ส) ใหม่</h2>
          <p className="text-sm text-gray-500">นำถังแก๊สเข้าสู่คลังสินค้า</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <form action={createCylinderAction} className="p-6 space-y-6">
          <input type="hidden" name="redirectTo" value="/dashboard/products" />

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">ประเภทถังแก๊ส (Gas Product) <span className="text-red-500">*</span></label>
              <select
                name="productId"
                required
                className="w-full rounded-lg border border-border px-4 py-3 text-base md:text-sm md:py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors bg-white"
              >
                <option value="">-- เลือกประเภทถังแก๊ส --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.size})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">เลขตัวถัง <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="cylinderNo"
                required
                className="w-full rounded-lg border border-border px-4 py-3 text-base md:text-sm md:py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                placeholder="เช่น 70-123213"
              />
            </div>


            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">QR Code (รหัสบาร์โค้ด) <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="qrCode"
                required
                className="w-full rounded-lg border border-border px-4 py-3 text-base md:text-sm md:py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                placeholder="เอาเครื่องสแกนยิงช่องนี้"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">สถานะเริ่มต้น (ตอนเพิ่มเข้าระบบ) <span className="text-red-500">*</span></label>
              <select
                name="initialStatus"
                required
                className="w-full rounded-lg border border-border px-4 py-3 text-base md:text-sm md:py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors bg-white"
              >
                <option value="READY_TO_DISPATCH">ถังแก๊สพร้อมขาย (ถังที่เติมมาแล้ว)</option>
                <option value="RECEIVED_EMPTY">ถังเปล่า (ยังไม่ได้เติม)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">เจ้าของถัง <span className="text-gray-400 font-normal">(ไม่บังคับ)</span></label>
              <select
                name="ownerId"
                className="w-full rounded-lg border border-border px-4 py-3 text-base md:text-sm md:py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors bg-white"
              >
                <option value="">-- ไม่ระบุ (เป็นถังของร้าน/หมุนเวียน) --</option>
                {owners.map(owner => (
                  <option key={owner.id} value={owner.id}>{owner.name}</option>
                ))}
              </select>
            </div>


          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
            <Link
              href="/dashboard/products"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-border rounded-lg hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </Link>
            <SubmitButton
              type="submit"
              defaultText="เพิ่มสินค้า"
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
