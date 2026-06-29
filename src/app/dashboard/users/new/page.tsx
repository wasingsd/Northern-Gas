import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import UserForm from "../UserForm";

export default function NewUserPage() {
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
          <h2 className="text-2xl font-bold text-foreground">เพิ่มผู้ใช้งานใหม่</h2>
          <p className="text-gray-500 text-sm mt-1">กำหนดสิทธิ์และบัญชีผู้ใช้งานสำหรับเข้าระบบ</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
        <UserForm />
      </div>
    </div>
  );
}
