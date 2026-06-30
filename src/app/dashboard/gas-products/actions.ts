"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { GasProductSchema } from "@/lib/validations";

export async function createGasProductAction(formData: FormData) {
  const name = formData.get("name") as string;
  const size = formData.get("size") as string;

  const parsed = GasProductSchema.safeParse({ name, size });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  await prisma.gasProduct.create({
    data: {
      name,
      size,
    },
  });

  revalidatePath("/dashboard/gas-products");
  redirect("/dashboard/gas-products");
}

export async function updateGasProductAction(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const size = formData.get("size") as string;

  const parsed = GasProductSchema.safeParse({ name, size });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  await prisma.gasProduct.update({
    where: { id },
    data: {
      name,
      size,
    },
  });

  revalidatePath("/dashboard/gas-products");
  redirect("/dashboard/gas-products");
}

export async function deleteGasProductAction(id: string) {
  try {
    await prisma.gasProduct.delete({
      where: { id },
    });
    revalidatePath("/dashboard/gas-products");
  } catch (error) {
    throw new Error("ไม่สามารถลบประเภทสินค้านี้ได้ อาจมีการอ้างอิงอยู่ (เช่น ถังแก๊สที่ผูกไว้)");
  }
}
