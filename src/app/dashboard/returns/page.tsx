import { Plus, Search, CheckCircle2, Clock, Printer } from "lucide-react";
import Link from "next/link";
import ReturnActionButtons from "./ReturnActionButtons";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export default async function ReturnsListPage() {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  
  let userRole = "DRIVER";
  if (supabaseUser) {
    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { supabaseId: supabaseUser.id },
          { email: supabaseUser.email ?? "" },
        ],
      },
      select: { role: true },
    });
    if (dbUser) userRole = dbUser.role;
  }

  const receipts = await prisma.returnReceipt.findMany({
    include: {
      customer: true,
      items: {
        include: { cylinder: true }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">รายการรับถังเปล่าคืน</h2>
          <p className="text-sm text-gray-500">ตรวจสอบและอนุมัติการรับถังเปล่าเข้าคลัง</p>
        </div>
        <Link
          href="/dashboard/returns/new"
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 sm:py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          <Plus className="h-4 w-4" />
          สร้างรายการรับคืน
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่ใบรับ, ชื่อลูกค้า..."
              className="w-full rounded-lg border border-border pl-9 pr-4 py-2.5 text-base sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-gray-700">
              <tr>
                <th className="px-6 py-4 font-medium">เลขที่ใบรับ</th>
                <th className="px-6 py-4 font-medium">ลูกค้า</th>
                <th className="px-6 py-4 font-medium">จำนวนถังรับคืน</th>
                <th className="px-6 py-4 font-medium text-center">สถานะ</th>
                <th className="px-6 py-4 font-medium text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {receipts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    ยังไม่มีรายการรับถังคืน
                  </td>
                </tr>
              ) : (
                receipts.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-primary">{r.receiptNo}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{r.customer.name}</div>
                      <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString("th-TH")}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{r.items.length} ถัง</td>
                    <td className="px-6 py-4 text-center">
                      {r.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-yellow-50 text-yellow-700">
                          <Clock className="h-3 w-3" /> รออนุมัติ
                        </span>
                      )}
                      {r.status === "COMPLETED" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-green-50 text-green-700">
                          <CheckCircle2 className="h-3 w-3" /> รับเข้าคลังแล้ว
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-2">
                        {r.status === "PENDING" && <ReturnActionButtons receiptId={r.id} userRole={userRole} />}
                        {r.status === "COMPLETED" && userRole !== "DRIVER" && (
                          <a href={`/print/returns/${r.id}`} target="_blank" rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-1.5 rounded bg-gray-800 text-white text-xs py-1.5 font-medium hover:bg-gray-900 transition-colors">
                            <Printer className="h-3.5 w-3.5" /> พิมพ์ใบรับคืน
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-border">
          {receipts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">ยังไม่มีรายการรับถังคืน</div>
          ) : (
            receipts.map((r) => (
              <div key={r.id} className="p-4 space-y-2.5">
                {/* Row 1: Receipt No + Quantity */}
                <div className="flex items-center justify-between">
                  <div className="font-bold text-primary text-base">{r.receiptNo}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-full">{r.items.length} ถัง</span>
                    {r.status === "PENDING" && (
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-50 text-yellow-700">
                        <Clock className="h-3 w-3" /> รออนุมัติ
                      </span>
                    )}
                    {r.status === "COMPLETED" && (
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700">
                        <CheckCircle2 className="h-3 w-3" /> เข้าคลังแล้ว
                      </span>
                    )}
                  </div>
                </div>
                {/* Row 2: Customer + Date */}
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{r.customer.name}</span>
                  <span className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString("th-TH", { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="pt-0.5">
                  {r.status === "PENDING" && <ReturnActionButtons receiptId={r.id} userRole={userRole} />}
                  {r.status === "COMPLETED" && userRole !== "DRIVER" && (
                    <a href={`/print/returns/${r.id}`} target="_blank" rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-gray-800 text-white text-sm py-2.5 font-medium hover:bg-gray-900 transition-colors">
                      <Printer className="h-4 w-4" /> พิมพ์ใบรับคืน
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
