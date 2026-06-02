"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function processScanAction(qrCode: string, mode: string, customerId?: string) {
  if (!qrCode) throw new Error("Please provide a QR Code");

  const cylinder = await prisma.cylinder.findUnique({
    where: { qrCode }
  });

  if (!cylinder) {
    return { success: false, message: `ไม่พบถังแก๊สที่มี QR Code: ${qrCode} ในระบบ` };
  }

  let newStatus = "";
  let newCustomerId = cylinder.currentCustomerId;

  switch (mode) {
    case "RECEIVE_EMPTY":
      newStatus = "RECEIVED_EMPTY";
      newCustomerId = null;
      break;
    case "READY":
      newStatus = "READY_TO_DISPATCH";
      newCustomerId = null;
      break;
    case "DELIVER":
      if (!customerId) return { success: false, message: "กรุณาระบุลูกค้าที่รับถัง" };
      newStatus = "WITH_CUSTOMER";
      newCustomerId = customerId;
      break;
    default:
      return { success: false, message: "โหมดสแกนไม่ถูกต้อง" };
  }

  // Update cylinder
  await prisma.cylinder.update({
    where: { id: cylinder.id },
    data: { 
      status: newStatus,
      currentCustomerId: newCustomerId
    }
  });

  // Create log
  await prisma.cylinderLog.create({
    data: {
      cylinderId: cylinder.id,
      status: newStatus,
      notes: `อัปเดตผ่านระบบสแกน (${mode})`
    }
  });

  return { 
    success: true, 
    message: `สแกนสำเร็จ: อัปเดตถัง ${cylinder.assetCode} เป็นสถานะ ${newStatus}` 
  };
}
