import { Truck, MapPin, Phone, CheckCircle2, User } from "lucide-react";
import DispatchBoardClient from "./DispatchBoardClient";
import DateRangeFilter from "../DateRangeFilter";
import prisma from "@/lib/prisma";

export default async function DispatchPage(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  
  // Parse dates from query params or default to today in Bangkok timezone
  const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(new Date());
  const startParam = typeof searchParams?.start === 'string' ? searchParams.start : todayStr;
  const endParam = typeof searchParams?.end === 'string' ? searchParams.end : todayStr;

  // Construct start/end dates for Prisma (Force Bangkok Time UTC+7)
  const localStartDate = new Date(`${startParam}T00:00:00+07:00`);
  const localEndDate = new Date(`${endParam}T23:59:59+07:00`);

  const jobs = await prisma.deliveryJob.findMany({
    where: {
      order: {
        status: {
          not: "PENDING"
        }
      },
      createdAt: {
        gte: localStartDate,
        lte: localEndDate,
      }
    },
    include: {
      order: {
        include: { 
          customer: {
            include: {
              cylinders: {
                where: { status: "WITH_CUSTOMER" }
              }
            }
          }, 
          cylinders: true,
          items: { include: { product: true } }
        }
      },
      driver: true,
    },
    orderBy: { createdAt: "asc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">งานจัดส่ง (Dispatch Board)</h2>
          <p className="text-sm text-gray-500">จัดการกระดานงานและมอบหมายให้พนักงานขับรถ</p>
        </div>
        <DateRangeFilter />
      </div>
      
      <DispatchBoardClient initialJobs={jobs} />
    </div>
  );
}
