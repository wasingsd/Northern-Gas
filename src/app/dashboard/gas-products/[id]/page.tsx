import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { updateGasProductAction } from "../actions";

export default async function EditGasProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.gasProduct.findUnique({
    where: { id: params.id },
  });

  if (!product) {
    notFound();
  }

  const updateProductWithId = updateGasProductAction.bind(null, product.id);

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
          <h2 className="text-2xl font-bold text-foreground">แก้ไขประเภทสินค้า</h2>
          <p className="text-sm text-gray-500">รหัสอ้างอิง: {product.id}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm p-6">
        <form action={updateProductWithId} className="space-y-6">
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
                defaultValue={product.name}
                className="w-full rounded-lg border border-border px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            <div>
              <label htmlFor="sizeKg" className="block text-sm font-medium text-gray-700 mb-1">
                ขนาดความจุ (กิโลกรัม) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="sizeKg"
                name="sizeKg"
                step="0.1"
                min="0.1"
                required
                defaultValue={product.sizeKg}
                className="w-full rounded-lg border border-border px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
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
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors"
            >
              บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
