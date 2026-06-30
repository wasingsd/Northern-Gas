import { Plus, Search, CheckCircle2, Clock, Printer } from "lucide-react";
import Link from "next/link";
import { markOrderAsReadyAction } from "./actions";
import CancelOrderButton from "./CancelOrderButton";
import SubmitButton from "@/components/SubmitButton";

import prisma from "@/lib/prisma";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      customer: true,
      items: true,
      deliveryJob: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === "PENDING") return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-yellow-50 text-yellow-700">
        <Clock className="h-3 w-3" /> รอดำเนินการ
      </span>
    );
    if (status === "READY_FOR_DISPATCH") return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700">
        <CheckCircle2 className="h-3 w-3" /> พร้อมส่ง
      </span>
    );
    if (status === "COMPLETED") return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-green-50 text-green-700">
        <CheckCircle2 className="h-3 w-3" /> ส่งสำเร็จ
      </span>
    );
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">บันทึกส่งถัง (Dispatch)</h2>
          <p className="text-sm text-gray-500">จัดการรายการส่งถังแก๊สให้ลูกค้า</p>
        </div>
        <Link
          href="/dashboard/orders/new"
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 sm:py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          <Plus className="h-4 w-4" />
          สร้างรายการส่งถัง
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่ออเดอร์, ชื่อลูกค้า..."
              className="w-full rounded-lg border border-border pl-9 pr-4 py-2.5 text-base sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
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
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      จำนวน {o.items.reduce((sum, item) => sum + item.quantity, 0)} ถัง
                    </td>
                    <td className="px-6 py-4 text-center"><StatusBadge status={o.status} /></td>
                    <td className="px-6 py-4 text-center">
                      {o.deliveryJob ? (
                         <span className="inline-flex rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                           {o.deliveryJob.jobNo}
                         </span>
                      ) : "-"}
                    </td>
                    <td className="px-6 py-4 text-center space-y-2">
                      {o.status === "PENDING" && (
                        <div className="flex items-center gap-2">
                          <form action={markOrderAsReadyAction.bind(null, o.id)} className="flex-1">
                            <SubmitButton 
                              type="submit" 
                              defaultText="พร้อมส่ง"
                              pendingText="กำลังอัปเดต..."
                              className="w-full rounded bg-blue-600 text-white text-xs py-1.5 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                            />
                          </form>
                          <CancelOrderButton orderId={o.id} />
                        </div>
                      )}
                      {o.status !== "PENDING" && (
                        <a href={`/print/orders/${o.id}`} target="_blank" rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-1.5 rounded bg-gray-800 text-white text-xs py-1.5 font-medium hover:bg-gray-900 transition-colors">
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

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-border">
          {orders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">ยังไม่มีรายการคำสั่งซื้อ</div>
          ) : (
            orders.map((o) => (
              <div key={o.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/dashboard/orders/${o.id}`} className="text-primary font-bold text-base hover:underline">
                      {o.orderNo}
                    </Link>
                    <div className="text-sm font-medium text-foreground mt-0.5">{o.customer.name}</div>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>จำนวน {o.items.reduce((sum, item) => sum + item.quantity, 0)} ถัง</span>
                  {o.deliveryJob && (
                    <span className="inline-flex rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                      {o.deliveryJob.jobNo}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  {o.status === "PENDING" && (
                    <>
                      <form action={markOrderAsReadyAction.bind(null, o.id)} className="flex-1">
                        <SubmitButton 
                          type="submit" 
                          defaultText="พร้อมส่ง"
                          pendingText="กำลังอัปเดต..."
                          className="w-full rounded-lg bg-blue-600 text-white text-sm py-2.5 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                        />
                      </form>
                      <CancelOrderButton orderId={o.id} />
                    </>
                  )}
                  {o.status !== "PENDING" && (
                    <a href={`/print/orders/${o.id}`} target="_blank" rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-gray-800 text-white text-sm py-2.5 font-medium hover:bg-gray-900 transition-colors">
                      <Printer className="h-4 w-4" /> ใบส่งถัง
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
