import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import UserForm from "../../UserForm";

import prisma from "@/lib/prisma";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const user = await prisma.user.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/users"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-foreground">แก้ไขข้อมูลผู้ใช้งาน</h2>
          <p className="text-gray-500 text-sm mt-1">แก้ไขสิทธิ์และข้อมูลบัญชี</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
        <UserForm initialData={user} />
      </div>
    </div>
  );
}
