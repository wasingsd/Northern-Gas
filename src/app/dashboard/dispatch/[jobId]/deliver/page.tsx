import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import DeliverClient from "./DeliverClient";

export default async function DeliverJobPage(props: { params: Promise<{ jobId: string }> }) {
  const params = await props.params;
  
  const job = await prisma.deliveryJob.findUnique({
    where: { id: params.jobId },
    include: {
      order: {
        include: {
          customer: true,
          cylinders: {
            include: { product: true }
          },
          items: {
            include: { product: true }
          }
        }
      },
      driver1: true,
      driver2: true,
      vehicle: true,
    }
  });

  if (!job) {
    return notFound();
  }

  if (job.status === "DELIVERED") {
    // Already delivered
    redirect("/dashboard/dispatch");
  }

  // Cylinders that were initially attached to this order (READY_TO_DISPATCH)
  const expectedCylinders = job.order.cylinders;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">ยืนยันการจัดส่ง: {job.jobNo}</h2>
        <p className="text-sm text-gray-500">สแกนถังที่ต้องการส่งให้ลูกค้า {job.order.customer.name}</p>
      </div>
      
      <DeliverClient 
        jobId={job.id} 
        expectedCylinders={expectedCylinders} 
        customer={job.order.customer} 
      />
    </div>
  );
}
