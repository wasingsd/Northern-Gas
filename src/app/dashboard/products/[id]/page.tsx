import { ArrowLeft, Edit, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import dayjs from "dayjs";

import prisma from "@/lib/prisma";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cylinder = await prisma.cylinder.findUnique({
    where: { id },
    include: {
      logs: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!cylinder) return notFound();
  
  const currentLog = cylinder.logs[0];
  const daysPassed = currentLog ? dayjs().diff(dayjs(currentLog.createdAt), 'day') : 0;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/products" className="rounded-full p-2 hover:bg-gray-100 transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-foreground">รายละเอียดสินค้า (ถังแก๊ส)</h2>
            <p className="text-sm text-gray-500">
              เลขตัวถัง: {cylinder.cylinderNo} | รหัสถัง: {cylinder.cylinderCode || "-"}
            </p>
          </div>
        </div>
        <Link
          href={`/dashboard/products/${id}/edit`}
          className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
        >
          <Edit className="h-4 w-4" />
          แก้ไขข้อมูล
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-border">
          <p className="text-xs text-gray-500 mb-1">QR Code</p>
          <p className="font-bold text-foreground">{cylinder.qrCode}</p>
        </div>
        <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex flex-col justify-center items-center text-center">
          <p className="text-xs text-primary font-medium mb-1 flex items-center gap-1"><Clock className="h-3 w-3" /> ระยะเวลาสถานะปัจจุบัน</p>
          <p className="font-bold text-2xl text-primary">{daysPassed} วัน</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-6">ประวัติการเคลื่อนไหว (Movement)</h3>
        
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
