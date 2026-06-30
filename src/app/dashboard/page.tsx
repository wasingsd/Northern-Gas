import { PackageOpen, CheckCircle2, Clock, AlertTriangle, Database, RefreshCw, Truck, DollarSign } from "lucide-react";

import prisma from "@/lib/prisma";
import DashboardTimeline from "./DashboardTimeline";

import DateRangeFilter from "./DateRangeFilter";

export default async function DashboardPage(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  
  // Parse dates from query params or default to today in Bangkok timezone
  const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(new Date());
  const startParam = typeof searchParams?.start === 'string' ? searchParams.start : todayStr;
  const endParam = typeof searchParams?.end === 'string' ? searchParams.end : todayStr;

  // Construct start/end dates for Prisma (Force Bangkok Time UTC+7)
  const localStartDate = new Date(`${startParam}T00:00:00+07:00`);
  const localEndDate = new Date(`${endParam}T23:59:59+07:00`);

  // 1. Order stats in period
  const ordersInPeriod = await prisma.order.count({
    where: { createdAt: { gte: localStartDate, lte: localEndDate } }
  });

  // 2. Dispatch stats
  const activeDispatches = await prisma.deliveryJob.count({
    where: { status: { in: ["WAITING", "OUT_FOR_DELIVERY"] } }
  });
  
  const deliveredInPeriod = await prisma.deliveryJob.count({
    where: { 
      status: "DELIVERED",
      updatedAt: { gte: localStartDate, lte: localEndDate }
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

  // 4. Cylinders Sold in period
  const periodOrders = await prisma.order.findMany({
    where: {
      createdAt: { gte: localStartDate, lte: localEndDate },
      status: { not: "CANCELLED" }
    },
    include: { cylinders: true }
  });
  
  const cylindersSoldInPeriod = periodOrders.reduce((sum, order) => sum + order.cylinders.length, 0);

  // 5. Timeline Logs
  const logs = await prisma.cylinderLog.findMany({
    where: {
      createdAt: { gte: localStartDate, lte: localEndDate }
    },
    include: { cylinder: true },
    orderBy: { createdAt: "desc" },
    take: 100, // Show max 100 to prevent performance issues
  });

  // Plain objects for client component
  const plainLogs = JSON.parse(JSON.stringify(logs));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-foreground">ภาพรวมระบบ (Dashboard)</h2>
        <DateRangeFilter />
      </div>
      
      {/* Primary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-blue-50 p-3">
              <PackageOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">ถังที่ขายได้ในรอบนี้</p>
              <h3 className="text-2xl font-bold text-foreground">{cylindersSoldInPeriod} <span className="text-base font-normal text-gray-500">ถัง</span></h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-indigo-50 p-3">
              <PackageOpen className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">ออเดอร์ในรอบนี้</p>
              <h3 className="text-2xl font-bold text-foreground">{ordersInPeriod}</h3>
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
              <p className="text-sm font-medium text-gray-500">ส่งสำเร็จในรอบนี้</p>
              <h3 className="text-2xl font-bold text-foreground">{deliveredInPeriod}</h3>
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

      {/* Timeline Section */}
      <DashboardTimeline logs={plainLogs} />
    </div>
  );
}
