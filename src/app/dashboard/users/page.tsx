import Link from "next/link";
import { Plus, Search, Edit2 } from "lucide-react";

import prisma from "@/lib/prisma";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">จัดการผู้ใช้งาน (Users)</h2>
        <Link 
          href="/dashboard/users/new"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors font-medium shadow-sm"
        >
          <Plus className="h-4 w-4" />
          เพิ่มผู้ใช้ใหม่
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input 
              type="text"
              placeholder="ค้นหาชื่อผู้ใช้ หรืออีเมล..."
              className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface text-gray-600 text-sm border-b border-border">
                <th className="p-4 font-semibold whitespace-nowrap">ลำดับ</th>
                <th className="p-4 font-semibold whitespace-nowrap">ชื่อผู้ใช้</th>
                <th className="p-4 font-semibold whitespace-nowrap">อีเมล</th>
                <th className="p-4 font-semibold whitespace-nowrap">สิทธิ์ (Role)</th>
                <th className="p-4 font-semibold whitespace-nowrap">วันที่เพิ่ม</th>
                <th className="p-4 font-semibold text-center whitespace-nowrap">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    ไม่พบข้อมูลผู้ใช้งาน
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user.id} className="border-b border-border hover:bg-surface/50 transition-colors">
                    <td className="p-4 text-gray-600">{(index + 1).toString().padStart(2, '0')}</td>
                    <td className="p-4 font-medium text-foreground">{user.name}</td>
                    <td className="p-4 text-gray-600">{user.email}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${user.role === 'OWNER' ? 'bg-purple-100 text-purple-800' : 
                          user.role === 'STAFF' ? 'bg-blue-100 text-blue-800' : 
                          user.role === 'DRIVER' ? 'bg-orange-100 text-orange-800' : 
                          'bg-gray-100 text-gray-800'}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString("th-TH")}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link 
                          href={`/dashboard/users/${user.id}/edit`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="แก้ไข"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col divide-y divide-border">
          {users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              ไม่พบข้อมูลผู้ใช้งาน
            </div>
          ) : (
            users.map((user, index) => (
              <div key={user.id} className="p-4 space-y-3 bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-foreground text-lg">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold
                    ${user.role === 'OWNER' ? 'bg-purple-100 text-purple-800' : 
                      user.role === 'STAFF' ? 'bg-blue-100 text-blue-800' : 
                      user.role === 'DRIVER' ? 'bg-orange-100 text-orange-800' : 
                      'bg-gray-100 text-gray-800'}`}
                  >
                    {user.role}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-gray-400">
                    เพิ่มเมื่อ: {new Date(user.createdAt).toLocaleDateString("th-TH")}
                  </span>
                  <Link 
                    href={`/dashboard/users/${user.id}/edit`}
                    className="flex items-center gap-2 px-4 py-2 text-blue-700 bg-blue-50 rounded-lg font-medium active:bg-blue-100 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" /> แก้ไข
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
