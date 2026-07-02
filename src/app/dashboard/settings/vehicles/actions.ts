"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function createVehicleAction(formData: FormData) {
  const registration = formData.get("registration") as string;
  const description = formData.get("description") as string;

  if (!registration) throw new Error("Registration is required");

  await prisma.vehicle.create({
    data: {
      registration,
      description
    }
  });

  revalidatePath("/dashboard/settings/vehicles");
}

export async function deleteVehicleAction(id: string) {
  await prisma.vehicle.delete({
    where: { id }
  });

  revalidatePath("/dashboard/settings/vehicles");
}
