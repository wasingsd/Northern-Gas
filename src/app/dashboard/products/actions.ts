"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function createGasProductAction(formData: FormData) {
  const name = formData.get("name") as string;
  const sizeKg = parseFloat(formData.get("sizeKg") as string);
  const salePrice = parseFloat(formData.get("salePrice") as string) || 0;
  const deliveryFee = parseFloat(formData.get("deliveryFee") as string) || 0;
  
  await prisma.gasProduct.create({
    data: {
      name,
      sizeKg,
      salePrice,
      deliveryFee,
    }
  });

  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
}

export async function deleteProductAction(id: string) {
  await prisma.gasProduct.delete({
    where: { id }
  });
  revalidatePath("/dashboard/products");
}
