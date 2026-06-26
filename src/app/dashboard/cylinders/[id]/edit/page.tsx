import { PrismaClient } from "@prisma/client";
import { updateCylinderAction } from "../../actions";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const prisma = new PrismaClient();

export default async function EditCylinderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cylinder = await prisma.cylinder.findUnique({
    where: { id },
    include: {
      logs: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  const products = await prisma.gasProduct.findMany({ where: { active: true } });

  if (!cylinder) return notFound();

  // We need to pass the ID to the server action
  const updateActionWithId = updateCylinderAction.bind(null, cylinder.id);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/cylinders" className="rounded-full p-2 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-foreground">แก้ไขข้อมูลถังแก๊ส</h2>
          <p className="text-sm text-gray-500">อัปเดตข้อมูล Asset Code หรือ QR Code</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <form action={updateActionWithId} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="assetCode" className="text-sm font-medium text-foreground">
                Asset Code (รหัสถัง) <span className="text-red-500">*</span>
              </label>
              <input
                id="assetCode"
                name="assetCode"
                defaultValue={cylinder.assetCode}
                required
                className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors bg-white text-foreground"
                placeholder="เช่น PT-15KG-001"
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
                ประเภทสินค้า (ขนาดถัง) <span className="text-red-500">*</span>
              </label>
              <select
                id="productId"
                name="productId"
                defaultValue={cylinder.productId || ""}
                required
                className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors bg-white text-foreground"
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
          
          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <Link 
              href="/dashboard/cylinders"
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

      {/* History Timeline */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm mt-8">
        <h3 className="text-lg font-bold text-foreground mb-6">ประวัติการเคลื่อนไหวของถัง (Timeline)</h3>
        
        {cylinder.logs.length === 0 ? (
          <p className="text-gray-500 text-sm">ยังไม่มีประวัติการเคลื่อนไหว</p>
        ) : (
          <div className="relative border-l border-gray-200 ml-3 space-y-6">
            {cylinder.logs.map((log) => (
              <div key={log.id} className="relative pl-6">
                <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-white"></span>
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                  <h4 className="text-sm font-bold text-foreground">
                    {log.status === 'READY_TO_DISPATCH' && 'เตรียมจัดส่ง / พร้อมขาย'}
                    {log.status === 'WITH_CUSTOMER' && 'อยู่กับลูกค้า'}
                    {log.status === 'RECEIVED_EMPTY' && 'รับถังเปล่าคืน'}
                    {log.status === 'IN_PROCESS' && 'ส่งบรรจุที่โรงงาน'}
                    {log.status === 'RETURN_REQUESTED' && 'ลูกค้าขอคืนถัง'}
                    {!['READY_TO_DISPATCH', 'WITH_CUSTOMER', 'RECEIVED_EMPTY', 'IN_PROCESS', 'RETURN_REQUESTED'].includes(log.status) && log.status}
                  </h4>
                  <time className="text-xs text-gray-500 font-medium">
                    {log.createdAt.toLocaleString('th-TH')}
                  </time>
                </div>
                {log.notes && (
                  <p className="text-sm text-gray-600 mt-1">{log.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
