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

  // Run all queries in parallel for better performance
  const [
    ordersInPeriod,
    activeDispatches,
    deliveredInPeriod,
    cylinders,
    cylindersSoldInPeriod,
    logs
  ] = await Promise.all([
    // 1. Order stats in period
    prisma.order.count({
      where: { createdAt: { gte: localStartDate, lte: localEndDate } }
    }),
    // 2. Dispatch stats (Active)
    prisma.deliveryJob.count({
      where: { status: { in: ["WAITING", "OUT_FOR_DELIVERY"] } }
    }),
    // 3. Dispatch stats (Delivered)
    prisma.deliveryJob.count({
      where: { 
        status: "DELIVERED",
        updatedAt: { gte: localStartDate, lte: localEndDate }
      }
    }),
    // 4. Cylinder Stats Grouped by Status
    prisma.cylinder.groupBy({
      by: ['status'],
      _count: { id: true }
    }),
    // 5. Cylinders Sold in period (using aggregate instead of findMany + reduce)
    prisma.cylinder.count({
      where: {
        order: {
          createdAt: { gte: localStartDate, lte: localEndDate },
          status: { not: "CANCELLED" }
        }
      }
    }),
    // 6. Timeline Logs
    prisma.cylinderLog.findMany({
      where: {
        createdAt: { gte: localStartDate, lte: localEndDate }
      },
      include: { cylinder: true },
      orderBy: { createdAt: "desc" },
      take: 100, // Show max 100 to prevent performance issues
    })
  ]);

  const getCylCount = (status: string) => {
    return cylinders.find(c => c.status === status)?._count.id || 0;
  };

  const readyCount = getCylCount("READY_TO_DISPATCH");
  const emptyCount = getCylCount("RECEIVED_EMPTY");
  const inProcessCount = getCylCount("IN_PROCESS");
  const withCustomerCount = getCylCount("WITH_CUSTOMER");

  // Plain objects for client component
  const plainLogs = JSON.parse(JSON.stringify(logs));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-foreground">ภาพรวมระบบ (Dashboard)</h2>
        <DateRangeFilter />
      </div>
      
      {/* Primary Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-white p-4 md:p-6 shadow-sm flex flex-col items-center text-center">
          <div className="rounded-full bg-blue-50 p-4 mb-3">
            <PackageOpen className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-3xl font-bold text-foreground">{cylindersSoldInPeriod}</h3>
          <p className="text-xs sm:text-sm font-medium text-gray-600 mt-1">ขายได้ในรอบนี้</p>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 md:p-6 shadow-sm flex flex-col items-center text-center">
          <div className="rounded-full bg-indigo-50 p-4 mb-3">
            <PackageOpen className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-3xl font-bold text-foreground">{ordersInPeriod}</h3>
          <p className="text-xs sm:text-sm font-medium text-gray-600 mt-1">ออเดอร์ในรอบนี้</p>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 md:p-6 shadow-sm flex flex-col items-center text-center">
          <div className="rounded-full bg-yellow-50 p-4 mb-3">
            <Truck className="h-8 w-8 text-yellow-600" />
          </div>
          <h3 className="text-3xl font-bold text-foreground">{activeDispatches}</h3>
          <p className="text-xs sm:text-sm font-medium text-gray-600 mt-1">งานรอดำเนินการ</p>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 md:p-6 shadow-sm flex flex-col items-center text-center">
          <div className="rounded-full bg-green-50 p-4 mb-3">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-3xl font-bold text-foreground">{deliveredInPeriod}</h3>
          <p className="text-xs sm:text-sm font-medium text-gray-600 mt-1">ส่งสำเร็จรอบนี้</p>
        </div>
      </div>

      {/* Stock Overview */}
      <h3 className="text-xl font-bold text-foreground pt-4">สถานะสต็อกถังแก๊ส</h3>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-white p-4 md:p-6 shadow-sm flex flex-col items-center text-center">
          <div className="rounded-full bg-green-100 p-4 mb-3">
            <Database className="h-8 w-8 text-green-700" />
          </div>
          <h3 className="text-3xl font-bold text-foreground">{readyCount}</h3>
          <p className="text-sm font-medium text-gray-600 mt-1">ถังพร้อมขาย</p>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 md:p-6 shadow-sm flex flex-col items-center text-center">
          <div className="rounded-full bg-gray-100 p-4 mb-3">
            <RefreshCw className="h-8 w-8 text-gray-600" />
          </div>
          <h3 className="text-3xl font-bold text-foreground">{emptyCount}</h3>
          <p className="text-sm font-medium text-gray-600 mt-1">ถังเปล่ารอส่งบรรจุ</p>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 md:p-6 shadow-sm flex flex-col items-center text-center">
          <div className="rounded-full bg-yellow-100 p-4 mb-3">
            <Clock className="h-8 w-8 text-yellow-700" />
          </div>
          <h3 className="text-3xl font-bold text-foreground">{inProcessCount}</h3>
          <p className="text-sm font-medium text-gray-600 mt-1">ถังอยู่โรงบรรจุ</p>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 md:p-6 shadow-sm flex flex-col items-center text-center">
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
