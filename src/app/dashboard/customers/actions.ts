"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import { CustomerSchema } from "@/lib/validations";

export async function createCustomerAction(formData: FormData) {
  const name = formData.get("name") as string;
  const customerCode = formData.get("customerCode") as string;

  const parsed = CustomerSchema.safeParse({ customerCode, name });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  await prisma.customer.create({
    data: {
      name,
      customerCode: customerCode || null,
    }
  });

  revalidatePath("/dashboard/customers");
}

export async function updateCustomerAction(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const customerCode = formData.get("customerCode") as string;

  const parsed = CustomerSchema.safeParse({ customerCode, name });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  await prisma.customer.update({
    where: { id },
    data: {
      name,
      customerCode: customerCode || null,
    }
  });

  revalidatePath("/dashboard/customers");
}

export async function deleteCustomerAction(id: string) {
  await prisma.customer.delete({
    where: { id }
  });

  revalidatePath("/dashboard/customers");
}
