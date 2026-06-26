"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function createCylinderAction(formData: FormData) {
  const assetCode = formData.get("assetCode") as string;
  const qrCode = formData.get("qrCode") as string;
  const productId = formData.get("productId") as string;
  
  if (!assetCode || !qrCode || !productId) throw new Error("Missing required fields");

  const cylinder = await prisma.cylinder.create({
    data: {
      assetCode,
      qrCode,
      productId,
      status: "READY_TO_DISPATCH", // default status
    }
  });

  await prisma.cylinderLog.create({
    data: {
      cylinderId: cylinder.id,
      status: "READY_TO_DISPATCH",
      notes: "ลงทะเบียนถังใหม่เข้าระบบ"
    }
  });

  revalidatePath("/dashboard/cylinders");
  redirect("/dashboard/cylinders");
}

export async function updateCylinderAction(id: string, formData: FormData) {
  const assetCode = formData.get("assetCode") as string;
  const qrCode = formData.get("qrCode") as string;
  const productId = formData.get("productId") as string;
  
  if (!assetCode || !qrCode || !productId) throw new Error("Missing required fields");

  await prisma.cylinder.update({
    where: { id },
    data: {
      assetCode,
      qrCode,
      productId,
    }
  });

  revalidatePath("/dashboard/cylinders");
  redirect("/dashboard/cylinders");
}

export async function deleteCylinderAction(id: string) {
  // Delete logs first due to foreign key constraints
  await prisma.cylinderLog.deleteMany({
    where: { cylinderId: id }
  });

  // Then delete cylinder
  await prisma.cylinder.delete({
    where: { id }
  });

  revalidatePath("/dashboard/cylinders");
}
