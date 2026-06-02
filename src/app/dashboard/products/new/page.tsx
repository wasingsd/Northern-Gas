import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createGasProductAction } from "../actions";

export default function NewGasProductPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products" className="rounded-full p-2 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-foreground">เพิ่มสินค้าใหม่</h2>
          <p className="text-sm text-gray-500">กำหนดชื่อ ขนาด และราคาสินค้า</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <form action={createGasProductAction} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">ชื่อสินค้า (เช่น LPG 15 กก.)</label>
              <input
                type="text"
                name="name"
                required
                className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">ขนาด (กิโลกรัม)</label>
              <input
                type="number"
                step="0.1"
                name="sizeKg"
                required
                className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
            <Link 
              href="/dashboard/products"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
            >
              บันทึกสินค้า
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
