import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createGasProductAction } from "../actions";
import SubmitButton from "@/components/SubmitButton";

export default function NewGasProductPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/gas-products"
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-foreground">เพิ่มประเภทสินค้าใหม่</h2>
          <p className="text-sm text-gray-500">กรอกข้อมูลประเภทและขนาดของถังแก๊ส</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm p-6">
        <form action={createGasProductAction} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อประเภทสินค้า <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="เช่น ถัง ปตท. 15 กก."
                className="w-full rounded-lg border border-border px-4 py-3 text-base md:text-sm md:py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            <div>
              <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
                ขนาดถัง <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="size"
                name="size"
                required
                placeholder="เช่น 15 หรือ 7M3"
                className="w-full rounded-lg border border-border px-4 py-3 text-base md:text-sm md:py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Link
              href="/dashboard/gas-products"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              ยกเลิก
            </Link>
            <SubmitButton
              type="submit"
              defaultText="บันทึกข้อมูล"
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
