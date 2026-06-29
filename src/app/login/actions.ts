"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import prisma from "@/lib/prisma";

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
    }

    // Set a simple cookie for MVP
    const cookieStore = await cookies();
    cookieStore.set("auth_token", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
    
  } catch (err) {
    return { error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" };
  }

  // Redirect must be outside try/catch in Next.js
  redirect("/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  redirect("/login");
}
