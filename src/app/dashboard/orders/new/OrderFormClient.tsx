"use client";

import { useState } from "react";

export default function OrderFormClient({ 
  children, 
  action 
}: { 
  children: React.ReactNode, 
  action: (formData: FormData) => Promise<any> 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    if (isSubmitting) return; // Prevent double submit
    setIsSubmitting(true);
    
    try {
      await action(formData);
    } catch (e: any) {
      if (e.message && e.message.includes("NEXT_REDIRECT")) {
        alert("สร้างรายการส่งถังสำเร็จ!");
        throw e; // Let Next.js handle the redirect after clicking OK
      } else {
        alert("เกิดข้อผิดพลาด: " + e.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
  );
}
