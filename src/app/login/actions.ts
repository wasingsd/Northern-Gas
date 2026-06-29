"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function loginAction(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Map common Supabase error codes to Thai messages
    if (
      error.message === "Invalid login credentials" ||
      error.code === "invalid_credentials"
    ) {
      return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
    }
    if (error.code === "email_not_confirmed") {
      return { error: "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ" };
    }
    return { error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" };
  }

  // Redirect must be outside try/catch in Next.js
  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
