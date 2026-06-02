"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function updateDispatchStatus(jobId: string, newStatus: string) {
  const job = await prisma.deliveryJob.update({
    where: { id: jobId },
    data: { 
      status: newStatus,
      ...(newStatus === 'DELIVERED' ? { deliveredAt: new Date() } : {})
    },
    include: { order: true }
  });
  
  if (newStatus === 'DELIVERED' && job.orderId) {
    await prisma.order.update({
      where: { id: job.orderId },
      data: { status: 'COMPLETED' }
    });
  }

  revalidatePath("/dashboard/dispatch");
  revalidatePath("/dashboard/orders");
}
