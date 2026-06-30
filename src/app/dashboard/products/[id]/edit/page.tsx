import { updateCylinderAction } from "../../actions";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import prisma from "@/lib/prisma";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cylinder = await prisma.cylinder.findUnique({
    where: { id },
  });

  const products = await prisma.gasProduct.findMany({ orderBy: { name: "asc" } });
  const owners = await prisma.cylinderOwner.findMany({ orderBy: { name: "asc" } });

  if (!cylinder) return notFound();

  const updateActionWithId = updateCylinderAction.bind(null, cylinder.id);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/products/${id}`} className="rounded-full p-2 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-foreground">แก้ไขข้อมูลสินค้า (ถังแก๊ส)</h2>
          <p className="text-sm text-gray-500">อัปเดตเลขตัวถัง หรือ QR Code</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <form action={updateActionWithId} className="space-y-6">
          <input type="hidden" name="redirectTo" value={`/dashboard/products/${id}`} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="cylinderNo" className="text-sm font-medium text-foreground">
                เลขตัวถัง <span className="text-red-500">*</span>
              </label>
              <input
                id="cylinderNo"
                name="cylinderNo"
                defaultValue={cylinder.cylinderNo}
                required
                className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors bg-white text-foreground"
                placeholder="เช่น 70-123213"
              />
            </div>


            <div className="space-y-2">
              <label htmlFor="qrCode" className="text-sm font-medium text-foreground">
                QR Code (รหัสบาร์โค้ด) <span className="text-red-500">*</span>
              </label>
              <input
                id="qrCode"
                name="qrCode"
                defaultValue={cylinder.qrCode}
                required
                className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors bg-white text-foreground"
                placeholder="คลิกที่นี่แล้วใช้ปืนยิงสแกนบาร์โค้ด"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="productId" className="text-sm font-medium text-foreground">
                ประเภทถังแก๊ส (Gas Product) <span className="text-red-500">*</span>
              </label>
              <select
                id="productId"
                name="productId"
                required
                defaultValue={cylinder.productId || ""}
                className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors bg-white text-foreground"
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
              <label htmlFor="ownerId" className="text-sm font-medium text-foreground">
                เจ้าของถัง <span className="text-gray-400 font-normal">(ไม่บังคับ)</span>
              </label>
              <select
                id="ownerId"
                name="ownerId"
                defaultValue={cylinder.ownerId || ""}
                className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors bg-white text-foreground"
              >
                <option value="">-- ไม่ระบุ (เป็นถังของร้าน/หมุนเวียน) --</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>{owner.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <Link 
              href={`/dashboard/products/${id}`}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
            >
              <Save className="h-4 w-4" />
              บันทึกการแก้ไข
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
