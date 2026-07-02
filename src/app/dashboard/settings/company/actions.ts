"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAllCompanyProfiles() {
  return await prisma.companyProfile.findMany({ orderBy: { createdAt: "asc" } });
}

export async function addCompanyProfile(data: any) {
  await prisma.companyProfile.create({ data });
  revalidatePath("/dashboard/settings/company");
  revalidatePath("/dashboard/orders/new");
}

export async function updateCompanyProfile(id: string, data: any) {
  await prisma.companyProfile.update({ where: { id }, data });
  revalidatePath("/dashboard/settings/company");
  revalidatePath("/dashboard/orders/new");
}

export async function deleteCompanyProfile(id: string) {
  await prisma.companyProfile.delete({ where: { id } });
  revalidatePath("/dashboard/settings/company");
  revalidatePath("/dashboard/orders/new");
}
