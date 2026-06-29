"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";

export async function acceptJobAction(jobId: string) {
  await prisma.deliveryJob.update({
    where: { id: jobId },
    data: { status: "OUT_FOR_DELIVERY" }
  });
  
  revalidatePath("/driver");
  revalidatePath(`/driver/${jobId}`);
  revalidatePath("/dashboard/dispatch");
}

export async function completeJobAction(jobId: string) {
  const job = await prisma.deliveryJob.findUnique({
    where: { id: jobId },
    include: { order: { include: { cylinders: true } } }
  });

  if (!job) throw new Error("Job not found");

  await prisma.deliveryJob.update({
    where: { id: jobId },
    data: { status: "DELIVERED" }
  });

  await prisma.order.update({
    where: { id: job.orderId },
    data: { status: "COMPLETED" }
  });

  // Update cylinder statuses to WITH_CUSTOMER
  if (job.order.cylinders.length > 0) {
    const cylinderIds = job.order.cylinders.map(c => c.id);
    
    await prisma.cylinder.updateMany({
      where: { id: { in: cylinderIds } },
      data: { status: "WITH_CUSTOMER" }
    });

    const logs = cylinderIds.map(cId => ({
      cylinderId: cId,
      status: "WITH_CUSTOMER",
      notes: `ส่งมอบถังให้ลูกค้าสำเร็จ (${job.order.orderNo})`
    }));

    await prisma.cylinderLog.createMany({
      data: logs
    });
  }

  revalidatePath("/driver");
  revalidatePath(`/driver/${jobId}`);
  revalidatePath("/dashboard/dispatch");
}
