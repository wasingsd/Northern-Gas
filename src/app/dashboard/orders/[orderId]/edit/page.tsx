import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { updateOrderAction } from "../../actions";
import OrderItemsForm from "../../new/OrderItemsForm";
import CustomerSection from "../../new/CustomerSection";
import OrderFormClient from "../../new/OrderFormClient";
import VehicleSection from "../../new/VehicleSection";
import { notFound } from "next/navigation";

import prisma from "@/lib/prisma";

export default async function EditOrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      cylinders: true,
      deliveryJob: true
    }
  });

  if (!order) return notFound();

  // Only allow editing pending or processing orders
  if (order.status === "DELIVERED" || order.status === "CANCELLED") {
    return (
      <div className="p-6 text-center space-y-4">
        <h2 className="text-xl font-bold text-red-600">ไม่สามารถแก้ไขออเดอร์นี้ได้</h2>
        <p className="text-gray-600">ออเดอร์ที่ถูกจัดส่งแล้วหรือถูกยกเลิก จะไม่สามารถแก้ไขข้อมูลได้</p>
        <Link href={`/dashboard/orders/${order.id}`} className="text-primary hover:underline block">
          กลับไปหน้ารายละเอียดออเดอร์
        </Link>
      </div>
    );
  }

  const customers = await prisma.customer.findMany({ orderBy: { name: "asc" } });
  
  // We need to fetch cylinders that are either available or already attached to this order
  const allCylinders = await prisma.cylinder.findMany({
    where: {
      OR: [
        { orderId: null, currentCustomerId: null, status: { not: "WITH_CUSTOMER" } },
        { orderId: order.id }
      ]
    }
  });
  
  const vehicles = await prisma.vehicle.findMany({ orderBy: { registration: "asc" } });
  const drivers = await prisma.user.findMany({ 
    select: { id: true, name: true },
    orderBy: { name: "asc" }
  });

  // Get cylinders that are currently associated with this order
  const orderCylinders = await prisma.cylinder.findMany({
    where: { orderId: order.id }
  });

  const updateActionWithId = updateOrderAction.bind(null, order.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/orders/${order.id}`} className="rounded-full p-2 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-foreground">แก้ไขออเดอร์ #{order.orderNo}</h2>
          <p className="text-sm text-gray-500">อัปเดตข้อมูลลูกค้าและรายการสินค้า</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <OrderFormClient action={updateActionWithId}>
          <CustomerSection customers={customers} initialData={order.customer} defaultInvoiceNo={order.invoiceNo || ""} />
          
          <VehicleSection 
            vehicles={vehicles} 
            drivers={drivers}
            defaultVehicleId={order.deliveryJob?.vehicleId || ""} 
            defaultDriver1Id={order.deliveryJob?.driver1Id || ""}
            defaultDriver2Id={order.deliveryJob?.driver2Id || ""}
            defaultAddress={order.deliveryJob?.address || ""}
          />
          
          <OrderItemsForm cylinders={allCylinders} initialItems={orderCylinders} />

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
            <Link
              href={`/dashboard/orders/${order.id}`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-border rounded-lg hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
            >
              บันทึกการแก้ไข
            </button>
          </div>
        </OrderFormClient>
      </div>
    </div>
  );
}
