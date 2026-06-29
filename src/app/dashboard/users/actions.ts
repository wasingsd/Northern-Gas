"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

import prisma from "@/lib/prisma";

export async function createUserAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!name || !email || !password) throw new Error("Name, email and password are required");

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || "STAFF",
    }
  });

  revalidatePath("/dashboard/users");
}

export async function updateUserAction(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!name || !email) throw new Error("Name and email are required");

  const data: any = {
    name,
    email,
    role: role || "STAFF",
  };

  if (password && password.trim() !== "") {
    data.password = await bcrypt.hash(password, 10);
  }

  await prisma.user.update({
    where: { id },
    data
  });

  revalidatePath("/dashboard/users");
}

export async function deleteUserAction(id: string) {
  await prisma.user.delete({
    where: { id }
  });

  revalidatePath("/dashboard/users");
}
