import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, MapPin, Phone, Mail, Package, Truck, Receipt } from "lucide-react";
import dayjs from "dayjs";

import prisma from "@/lib/prisma";

export default async function OrderDetailsPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      cylinders: true,
      deliveryJob: {
        include: { driver1: true, driver2: true }
      }
    }
  });

  if (!order) return notFound();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">สำเร็จแล้ว</span>;
      case 'CANCELLED': return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">ยกเลิก</span>;
      case 'PROCESSING': return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">กำลังดำเนินการ</span>;
      default: return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">รอดำเนินการ</span>;
    }
  };

  const canEdit = order.status !== "DELIVERED" && order.status !== "CANCELLED";

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/orders" className="rounded-full p-2 hover:bg-gray-100 transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-foreground">รายละเอียดรายการส่งถัง #{order.orderNo}</h2>
              {getStatusBadge(order.status)}
            </div>
            <p className="text-sm text-gray-500">
              วันที่บันทึก: {dayjs(order.createdAt).format("DD/MM/YYYY HH:mm")}
            </p>
          </div>
        </div>
        
        {canEdit && (
          <Link
            href={`/dashboard/orders/${order.id}/edit`}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-border rounded-lg hover:bg-gray-50 transition-colors"
          >
            แก้ไขรายการส่งถัง
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> ข้อมูลลูกค้า
          </h3>
          
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-3 text-gray-500">
              <span>ชื่อลูกค้า</span>
              <span className="col-span-2 font-medium text-foreground">{order.customer.name}</span>
            </div>
            
            {order.customer.customerCode && (
              <div className="grid grid-cols-3 text-gray-500">
                <span>รหัสลูกค้า</span>
                <span className="col-span-2 font-medium text-foreground">{order.customer.customerCode}</span>
              </div>
            )}


          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" /> ข้อมูลการจัดส่ง
          </h3>
          
          {order.deliveryJob ? (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-3 text-gray-500">
                <span>เลขที่ใบงาน</span>
                <span className="col-span-2 font-medium text-foreground">#{order.deliveryJob.jobNo}</span>
              </div>
              <div className="grid grid-cols-3 text-gray-500">
                <span>สถานะ</span>
                <span className="col-span-2 font-medium text-foreground">
                  {order.deliveryJob.status === "DELIVERED" ? "ส่งมอบสำเร็จ" : 
                   order.deliveryJob.status === "OUT_FOR_DELIVERY" ? "กำลังจัดส่ง" : 
                   order.deliveryJob.status === "ASSIGNED" ? "มอบหมายแล้ว" : "รอดำเนินการ"}
                </span>
              </div>
              <div className="grid grid-cols-3 text-gray-500">
                <span>พนักงานจัดส่งคนที่ 1</span>
                <span className="col-span-2 font-medium text-foreground">
                  {order.deliveryJob.driver1 ? order.deliveryJob.driver1.name : "ยังไม่ระบุ"}
                </span>
              </div>
              <div className="grid grid-cols-3 text-gray-500">
                <span>พนักงานจัดส่งคนที่ 2</span>
                <span className="col-span-2 font-medium text-foreground">
                  {order.deliveryJob.driver2 ? order.deliveryJob.driver2.name : "ยังไม่ระบุ"}
                </span>
              </div>
              {order.deliveryJob.deliveredAt && (
                <div className="grid grid-cols-3 text-gray-500">
                  <span>เวลาที่ส่งสำเร็จ</span>
                  <span className="col-span-2 font-medium text-foreground">
                    {dayjs(order.deliveryJob.deliveredAt).format("DD/MM/YYYY HH:mm")}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500 text-sm">
              ไม่มีข้อมูลใบงานจัดส่งสำหรับออเดอร์นี้
            </div>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" /> รายการสินค้า
          </h3>
        </div>
        
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-6 py-3 font-medium w-16 text-center">ลำดับ</th>
              <th className="px-6 py-3 font-medium">เลขตัวถัง</th>
              <th className="px-6 py-3 font-medium">QR Code</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {order.cylinders.map((cyl, index) => (
              <tr key={cyl.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-center text-gray-500">{index + 1}</td>
                <td className="px-6 py-4 font-medium">
                  <Link href={`/dashboard/products/${cyl.id}`} className="text-primary hover:underline hover:text-primary-hover">
                    {cyl.cylinderNo}
                  </Link>
                </td>
                <td className="px-6 py-4 text-gray-500">{cyl.qrCode}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary Footer */}
        <div className="bg-gray-50 p-6 border-t border-border flex justify-end">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-lg font-bold text-foreground pt-3">
              <span className="flex items-center gap-2"><Package className="h-5 w-5" /> รวมจำนวนถัง:</span>
              <span className="text-primary">{order.cylinders.length} ใบ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
