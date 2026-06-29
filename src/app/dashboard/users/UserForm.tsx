"use client";

import { useState } from "react";
import { Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserAction, updateUserAction, deleteUserAction } from "./actions";

export default function UserForm({ initialData }: { initialData?: any }) {
  const [role, setRole] = useState(initialData?.role || "STAFF");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [modalConfig, setModalConfig] = useState<{isOpen: boolean, type: 'error' | 'confirm' | 'success', message: string, onConfirm?: () => void}>({ isOpen: false, type: 'error', message: '' });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const newErrors: { [key: string]: string } = {};
    const formData = new FormData(e.currentTarget);
    if (!formData.get("name")) newErrors.name = "กรุณากรอกชื่อผู้ใช้";
    if (!formData.get("email")) newErrors.email = "กรุณากรอกอีเมล";
    if (!initialData?.id && !formData.get("password")) newErrors.password = "กรุณากรอกรหัสผ่าน";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setLoading(true);
    formData.set("role", role);

    try {
      if (initialData?.id) {
        await updateUserAction(initialData.id, formData);
      } else {
        await createUserAction(formData);
      }
      setLoading(false);
      setModalConfig({
        isOpen: true,
        type: 'success',
        message: 'บันทึกข้อมูลผู้ใช้สำเร็จเรียบร้อยแล้ว',
        onConfirm: () => router.push("/dashboard/users")
      });
    } catch (error: any) {
      console.error(error);
      let errorMsg = "เกิดข้อผิดพลาดในการบันทึกข้อมูล โปรดตรวจสอบว่าข้อมูลถูกต้องหรือไม่";
      if (error?.message?.includes("Unique constraint failed")) {
        errorMsg = "ไม่สามารถบันทึกได้ เนื่องจากอีเมลนี้ซ้ำกับที่มีอยู่ในระบบแล้ว";
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
      message: "คุณแน่ใจหรือไม่ที่จะลบข้อมูลผู้ใช้ท่านนี้? การลบจะไม่สามารถกู้คืนได้",
      onConfirm: async () => {
        setLoading(true);
        try {
          await deleteUserAction(initialData.id);
          router.push("/dashboard/users");
        } catch (e) {
          setModalConfig({ isOpen: true, type: 'error', message: "ไม่สามารถลบผู้ใช้ได้" });
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
          <div className="w-full md:w-48 text-gray-700 font-medium">สิทธิ์การใช้งาน (Role)</div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="role" 
                value="OWNER" 
                checked={role === "OWNER"} 
                onChange={() => setRole("OWNER")}
                className="text-primary focus:ring-primary"
              />
              <span className="text-gray-700">เจ้าของร้าน (OWNER)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="role" 
                value="STAFF" 
                checked={role === "STAFF"} 
                onChange={() => setRole("STAFF")}
                className="text-primary focus:ring-primary"
              />
              <span className="text-gray-700">พนักงาน (STAFF)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="role" 
                value="DRIVER" 
                checked={role === "DRIVER"} 
                onChange={() => setRole("DRIVER")}
                className="text-primary focus:ring-primary"
              />
              <span className="text-gray-700">คนขับรถ (DRIVER)</span>
            </label>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
          <div className="w-full md:w-48 text-gray-700 font-medium">ชื่อผู้ใช้ <span className="text-red-500">*</span></div>
          <div className="flex-1">
            <input 
              type="text" 
              name="name" 
              defaultValue={initialData?.name}
              placeholder="ชื่อ - นามสกุล" 
              className={`w-full max-w-2xl rounded-lg border px-4 py-2 outline-none focus:ring-1 ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-primary'}`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
          <div className="w-full md:w-48 text-gray-700 font-medium">อีเมล (ใช้เข้าสู่ระบบ) <span className="text-red-500">*</span></div>
          <div className="flex-1">
            <input 
              type="email" 
              name="email" 
              defaultValue={initialData?.email}
              placeholder="example@gmail.com" 
              className={`w-full max-w-2xl rounded-lg border px-4 py-2 outline-none focus:ring-1 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-primary'}`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
          <div className="w-full md:w-48 text-gray-700 font-medium">
            รหัสผ่าน 
            {!initialData?.id && <span className="text-red-500 ml-1">*</span>}
          </div>
          <div className="flex-1">
            <input 
              type="password" 
              name="password" 
              placeholder={initialData?.id ? "เว้นว่างไว้หากไม่ต้องการเปลี่ยนรหัสผ่าน" : "กำหนดรหัสผ่านใหม่"} 
              className={`w-full max-w-2xl rounded-lg border px-4 py-2 outline-none focus:ring-1 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-primary'}`}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
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
              <Trash2 className="h-4 w-4" /> ลบผู้ใช้
            </button>
          ) : (
            <div></div> // Spacer
          )}
          
          <div className="flex gap-4">
            <Link 
              href="/dashboard/users"
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
