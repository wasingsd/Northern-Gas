"use client";

import { useState } from "react";
import SubmitButton from "@/components/SubmitButton";
import { createCylinderOwnerAction, updateCylinderOwnerAction } from "./actions";

export default function OwnerForm({ owner }: { owner?: { id: string, name: string } }) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (formData: FormData) => {
    setError("");
    try {
      if (owner) {
        await updateCylinderOwnerAction(owner.id, formData);
      } else {
        await createCylinderOwnerAction(formData);
      }
      setIsOpen(false);
    } catch (e: any) {
      setError(e.message || "เกิดข้อผิดพลาด");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={owner ? "text-blue-600 hover:text-blue-800 text-sm font-medium" : "bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"}
      >
        {owner ? "แก้ไข" : "+ เพิ่มเจ้าของถัง"}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{owner ? "แก้ไขเจ้าของถัง" : "เพิ่มเจ้าของถัง"}</h3>
            
            <form action={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อเจ้าของถัง <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  defaultValue={owner?.name}
                  required
                  className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="เช่น ปตท., ลูกค้าทั่วไป"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  ยกเลิก
                </button>
                <SubmitButton
                  defaultText="บันทึก"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover"
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
