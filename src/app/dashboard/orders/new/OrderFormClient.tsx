"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export default function OrderFormClient({ 
  children, 
  action 
}: { 
  children: React.ReactNode, 
  action: (formData: FormData) => Promise<any> 
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState<{ show: boolean, redirectTo: string | null }>({ show: false, redirectTo: null });
  const [errorModal, setErrorModal] = useState<{ show: boolean, message: string }>({ show: false, message: "" });

  const handleSubmit = async (formData: FormData) => {
    if (isSubmitting) return; // Prevent double submit
    setIsSubmitting(true);
    
    try {
      const result = await action(formData);
      if (result?.success) {
        setSuccessModal({ show: true, redirectTo: result.redirectTo || null });
      } else if (result?.error) {
        setErrorModal({ show: true, message: result.error });
      }
    } catch (e: any) {
      if (e.message && e.message.includes("NEXT_REDIRECT")) {
        // Fallback if some action still uses redirect() directly
        setSuccessModal({ show: true, redirectTo: null });
      } else {
        setErrorModal({ show: true, message: e.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form action={handleSubmit} className="p-6 space-y-6 relative">
        {children}
        
        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl">
            <div className="bg-white px-6 py-4 rounded-xl shadow-lg border border-border flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="font-medium text-foreground">กำลังบันทึกข้อมูล...</span>
            </div>
          </div>
        )}
      </form>

      {/* Success Modal */}
      {successModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in duration-200 mx-4">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">บันทึกสำเร็จ!</h3>
            <p className="text-sm text-gray-500 mb-6">ระบบได้สร้างรายการส่งถังเรียบร้อยแล้ว</p>
            <button
              type="button"
              onClick={() => {
                setSuccessModal({ show: false, redirectTo: null });
                if (successModal.redirectTo) {
                  router.push(successModal.redirectTo);
                } else {
                  window.history.back();
                }
              }}
              className="w-full inline-flex justify-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700 transition-colors"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {errorModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in duration-200 mx-4">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">เกิดข้อผิดพลาด</h3>
            <p className="text-sm text-gray-500 mb-6">{errorModal.message}</p>
            <button
              type="button"
              onClick={() => setErrorModal({ show: false, message: "" })}
              className="w-full inline-flex justify-center rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-300 transition-colors"
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </>
  );
}
