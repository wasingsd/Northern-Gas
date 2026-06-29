"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";

export async function createCylinderAction(formData: FormData) {
  const cylinderNo = formData.get("cylinderNo") as string;
  const qrCode = formData.get("qrCode") as string;
  const cylinderCode = formData.get("cylinderCode") as string;
  const redirectTo = formData.get("redirectTo") as string || "/dashboard/products";
  
  if (!cylinderNo || !qrCode) throw new Error("Missing required fields");

  const cylinder = await prisma.cylinder.create({
    data: {
      cylinderNo,
      qrCode,
      cylinderCode,
      status: "READY_TO_DISPATCH", // default status
    }
  });

  await prisma.cylinderLog.create({
    data: {
      cylinderId: cylinder.id,
      status: "READY_TO_DISPATCH",
      notes: "ขึ้นทะเบียนสินค้าใหม่เข้าระบบ"
    }
  });

  revalidatePath(redirectTo);
  redirect(redirectTo);
}

export async function updateCylinderAction(id: string, formData: FormData) {
  const cylinderNo = formData.get("cylinderNo") as string;
  const qrCode = formData.get("qrCode") as string;
  const cylinderCode = formData.get("cylinderCode") as string;
  const redirectTo = formData.get("redirectTo") as string || `/dashboard/products/${id}`;
  
  if (!cylinderNo || !qrCode) throw new Error("Missing required fields");

  await prisma.cylinder.update({
    where: { id },
    data: {
      cylinderNo,
      qrCode,
      cylinderCode,
    }
  });

  revalidatePath(redirectTo);
  redirect(redirectTo);
}

export async function deleteCylinderAction(id: string) {
  // We can also let the client component pass a custom path to revalidate if needed,
  // but for now revalidatePath("/dashboard/cylinders") and "/dashboard/products" works.
  await prisma.cylinderLog.deleteMany({
    where: { cylinderId: id }
  });

  await prisma.cylinder.delete({
    where: { id }
  });

  revalidatePath("/dashboard/cylinders");
  // We don't have a specific way to know which product page to revalidate here without changing the API,
  // but next.js will eventually revalidate. To be safe, we can revalidate the general layout or products.
  revalidatePath("/dashboard/products", "layout");
}
