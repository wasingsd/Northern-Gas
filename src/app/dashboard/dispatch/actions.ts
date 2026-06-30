"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";

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

    // Find cylinders in this order
    const orderCylinders = await prisma.cylinder.findMany({
      where: { orderId: job.orderId }
    });

    if (orderCylinders.length > 0) {
      // Update cylinders to WITH_CUSTOMER
      await prisma.cylinder.updateMany({
        where: { orderId: job.orderId },
        data: { status: 'WITH_CUSTOMER', currentCustomerId: job.order.customerId }
      });

      // Create logs
      const logs = orderCylinders.map(c => ({
        cylinderId: c.id,
        status: 'WITH_CUSTOMER',
        notes: `ส่งมอบให้ลูกค้าสำเร็จ (Job: ${job.jobNo})`
      }));

      await prisma.cylinderLog.createMany({
        data: logs
      });
    }
  }

  revalidatePath("/dashboard/dispatch");
  revalidatePath("/dashboard/orders");
}
