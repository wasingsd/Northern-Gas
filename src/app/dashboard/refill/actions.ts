"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

// Receive a scanned QR code and return cylinder info
export async function scanCylinderForRefill(qrCode: string) {
  const cylinder = await prisma.cylinder.findUnique({
    where: { qrCode }
  });
  
  if (!cylinder) return { success: false, message: "ไม่พบถังแก๊สในระบบ" };
  
  // Can only send empty cylinders
  if (cylinder.status !== "RECEIVED_EMPTY" && cylinder.status !== "RETURN_REQUESTED") {
    return { success: false, message: `ถังแก๊สไม่ได้อยู่ในสถานะถังเปล่า (สถานะปัจจุบัน: ${cylinder.status})` };
  }
  
  return { success: true, cylinder };
}

// Create the batch
export async function createRefillBatchAction(cylinderIds: string[]) {
  if (!cylinderIds || cylinderIds.length === 0) {
    throw new Error("No cylinders provided");
  }

  const batchNo = `RF-${Date.now().toString().slice(-6)}`;

  await prisma.refillBatch.create({
    data: {
      batchNo,
      status: "SENT",
      cylinders: {
        connect: cylinderIds.map(id => ({ id }))
      }
    }
  });

  // Update all cylinders to IN_PROCESS
  await prisma.cylinder.updateMany({
    where: { id: { in: cylinderIds } },
    data: { status: "IN_PROCESS" }
  });

  // Logs
  for (const id of cylinderIds) {
    await prisma.cylinderLog.create({
      data: {
        cylinderId: id,
        status: "IN_PROCESS",
        notes: `ส่งบรรจุรอบ ${batchNo}`
      }
    });
  }

  revalidatePath("/dashboard/refill");
  revalidatePath("/dashboard/cylinders");
  redirect("/dashboard/refill");
}

// Receive back a batch from the plant
export async function receiveRefillBatchAction(batchId: string) {
  const batch = await prisma.refillBatch.findUnique({
    where: { id: batchId },
    include: { cylinders: true }
  });

  if (!batch || batch.status === "RECEIVED") return;

  await prisma.refillBatch.update({
    where: { id: batchId },
    data: {
      status: "RECEIVED",
      receivedAt: new Date()
    }
  });

  // Update cylinders to READY_TO_DISPATCH
  await prisma.cylinder.updateMany({
    where: { refillBatchId: batchId },
    data: { status: "READY_TO_DISPATCH" }
  });

  for (const cyl of batch.cylinders) {
    await prisma.cylinderLog.create({
      data: {
        cylinderId: cyl.id,
        status: "READY_TO_DISPATCH",
        notes: `รับกลับจากโรงบรรจุ (รอบ ${batch.batchNo})`
      }
    });
  }

  revalidatePath("/dashboard/refill");
  revalidatePath("/dashboard/cylinders");
}
