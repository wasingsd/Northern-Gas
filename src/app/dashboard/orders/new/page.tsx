import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import { createOrderAction } from "../actions";
import OrderItemsForm from "./OrderItemsForm";
import CustomerSection from "./CustomerSection";

const prisma = new PrismaClient();

export default async function NewOrderPage() {
  const customers = await prisma.customer.findMany({ orderBy: { name: "asc" } });
  const products = await prisma.gasProduct.findMany({ where: { active: true }, orderBy: { sizeKg: "asc" } });

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/orders" className="rounded-full p-2 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-foreground">สร้างออเดอร์ใหม่</h2>
          <p className="text-sm text-gray-500">บันทึกคำสั่งซื้อและสร้างใบงานจัดส่ง</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <form action={createOrderAction} className="p-6 space-y-6">
          <CustomerSection customers={customers} />
          
          <OrderItemsForm products={products} />

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
            <Link
              href="/dashboard/orders"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-border rounded-lg hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
            >
              ยืนยันสร้างออเดอร์
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
