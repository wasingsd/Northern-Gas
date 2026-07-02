"use client";

import { useState } from "react";
import { ClipboardCheck, Search, Trash2, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { confirmReturnReceiptAction } from "../../actions";
import { useRouter } from "next/navigation";

export default function VerifyClient({ receipt, customerCylinders, adminId }: any) {
  const router = useRouter();
  const [cylinderInput, setCylinderInput] = useState("");
  // Start with empty verified list, they must scan to verify
  const [verifiedCylinders, setVerifiedCylinders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const driverCylinders = receipt.items.map((item: any) => item.cylinder.cylinderNo);
  
  // Driver expected but not yet verified
  const pendingDriverCylinders = driverCylinders.filter((no: string) => !verifiedCylinders.includes(no));
  
  // Verified but wasn't in driver's list
  const extraCylinders = verifiedCylinders.filter((no: string) => !driverCylinders.includes(no));
  
  // Verified and in driver's list
  const matchedCylinders = verifiedCylinders.filter((no: string) => driverCylinders.includes(no));

  const handleAddCylinder = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cylinderInput.trim()) return;
    
    const no = cylinderInput.trim();

    if (verifiedCylinders.includes(no)) {
      setError("หมายเลขถังนี้ถูกตรวจสอบแล้ว");
      return;
    }

    // Is it in driver's list?
    if (driverCylinders.includes(no)) {
      setVerifiedCylinders([...verifiedCylinders, no]);
      setCylinderInput("");
      setError("");
      return;
    }

    // If not in driver's list, check if it's currently with the customer
    const withCustomer = customerCylinders.find((c: any) => c.cylinderNo === no);
    if (!withCustomer) {
      setError(`ไม่พบหมายเลขถัง ${no} ในระบบที่อยู่กับลูกค้ารายนี้`);
      return;
    }

    setVerifiedCylinders([...verifiedCylinders, no]);
    setCylinderInput("");
    setError("");
  };

  const removeCylinder = (no: string) => {
    setVerifiedCylinders(verifiedCylinders.filter((c) => c !== no));
  };

  const handleConfirm = async () => {
    if (verifiedCylinders.length === 0) {
      setError("กรุณาสแกนตรวจสอบถังอย่างน้อย 1 ใบ");
      return;
    }
    
    if (confirm("ยืนยันการรับถังเปล่าที่ตรวจสอบแล้วเข้าคลัง?")) {
      setIsLoading(true);
      setError("");
      try {
        await confirmReturnReceiptAction(receipt.id, verifiedCylinders, adminId);
        router.push("/dashboard/returns");
      } catch (err: any) {
        setError(err.message || "เกิดข้อผิดพลาด");
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">ตรวจสอบรายการรับถังคืน</h2>
            <p className="text-sm text-gray-500">เลขที่: {receipt.receiptNo} • ลูกค้า: {receipt.customer.name}</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Scanning */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                สแกนบาร์โค้ดเพื่อยืนยันรับเข้าคลัง
              </label>
              <form onSubmit={handleAddCylinder} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={cylinderInput}
                  onChange={(e) => setCylinderInput(e.target.value)}
                  placeholder="สแกนหรือพิมพ์หมายเลขถัง..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  autoFocus
                />
                <button type="submit" className="hidden">Add</button>
              </form>
            </div>

            {/* List of Verified */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700 flex items-center justify-between">
                ถังที่ตรวจสอบแล้ว
                <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full">
                  {verifiedCylinders.length} ใบ
                </span>
              </h3>
              
              <div className="bg-gray-50 rounded-lg border border-border p-4 min-h-[300px]">
                {verifiedCylinders.length === 0 ? (
                  <div className="text-center text-gray-400 py-12">
                    ยังไม่มีถังที่ตรวจสอบ
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {matchedCylinders.map((no) => (
                      <li key={no} className="flex items-center justify-between p-3 bg-white border border-border rounded-lg shadow-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="font-medium">{no}</span>
                        </div>
                        <button onClick={() => removeCylinder(no)} className="text-gray-400 hover:text-red-500 p-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                    
                    {extraCylinders.map((no) => (
                      <li key={no} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <div>
                            <div className="font-medium text-yellow-800">{no}</div>
                            <div className="text-[10px] text-yellow-600">ถังเพิ่ม (ไม่ได้อยู่ในลิสต์พนักงาน)</div>
                          </div>
                        </div>
                        <button onClick={() => removeCylinder(no)} className="text-yellow-600 hover:text-red-500 p-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Driver's Pending List */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700 flex items-center justify-between">
                รายการจากพนักงาน (รอยืนยัน)
                <span className="bg-orange-100 text-orange-700 text-xs px-2.5 py-1 rounded-full">
                  {pendingDriverCylinders.length} ใบ
                </span>
              </h3>
              
              <div className="bg-gray-50 rounded-lg border border-border p-4 min-h-[300px]">
                {pendingDriverCylinders.length === 0 ? (
                  <div className="text-center text-gray-400 py-12 flex flex-col items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-400 mb-2" />
                    ยืนยันรายการพนักงานครบแล้ว
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {pendingDriverCylinders.map((no) => (
                      <li key={no} className="flex items-center justify-between p-3 bg-white border border-dashed border-gray-300 rounded-lg opacity-70">
                        <span className="font-medium text-gray-600">{no}</span>
                        <button 
                          onClick={() => {
                            setCylinderInput(no);
                            setTimeout(() => handleAddCylinder(undefined), 10);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                        >
                          ยืนยันรับ
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            {pendingDriverCylinders.length > 0 && verifiedCylinders.length > 0 && (
              <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-200">
                <AlertTriangle className="h-4 w-4 inline mr-1.5 -mt-0.5" />
                มีถังที่พนักงานเก็บมา แต่คุณยังไม่ได้แสกนตรวจสอบ ถังเหล่านี้จะถูกตีกลับไปเป็น <strong>"อยู่กับลูกค้า"</strong> เมื่อกดยืนยัน
              </div>
            )}
            
            <button
              onClick={handleConfirm}
              disabled={isLoading || verifiedCylinders.length === 0}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isLoading ? (
                <>กำลังบันทึกข้อมูล...</>
              ) : (
                <>
                  <ClipboardCheck className="h-5 w-5" />
                  ยืนยันรับเข้าคลัง ({verifiedCylinders.length} ใบ)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
