"use client";

import { MapPin, Phone, Truck, Package, Printer } from "lucide-react";
import { updateDispatchStatus } from "./actions";
import { useTransition } from "react";

export default function DispatchBoardClient({ initialJobs }: { initialJobs: any[] }) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (jobId: string, status: string) => {
    startTransition(() => {
      updateDispatchStatus(jobId, status);
    });
  };

  const columns = [
    { id: "WAITING", title: "รอมอบหมายรถ", bg: "bg-gray-100" },
    { id: "OUT_FOR_DELIVERY", title: "กำลังไปส่ง", bg: "bg-blue-50" },
    { id: "DELIVERED", title: "ส่งสำเร็จแล้ว", bg: "bg-green-50" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      {columns.map(col => {
        const columnJobs = initialJobs.filter(j => j.status === col.id);
        
        return (
          <div key={col.id} className={`rounded-xl p-4 min-h-[500px] ${col.bg}`}>
            <h3 className="font-bold text-foreground mb-4 flex items-center justify-between">
              {col.title}
              <span className="text-xs bg-white text-gray-700 px-2 py-1 rounded-full">{columnJobs.length}</span>
            </h3>
            
            <div className="space-y-3">
              {columnJobs.map(job => (
                <div key={job.id} className="bg-white p-4 rounded-lg shadow-sm border border-border relative">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-primary">{job.jobNo}</span>
                    <div className="flex gap-1">
                      <a 
                        href={`/print/orders/${job.orderId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-100 text-gray-700 p-1.5 rounded hover:bg-gray-200 transition-colors flex items-center justify-center"
                        title="พิมพ์ใบส่งถัง"
                      >
                        <Printer className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                  
                  <div className="font-medium text-sm text-foreground mb-1">
                    {job.order.customer.name}
                  </div>
                  <div className="text-xs text-gray-600 flex items-start gap-1 mb-1">
                    <MapPin className="h-3 w-3 shrink-0 mt-0.5 text-gray-400" />
                    <span className="line-clamp-2">{job.address}</span>
                  </div>
                  <div className="bg-surface p-2 rounded text-xs mb-3 space-y-1">
                    {job.order.items && job.order.items.length > 0 ? (
                      job.order.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-gray-700">
                          <span>{item.product?.name || "ไม่ระบุ"}</span>
                          <span className="font-medium">{item.quantity} ถัง</span>
                        </div>
                      ))
                    ) : (
                      job.order.cylinders.map((cyl: any) => (
                        <div key={cyl.id} className="flex justify-between text-gray-700">
                          <span>{cyl.cylinderNo}</span>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
                    {col.id === "WAITING" && (
                       <button 
                         onClick={() => handleStatusChange(job.id, "OUT_FOR_DELIVERY")}
                         disabled={isPending}
                         className="w-full bg-blue-600 text-white text-xs font-medium py-1.5 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-1"
                       >
                         <Truck className="h-3 w-3" /> ยืนยันออกรถ
                       </button>
                    )}
                    {col.id === "OUT_FOR_DELIVERY" && (
                       <button 
                         onClick={() => handleStatusChange(job.id, "DELIVERED")}
                         disabled={isPending}
                         className="w-full bg-green-600 text-white text-xs font-medium py-1.5 rounded hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-1"
                       >
                         <Package className="h-3 w-3" /> บันทึกส่งสำเร็จ
                       </button>
                    )}
                    {col.id === "DELIVERED" && (
                       <span className="w-full text-center text-xs text-green-700 font-medium py-1.5 flex items-center justify-center gap-1">
                         เรียบร้อยแล้ว
                       </span>
                    )}
                  </div>
                </div>
              ))}
              
              {columnJobs.length === 0 && (
                <div className="text-center py-8 text-sm text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  ไม่มีงานในสถานะนี้
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
