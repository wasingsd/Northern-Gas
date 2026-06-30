"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCompanyProfile() {
  const profile = await prisma.companyProfile.findFirst();
  return profile;
}

export async function saveCompanyProfile(data: {
  nameEN: string;
  nameTH: string;
  addressEN?: string;
  addressTH?: string;
  tel1?: string;
  tel2?: string;
  fax?: string;
  email?: string;
}) {
  const existing = await prisma.companyProfile.findFirst();

  if (existing) {
    await prisma.companyProfile.update({
      where: { id: existing.id },
      data,
    });
  } else {
    await prisma.companyProfile.create({
      data,
    });
  }

  revalidatePath("/dashboard/settings");
  // Also revalidate print pages so they get the fresh data
  revalidatePath("/print/orders/[orderId]", "page");
  revalidatePath("/print/returns/[receiptId]", "page");
}
