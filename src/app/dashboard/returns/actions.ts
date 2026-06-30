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
          status: "RECEIVED_EMPTY",
          currentCustomerId: null,
          orderId: null
        }
      });
      
      await tx.cylinderLog.create({
        data: {
          cylinderId: c.id,
          status: "RECEIVED_EMPTY",
          notes: `รับคืนจากลูกค้าเข้าคลัง (ใบรับ: ${receiptNo})`
        }
      });
    }

    return newReceipt;
  });

  revalidatePath("/dashboard/returns");
  redirect(`/print/returns/${receipt.id}`);
}
