"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function createCustomerAction(formData: FormData) {
  const name = formData.get("name") as string;
  const taxType = formData.get("taxType") as string; // UNSPECIFIED, INDIVIDUAL, CORPORATE
  const taxId = formData.get("taxId") as string;
  const branchName = formData.get("branchName") as string;
  const branchNo = formData.get("branchNo") as string;
  const customerCode = formData.get("customerCode") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const address = formData.get("address") as string;

  if (!name) throw new Error("Name is required");

  await prisma.customer.create({
    data: {
      name,
      taxType: taxType || "UNSPECIFIED",
      taxId: taxId || null,
      branchName: branchName || null,
      branchNo: branchNo || null,
      customerCode: customerCode || null,
      phone: phone || null,
      email: email || null,
      address: address || null,
    }
  });

  revalidatePath("/dashboard/customers");
  redirect("/dashboard/customers");
}

export async function updateCustomerAction(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const taxType = formData.get("taxType") as string;
  const taxId = formData.get("taxId") as string;
  const branchName = formData.get("branchName") as string;
  const branchNo = formData.get("branchNo") as string;
  const customerCode = formData.get("customerCode") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const address = formData.get("address") as string;

  if (!name) throw new Error("Name is required");

  await prisma.customer.update({
    where: { id },
    data: {
      name,
      taxType: taxType || "UNSPECIFIED",
      taxId: taxId || null,
      branchName: branchName || null,
      branchNo: branchNo || null,
      customerCode: customerCode || null,
      phone: phone || null,
      email: email || null,
      address: address || null,
    }
  });

  revalidatePath("/dashboard/customers");
  redirect("/dashboard/customers");
}

export async function deleteCustomerAction(id: string) {
  await prisma.customer.delete({
    where: { id }
  });

  revalidatePath("/dashboard/customers");
}
