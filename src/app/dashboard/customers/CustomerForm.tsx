"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import Link from "next/link";
import { createCustomerAction, updateCustomerAction, deleteCustomerAction } from "./actions";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function CustomerForm({ initialData }: { initialData?: any }) {
  const [taxType, setTaxType] = useState(initialData?.taxType || "UNSPECIFIED");
  const [taxId, setTaxId] = useState(initialData?.taxId || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState<{isOpen: boolean, type: 'error' | 'confirm' | 'success', message: string, onConfirm?: () => void}>({ isOpen: false, type: 'error', message: '' });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Custom Validation
    const newErrors: { [key: string]: string } = {};
    const formData = new FormData(e.currentTarget);
    if (!formData.get("name")) newErrors.name = "กรุณากรอกชื่อลูกค้า";
    if (taxType === "INDIVIDUAL" && taxId.length !== 13) newErrors.taxId = "กรุณากรอกตัวเลข 13 หลัก";
    if (phone.length !== 10) newErrors.phone = "กรุณากรอกตัวเลข 10 หลัก";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setLoading(true);
    formData.set("taxType", taxType); // Ensure radio selection is passed
    formData.set("taxId", taxId);
    formData.set("phone", phone);

    try {
      if (initialData?.id) {
        await updateCustomerAction(initialData.id, formData);
      } else {
        await createCustomerAction(formData);
      }
      setLoading(false);
      setModalConfig({
        isOpen: true,
        type: 'success',
        message: 'บันทึกข้อมูลลูกค้าสำเร็จเรียบร้อยแล้ว',
        onConfirm: () => router.push("/dashboard/customers")
      });
    } catch (error: any) {
      console.error(error);
      let errorMsg = "เกิดข้อผิดพลาดในการบันทึกข้อมูล โปรดตรวจสอบว่าข้อมูลถูกต้องครบถ้วนหรือไม่";
      if (error?.message?.includes("Unique constraint failed")) {
        errorMsg = "ไม่สามารถบันทึกได้ เนื่องจากข้อมูลบางอย่าง (เช่น รหัสลูกค้า หรืออีเมล) ซ้ำกับที่มีอยู่ในระบบแล้ว";
      }
      setModalConfig({ isOpen: true, type: 'error', message: errorMsg });
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!initialData?.id) return;
    setModalConfig({
      isOpen: true,
      type: 'confirm',
      message: "คุณแน่ใจหรือไม่ที่จะลบข้อมูลลูกค้าท่านนี้? การลบจะไม่สามารถกู้คืนได้",
      onConfirm: async () => {
        setLoading(true);
        try {
          await deleteCustomerAction(initialData.id);
          router.push("/dashboard/customers");
        } catch (e) {
          setModalConfig({ isOpen: true, type: 'error', message: "ไม่สามารถลบลูกค้าได้ เนื่องจากอาจมีข้อมูลการสั่งซื้อผูกอยู่" });
          setLoading(false);
        }
      }
    });
  };

  return (
    <>
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100 opacity-100">
            <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full mb-5 
              ${modalConfig.type === 'error' ? 'bg-red-50 text-red-500' : 
                modalConfig.type === 'success' ? 'bg-green-50 text-green-500' : 
                'bg-yellow-50 text-yellow-500'}`}
            >
              {modalConfig.type === 'success' ? (
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
              {modalConfig.type === 'error' ? 'เกิดข้อผิดพลาด' : modalConfig.type === 'success' ? 'สำเร็จ' : 'ยืนยันการลบข้อมูล'}
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6 px-2 leading-relaxed">
              {modalConfig.message}
            </p>
            
            <div className="flex gap-3 justify-center">
              {modalConfig.type === 'confirm' ? (
                <>
                  <button 
                    type="button"
                    onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      modalConfig.onConfirm?.();
                      setModalConfig(prev => ({ ...prev, isOpen: false }));
                    }}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium shadow-sm transition-colors"
                  >
                    ยืนยันลบ
                  </button>
                </>
              ) : (
                <button 
                  type="button"
                  onClick={() => {
                    if (modalConfig.onConfirm) modalConfig.onConfirm();
                    setModalConfig(prev => ({ ...prev, isOpen: false }));
                  }}
                  className={`w-full py-2.5 rounded-xl font-medium transition-colors text-white shadow-sm
                    ${modalConfig.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  ตกลง
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
        <div className="w-full md:w-48 text-gray-700 font-medium">ประเภทผู้เสียภาษี</div>
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
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

      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
        <div className="w-full md:w-48 text-gray-700 font-medium">ชื่อลูกค้า <span className="text-red-500">*</span></div>
        <div className="flex-1">
          <input 
            type="text" 
            name="name" 
            defaultValue={initialData?.name}
            placeholder="พิมพ์ ชื่อ,รหัส" 
            className={`w-full max-w-2xl rounded-lg border px-4 py-2 outline-none focus:ring-1 ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-primary'}`}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
        <div className="w-full md:w-48 text-gray-700 font-medium">
          เลขประจำตัวผู้เสียภาษี 
          {taxType === "INDIVIDUAL" && <span className="text-red-500 ml-1">*</span>}
        </div>
        <div className="flex-1">
          <input 
            type="text" 
            name="taxId" 
            value={taxId}
            onChange={(e) => setTaxId(e.target.value.replace(/\D/g, '').slice(0, 13))}
            placeholder={taxType === "INDIVIDUAL" ? "เลข 13 หลัก" : ""}
            className={`w-full max-w-2xl rounded-lg border px-4 py-2 outline-none focus:ring-1 ${errors.taxId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-primary'}`}
          />
          {errors.taxId && <p className="text-red-500 text-sm mt-1">{errors.taxId}</p>}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
        <div className="w-full md:w-48 text-gray-700 font-medium">ชื่อสาขา</div>
        <div className="flex-1">
          <input 
            type="text" 
            name="branchName" 
            defaultValue={initialData?.branchName}
            className="w-full max-w-2xl rounded-lg border border-border px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
        <div className="w-full md:w-48 text-gray-700 font-medium">เลขที่สาขา</div>
        <div className="flex-1">
          <input 
            type="text" 
            name="branchNo" 
            defaultValue={initialData?.branchNo}
            className="w-full max-w-2xl rounded-lg border border-border px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
        <div className="w-full md:w-48 text-gray-700 font-medium">รหัสลูกค้า</div>
        <div className="flex-1">
          <input 
            type="text" 
            name="customerCode" 
            defaultValue={initialData?.customerCode}
            className="w-full max-w-2xl rounded-lg border border-border px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
        <div className="w-full md:w-48 text-gray-700 font-medium">เบอร์โทรศัพท์ลูกค้า <span className="text-red-500">*</span></div>
        <div className="flex-1">
          <input 
            type="text" 
            name="phone" 
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="ตัวเลข 10 หลัก"
            className={`w-full max-w-2xl rounded-lg border px-4 py-2 outline-none focus:ring-1 ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-primary'}`}
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
        <div className="w-full md:w-48 text-gray-700 font-medium">อีเมลลูกค้า</div>
        <div className="flex-1">
          <input 
            type="email" 
            name="email" 
            defaultValue={initialData?.email}
            className="w-full max-w-2xl rounded-lg border border-border px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-6">
        <div className="w-full md:w-48 text-gray-700 font-medium pt-2">ที่อยู่ลูกค้า</div>
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
    </>
  );
}
