"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import Link from "next/link";
import { createCustomerAction, updateCustomerAction, deleteCustomerAction } from "./actions";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function CustomerForm({ initialData }: { initialData?: any }) {
  const [taxType, setTaxType] = useState(initialData?.taxType || "UNSPECIFIED");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("taxType", taxType); // Ensure radio selection is passed

    try {
      if (initialData?.id) {
        await updateCustomerAction(initialData.id, formData);
      } else {
        await createCustomerAction(formData);
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบข้อมูลลูกค้าท่านนี้?")) return;
    setLoading(true);
    try {
      await deleteCustomerAction(initialData.id);
      router.push("/dashboard/customers");
    } catch (e) {
      alert("ไม่สามารถลบลูกค้าได้ (อาจมีข้อมูลออเดอร์ผูกอยู่)");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center gap-6">
        <div className="w-48 text-gray-700 font-medium">ประเภทผู้เสียภาษี</div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="taxType" 
              value="UNSPECIFIED" 
              checked={taxType === "UNSPECIFIED"} 
              onChange={() => setTaxType("UNSPECIFIED")}
              className="text-primary focus:ring-primary"
            />
            <span className="text-gray-700">ไม่ระบุ</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="taxType" 
              value="INDIVIDUAL" 
              checked={taxType === "INDIVIDUAL"} 
              onChange={() => setTaxType("INDIVIDUAL")}
              className="text-primary focus:ring-primary"
            />
            <span className="text-gray-700">บุคคลธรรมดา</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="taxType" 
              value="CORPORATE" 
              checked={taxType === "CORPORATE"} 
              onChange={() => setTaxType("CORPORATE")}
              className="text-primary focus:ring-primary"
            />
            <span className="text-gray-700">นิติบุคคล</span>
          </label>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="w-48 text-gray-700 font-medium">ชื่อลูกค้า <span className="text-red-500">*</span></div>
        <div className="flex-1">
          <input 
            type="text" 
            name="name" 
            defaultValue={initialData?.name}
            required
            placeholder="พิมพ์ ชื่อ,รหัส" 
            className="w-full max-w-2xl rounded-lg border border-border px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="w-48 text-gray-700 font-medium">เลขประจำตัวผู้เสียภาษี</div>
        <div className="flex-1">
          <input 
            type="text" 
            name="taxId" 
            defaultValue={initialData?.taxId}
            className="w-full max-w-2xl rounded-lg border border-border px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="w-48 text-gray-700 font-medium">ชื่อสาขา</div>
        <div className="flex-1">
          <input 
            type="text" 
            name="branchName" 
            defaultValue={initialData?.branchName}
            className="w-full max-w-2xl rounded-lg border border-border px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="w-48 text-gray-700 font-medium">เลขที่สาขา</div>
        <div className="flex-1">
          <input 
            type="text" 
            name="branchNo" 
            defaultValue={initialData?.branchNo}
            className="w-full max-w-2xl rounded-lg border border-border px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="w-48 text-gray-700 font-medium">รหัสลูกค้า</div>
        <div className="flex-1">
          <input 
            type="text" 
            name="customerCode" 
            defaultValue={initialData?.customerCode}
            className="w-full max-w-2xl rounded-lg border border-border px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="w-48 text-gray-700 font-medium">เบอร์โทรศัพท์ลูกค้า</div>
        <div className="flex-1">
          <input 
            type="text" 
            name="phone" 
            defaultValue={initialData?.phone}
            className="w-full max-w-2xl rounded-lg border border-border px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="w-48 text-gray-700 font-medium">อีเมลลูกค้า</div>
        <div className="flex-1">
          <input 
            type="email" 
            name="email" 
            defaultValue={initialData?.email}
            className="w-full max-w-2xl rounded-lg border border-border px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
      </div>

      <div className="flex items-start gap-6">
        <div className="w-48 text-gray-700 font-medium pt-2">ที่อยู่ลูกค้า</div>
        <div className="flex-1">
          <textarea 
            name="address" 
            defaultValue={initialData?.address}
            rows={4}
            className="w-full max-w-2xl rounded-lg border border-border px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
          />
        </div>
      </div>

      <div className="flex justify-between max-w-3xl pt-8 border-t border-border">
        {initialData?.id ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-red-600 font-medium hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" /> ลบข้อมูลลูกค้า
          </button>
        ) : (
          <div></div> // Spacer
        )}
        
        <div className="flex gap-4">
          <Link 
            href="/dashboard/customers"
            className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
          >
            ยกเลิก
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </button>
        </div>
      </div>
    </form>
  );
}
