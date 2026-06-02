import { PrismaClient } from "@prisma/client";
import { Truck, MapPin, Phone, CheckCircle2, User } from "lucide-react";
import DispatchBoardClient from "./DispatchBoardClient";

const prisma = new PrismaClient();

export default async function DispatchPage() {
  const jobs = await prisma.deliveryJob.findMany({
    include: {
      order: {
        include: { customer: true, items: { include: { product: true } } }
      },
      driver: true,
    },
    orderBy: { createdAt: "asc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">งานจัดส่ง (Dispatch Board)</h2>
          <p className="text-sm text-gray-500">จัดการกระดานงานและมอบหมายให้พนักงานขับรถ</p>
        </div>
      </div>
      
      <DispatchBoardClient initialJobs={jobs} />
    </div>
  );
}
