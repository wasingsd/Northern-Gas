"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function processReturnReceipt(customerId: string, driverId: string | null, cylinderNos: string[]) {
  if (!customerId) throw new Error("กรุณาเลือกลูกค้า");
  if (cylinderNos.length === 0) throw new Error("กรุณาระบุถังที่รับคืนอย่างน้อย 1 ใบ");

  // Verify all cylinders exist
  const cylinders = await prisma.cylinder.findMany({
    where: { cylinderNo: { in: cylinderNos } }
  });

  if (cylinders.length !== cylinderNos.length) {
    throw new Error("พบหมายเลขถังที่ไม่ถูกต้องในระบบ (โปรดตรวจสอบอีกครั้ง)");
  }

  // Generate Receipt No
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const count = await prisma.returnReceipt.count({
    where: { receiptNo: { startsWith: `RT-${dateStr}` } }
  });
  const receiptNo = `RT-${dateStr}${(count + 1).toString().padStart(3, '0')}`;

  // Use a transaction
  const receipt = await prisma.$transaction(async (tx) => {
    // 1. Create Return Receipt
    const newReceipt = await tx.returnReceipt.create({
      data: {
        receiptNo,
        customerId,
        driverId,
        items: {
          create: cylinders.map(c => ({
            cylinderId: c.id
          }))
        }
      }
    });

    // 2. Update Cylinders
    for (const c of cylinders) {
      await tx.cylinder.update({
        where: { id: c.id },
        data: {
          status: "RETURN_REQUESTED",
        }
      });
      
      await tx.cylinderLog.create({
        data: {
          cylinderId: c.id,
          status: "RETURN_REQUESTED",
          notes: `รอตรวจสอบรับคืน (ใบรับ: ${receiptNo})`
        }
      });
    }

    return newReceipt;
  });

  revalidatePath("/dashboard/returns");
  revalidatePath("/dashboard/returns");
  redirect("/dashboard/returns");
}

export async function confirmReturnReceiptAction(receiptId: string) {
  const receipt = await prisma.returnReceipt.findUnique({
    where: { id: receiptId },
    include: { items: { include: { cylinder: true } } }
  });

  if (!receipt) throw new Error("ไม่พบรายการรับคืน");
  if (receipt.status === "COMPLETED") throw new Error("รายการนี้ถูกอนุมัติไปแล้ว");

  await prisma.$transaction(async (tx) => {
    // 1. Update receipt status
    await tx.returnReceipt.update({
      where: { id: receiptId },
      data: { status: "COMPLETED" }
    });

    // 2. Update cylinders to RECEIVED_EMPTY and remove from customer
    for (const item of receipt.items) {
      await tx.cylinder.update({
        where: { id: item.cylinderId },
        data: {
          status: "RECEIVED_EMPTY",
          currentCustomerId: null,
          orderId: null
        }
      });

      await tx.cylinderLog.create({
        data: {
          cylinderId: item.cylinderId,
          status: "RECEIVED_EMPTY",
          notes: `อนุมัติรับคืนเข้าคลัง (ใบรับ: ${receipt.receiptNo})`
        }
      });
    }
  });

  revalidatePath("/dashboard/returns");
}

export async function cancelReturnReceiptAction(receiptId: string) {
  const receipt = await prisma.returnReceipt.findUnique({
    where: { id: receiptId },
    include: { items: { include: { cylinder: true } } }
  });

  if (!receipt) throw new Error("ไม่พบรายการรับคืน");
  if (receipt.status === "COMPLETED") throw new Error("รายการที่อนุมัติแล้วไม่สามารถยกเลิกได้");

  await prisma.$transaction(async (tx) => {
    // 1. Revert cylinders back to WITH_CUSTOMER
    for (const item of receipt.items) {
      await tx.cylinder.update({
        where: { id: item.cylinderId },
        data: {
          status: "WITH_CUSTOMER"
        }
      });

      await tx.cylinderLog.create({
        data: {
          cylinderId: item.cylinderId,
          status: "WITH_CUSTOMER",
          notes: `ยกเลิกรายการรับคืน (${receipt.receiptNo})`
        }
      });
    }

    // 2. Delete the receipt
    await tx.returnReceipt.delete({
      where: { id: receiptId }
    });
  });

  revalidatePath("/dashboard/returns");
}
