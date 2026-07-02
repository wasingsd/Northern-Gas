"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CylinderSchema } from "@/lib/validations";

export async function createCylinderAction(formData: FormData) {
  const cylinderNo = formData.get("cylinderNo") as string;
  const qrCode = formData.get("qrCode") as string;
  const productId = formData.get("productId") as string;
  const ownerId = (formData.get("ownerId") as string) || null;
  const initialStatus = (formData.get("initialStatus") as string) || "READY_TO_DISPATCH";
  const redirectTo = formData.get("redirectTo") as string || "/dashboard/products";
  
  const parsed = CylinderSchema.safeParse({ cylinderNo, qrCode, productId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const cylinder = await prisma.cylinder.create({
    data: {
      cylinderNo,
      qrCode,
      productId,
      ownerId,
      status: initialStatus,
    }
  });

  await prisma.cylinderLog.create({
    data: {
      cylinderId: cylinder.id,
      status: initialStatus,
      notes: initialStatus === "READY_TO_DISPATCH" ? "ขึ้นทะเบียนสินค้าใหม่ (ถังเติมแล้ว)" : "ขึ้นทะเบียนสินค้าใหม่ (ถังเปล่า)"
    }
  });

  revalidatePath(redirectTo);
  redirect(redirectTo);
}

export async function updateCylinderAction(id: string, formData: FormData) {
  const cylinderNo = formData.get("cylinderNo") as string;
  const qrCode = formData.get("qrCode") as string;
  const productId = formData.get("productId") as string;
  const ownerId = (formData.get("ownerId") as string) || null;
  const redirectTo = formData.get("redirectTo") as string || `/dashboard/products/${id}`;
  
  const parsed = CylinderSchema.safeParse({ cylinderNo, qrCode, productId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  await prisma.cylinder.update({
    where: { id },
    data: {
      cylinderNo,
      qrCode,
      productId,
      ownerId,
    }
  });

  revalidatePath(redirectTo);
  redirect(redirectTo);
}

export async function deleteCylinderAction(id: string) {
  await prisma.cylinder.delete({
    where: { id },
  });
  revalidatePath("/dashboard/products");
}
