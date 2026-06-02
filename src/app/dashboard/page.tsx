import { PackageOpen, CheckCircle2, Clock, AlertTriangle, Database, RefreshCw, Truck, DollarSign } from "lucide-react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 1. Order stats for today
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const ordersToday = await prisma.order.count({
    where: { createdAt: { gte: startOfDay } }
  });

  // 2. Dispatch stats
  const activeDispatches = await prisma.deliveryJob.count({
    where: { status: { in: ["WAITING", "OUT_FOR_DELIVERY"] } }
  });
  
  const deliveredToday = await prisma.deliveryJob.count({
    where: { 
      status: "DELIVERED",
      updatedAt: { gte: startOfDay }
    }
  });

  // 3. Cylinder Stats
  const cylinders = await prisma.cylinder.groupBy({
    by: ['status'],
    _count: { id: true }
  });
  
  const getCylCount = (status: string) => {
    return cylinders.find(c => c.status === status)?._count.id || 0;
  };

  const readyCount = getCylCount("READY_TO_DISPATCH");
  const emptyCount = getCylCount("RECEIVED_EMPTY");
  const inProcessCount = getCylCount("IN_PROCESS");
  const withCustomerCount = getCylCount("WITH_CUSTOMER");

  // 4. Monthly Cylinders Sold
  const monthlyItems = await prisma.orderItem.findMany({
    where: {
      order: {
        createdAt: { gte: startOfMonth },
        status: { not: "CANCELLED" }
      }
    },
    select: { quantity: true }
  });
  
  const monthlyCylindersSold = monthlyItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">ภาพรวมระบบ (Dashboard)</h2>
      
      {/* Primary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-blue-50 p-3">
              <PackageOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">ถังที่ขายได้เดือนนี้</p>
              <h3 className="text-2xl font-bold text-foreground">{monthlyCylindersSold} <span className="text-base font-normal text-gray-500">ถัง</span></h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-indigo-50 p-3">
              <PackageOpen className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">ออเดอร์วันนี้</p>
              <h3 className="text-2xl font-bold text-foreground">{ordersToday}</h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-yellow-50 p-3">
              <Truck className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">งานรอดำเนินการ</p>
              <h3 className="text-2xl font-bold text-foreground">{activeDispatches}</h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-green-50 p-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">ส่งสำเร็จวันนี้</p>
              <h3 className="text-2xl font-bold text-foreground">{deliveredToday}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Overview */}
      <h3 className="text-xl font-bold text-foreground pt-4">สถานะสต็อกถังแก๊ส</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm flex flex-col items-center text-center">
          <div className="rounded-full bg-green-100 p-4 mb-3">
            <Database className="h-8 w-8 text-green-700" />
          </div>
          <h3 className="text-3xl font-bold text-foreground">{readyCount}</h3>
          <p className="text-sm font-medium text-gray-600 mt-1">ถังพร้อมขาย</p>
        </div>

        <div className="rounded-xl border border-border bg-white p-6 shadow-sm flex flex-col items-center text-center">
          <div className="rounded-full bg-gray-100 p-4 mb-3">
            <RefreshCw className="h-8 w-8 text-gray-600" />
          </div>
          <h3 className="text-3xl font-bold text-foreground">{emptyCount}</h3>
          <p className="text-sm font-medium text-gray-600 mt-1">ถังเปล่ารอส่งบรรจุ</p>
        </div>

        <div className="rounded-xl border border-border bg-white p-6 shadow-sm flex flex-col items-center text-center">
          <div className="rounded-full bg-yellow-100 p-4 mb-3">
            <Clock className="h-8 w-8 text-yellow-700" />
          </div>
          <h3 className="text-3xl font-bold text-foreground">{inProcessCount}</h3>
          <p className="text-sm font-medium text-gray-600 mt-1">ถังอยู่โรงบรรจุ</p>
        </div>

        <div className="rounded-xl border border-border bg-white p-6 shadow-sm flex flex-col items-center text-center">
          <div className="rounded-full bg-blue-100 p-4 mb-3">
            <PackageOpen className="h-8 w-8 text-blue-700" />
          </div>
          <h3 className="text-3xl font-bold text-foreground">{withCustomerCount}</h3>
          <p className="text-sm font-medium text-gray-600 mt-1">ถังอยู่กับลูกค้า (รอคืน)</p>
        </div>
      </div>
    </div>
  );
}
