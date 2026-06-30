"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteCylinderAction(id: string) {
  await prisma.cylinder.delete({
    where: { id },
  });
  revalidatePath("/dashboard/products");
}
