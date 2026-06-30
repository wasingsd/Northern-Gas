"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCylinderOwnerAction(formData: FormData) {
  const name = formData.get("name")?.toString();

  if (!name) {
    throw new Error("กรุณากรอกชื่อเจ้าของถัง");
  }

  await prisma.cylinderOwner.create({
    data: { name },
  });

  revalidatePath("/dashboard/settings/owners");
  revalidatePath("/dashboard/products");
  return { success: true };
}

export async function updateCylinderOwnerAction(id: string, formData: FormData) {
  const name = formData.get("name")?.toString();

  if (!name) {
    throw new Error("กรุณากรอกชื่อเจ้าของถัง");
  }

  await prisma.cylinderOwner.update({
    where: { id },
    data: { name },
  });

  revalidatePath("/dashboard/settings/owners");
  revalidatePath("/dashboard/products");
  return { success: true };
}

export async function deleteCylinderOwnerAction(id: string) {
  // Check if owner is used by cylinders
  const count = await prisma.cylinder.count({ where: { ownerId: id } });
  if (count > 0) {
    throw new Error("ไม่สามารถลบได้ เนื่องจากมีรายการถังแก๊สที่ระบุว่าเป็นของเจ้าของนี้อยู่");
  }

  await prisma.cylinderOwner.delete({
    where: { id },
  });

  revalidatePath("/dashboard/settings/owners");
  revalidatePath("/dashboard/products");
}
