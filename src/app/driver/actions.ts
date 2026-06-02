"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

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
    include: { order: { include: { items: true } } }
  });

  if (!job) throw new Error("Job not found");

  await prisma.deliveryJob.update({
    where: { id: jobId },
    data: { status: "DELIVERED" }
  });

  await prisma.order.update({
    where: { id: job.orderId },
    data: { status: "COMPLETED", paymentStatus: "PAID" }
  });

  revalidatePath("/driver");
  revalidatePath(`/driver/${jobId}`);
  revalidatePath("/dashboard/dispatch");
}
