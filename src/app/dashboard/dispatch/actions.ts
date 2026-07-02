"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

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

export async function finishDeliveryJobAction(jobId: string, scannedCylinderNos: string[]) {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  let deliveredById = null;

  if (supabaseUser) {
    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { supabaseId: supabaseUser.id },
          { email: supabaseUser.email ?? "" },
        ],
      },
    });
    if (dbUser) deliveredById = dbUser.id;
  }

  const job = await prisma.deliveryJob.findUnique({
    where: { id: jobId },
    include: { order: { include: { cylinders: true } } }
  });

  if (!job) throw new Error("ไม่พบงานจัดส่งนี้");
  if (job.status === "DELIVERED") throw new Error("งานนี้ถูกจัดส่งไปแล้ว");

  const expectedCylinders = job.order.cylinders;
  const scanned = expectedCylinders.filter(c => scannedCylinderNos.includes(c.cylinderNo));
  const missing = expectedCylinders.filter(c => !scannedCylinderNos.includes(c.cylinderNo));

  if (scanned.length === 0) {
    throw new Error("กรุณาสแกนอย่างน้อย 1 ถัง หรือใช้การยกเลิกงานแทน");
  }

  // Generate Receipt No
  const datePrefix = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date()).replace(/-/g, '').slice(2);
  const lastReceipt = await prisma.deliveryReceipt.findFirst({
    where: { receiptNo: { startsWith: `DO-${datePrefix}` } },
    orderBy: { createdAt: 'desc' }
  });
  let nextSeq = 1;
  if (lastReceipt && lastReceipt.receiptNo) {
    const match = lastReceipt.receiptNo.match(/(\d{3})$/);
    if (match) nextSeq = parseInt(match[1], 10) + 1;
  }
  const receiptNo = `DO-${datePrefix}${nextSeq.toString().padStart(3, '0')}`;

  // Use transaction to ensure consistency
  const receipt = await prisma.$transaction(async (tx) => {
    // 1. Update job & order
    await tx.deliveryJob.update({
      where: { id: jobId },
      data: { status: "DELIVERED", deliveredAt: new Date() }
    });
    await tx.order.update({
      where: { id: job.orderId },
      data: { status: "COMPLETED" }
    });

    // 2. Create DeliveryReceipt
    const newReceipt = await tx.deliveryReceipt.create({
      data: {
        receiptNo,
        deliveryJobId: jobId,
        deliveredById,
        items: {
          create: scanned.map(c => ({ cylinderId: c.id }))
        }
      }
    });

    // 3. Update Scanned Cylinders
    if (scanned.length > 0) {
      await tx.cylinder.updateMany({
        where: { id: { in: scanned.map(c => c.id) } },
        data: { status: "WITH_CUSTOMER", currentCustomerId: job.order.customerId }
      });
      await tx.cylinderLog.createMany({
        data: scanned.map(c => ({
          cylinderId: c.id,
          status: "WITH_CUSTOMER",
          notes: `ส่งมอบให้ลูกค้าสำเร็จ (Receipt: ${receiptNo})`
        }))
      });
    }

    // 4. Update Missing Cylinders
    if (missing.length > 0) {
      await tx.cylinder.updateMany({
        where: { id: { in: missing.map(c => c.id) } },
        data: { status: "MISSING" } // ตกหล่น
      });
      await tx.cylinderLog.createMany({
        data: missing.map(c => ({
          cylinderId: c.id,
          status: "MISSING",
          notes: `ตกหล่นจากการจัดส่ง (Job: ${job.jobNo})`
        }))
      });
    }

    return newReceipt;
  });

  revalidatePath("/dashboard/dispatch");
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/cylinders");

  return { success: true, receiptId: receipt.id, redirectTo: "/dashboard/dispatch" };
}
