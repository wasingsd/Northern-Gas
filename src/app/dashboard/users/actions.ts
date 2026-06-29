"use server";

import { revalidatePath } from "next/cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import prisma from "@/lib/prisma";
import { UserSchema } from "@/lib/validations";

/**
 * Get Supabase Admin client (service role).
 * Only used in Server Actions — never exposed to client.
 */
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  }

  return createAdminClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function createUserAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  const parsed = UserSchema.safeParse({ name, email, password, role });
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message);
  }

  const adminClient = getAdminClient();

  // 1. Create user in Supabase Auth
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // auto-confirm for internal system
  });

  if (authError) {
    if (authError.message.includes("already been registered")) {
      throw new Error("อีเมลนี้ถูกใช้งานแล้ว");
    }
    throw new Error(`Supabase Auth error: ${authError.message}`);
  }

  // 2. Create user in Prisma (link with supabaseId)
  await prisma.user.create({
    data: {
      name,
      email,
      supabaseId: authData.user.id,
      role: role || "DRIVER",
    },
  });

  revalidatePath("/dashboard/users");
}

export async function updateUserAction(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  const parsed = UserSchema.safeParse({ name, email, password, role });
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message);
  }

  // Get current Prisma user to find supabaseId
  const dbUser = await prisma.user.findUnique({ where: { id } });
  if (!dbUser) throw new Error("ไม่พบผู้ใช้");

  // Update Supabase Auth if password changed or email changed
  if (dbUser.supabaseId && (password || email !== dbUser.email)) {
    const adminClient = getAdminClient();
    const updates: { email?: string; password?: string } = {};
    if (email !== dbUser.email) updates.email = email;
    if (password && password.trim() !== "") updates.password = password;

    if (Object.keys(updates).length > 0) {
      const { error } = await adminClient.auth.admin.updateUserById(dbUser.supabaseId, updates);
      if (error) throw new Error(`Supabase update error: ${error.message}`);
    }
  }

  // Update Prisma
  await prisma.user.update({
    where: { id },
    data: { name, email, role: role || "DRIVER" },
  });

  revalidatePath("/dashboard/users");
}

export async function deleteUserAction(id: string) {
  const dbUser = await prisma.user.findUnique({ where: { id } });
  if (!dbUser) throw new Error("ไม่พบผู้ใช้");

  // Delete from Supabase Auth first (if linked)
  if (dbUser.supabaseId) {
    const adminClient = getAdminClient();
    const { error } = await adminClient.auth.admin.deleteUser(dbUser.supabaseId);
    // Non-fatal if Supabase user already doesn't exist
    if (error && !error.message.includes("not found")) {
      throw new Error(`Supabase delete error: ${error.message}`);
    }
  }

  // Delete from Prisma
  await prisma.user.delete({ where: { id } });

  revalidatePath("/dashboard/users");
}
