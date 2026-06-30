import { Plus, Search, CheckCircle2, Clock, Printer } from "lucide-react";
import Link from "next/link";
import { markOrderAsReadyAction } from "./actions";
import CancelOrderButton from "./CancelOrderButton";

import prisma from "@/lib/prisma";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      customer: true,
      cylinders: true,
      deliveryJob: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">บันทึกส่งถัง (Dispatch)</h2>
          <p className="text-sm text-gray-500">จัดการรายการส่งถังแก๊สให้ลูกค้า</p>
        </div>
        <Link
          href="/dashboard/orders/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          <Plus className="h-4 w-4" />
          สร้างรายการส่งถัง
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่ออเดอร์, ชื่อลูกค้า..."
              className="w-full rounded-lg border border-border pl-9 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-gray-700">
              <tr>
                <th className="px-6 py-4 font-medium">เลขที่ออเดอร์</th>
                <th className="px-6 py-4 font-medium">ลูกค้า</th>
                <th className="px-6 py-4 font-medium">สินค้า</th>
                <th className="px-6 py-4 font-medium text-center">สถานะออเดอร์</th>
                <th className="px-6 py-4 font-medium text-center">งานจัดส่ง</th>
                <th className="px-6 py-4 font-medium text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    ยังไม่มีรายการคำสั่งซื้อ
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium">
                      <Link href={`/dashboard/orders/${o.id}`} className="text-primary hover:underline hover:text-primary-hover transition-colors">
                        {o.orderNo}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{o.customer.name}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{o.customer.address || "-"}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      จำนวน {o.cylinders.length} ถัง
                    </td>

                    <td className="px-6 py-4 text-center">
                      {o.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-yellow-50 text-yellow-700">
                          <Clock className="h-3 w-3" />
                          รอดำเนินการ
                        </span>
                      )}
                      {o.status === "READY_FOR_DISPATCH" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700">
                          <CheckCircle2 className="h-3 w-3" />
                          พร้อมส่ง
                        </span>
                      )}
                      {o.status === "COMPLETED" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-green-50 text-green-700">
                          <CheckCircle2 className="h-3 w-3" />
                          ส่งสำเร็จ
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {o.deliveryJob ? (
                         <span className="inline-flex rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                           {o.deliveryJob.jobNo}
                         </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 text-center space-y-2">
                      {o.status === "PENDING" && (
                        <div className="flex items-center gap-2">
                          <form action={markOrderAsReadyAction.bind(null, o.id)} className="flex-1">
                            <button type="submit" className="w-full rounded bg-blue-600 text-white text-xs py-1.5 font-medium hover:bg-blue-700 transition-colors">
                              พร้อมส่ง
                            </button>
                          </form>
                          <CancelOrderButton orderId={o.id} />
                        </div>
                      )}
                      {o.status !== "PENDING" && (
                        <a 
                          href={`/print/orders/${o.id}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-1.5 rounded bg-gray-800 text-white text-xs py-1.5 font-medium hover:bg-gray-900 transition-colors"
                        >
                          <Printer className="h-3.5 w-3.5" /> ใบส่งถัง
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
