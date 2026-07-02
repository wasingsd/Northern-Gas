"use client";

import { useState } from "react";
import { Search, Trash2, Package, CheckCircle2 } from "lucide-react";
import { finishDeliveryJobAction } from "../../actions";
import { useRouter } from "next/navigation";

export default function DeliverClient({ jobId, expectedCylinders, customer }: any) {
  const router = useRouter();
  const [cylinderInput, setCylinderInput] = useState("");
  const [scannedCylinders, setScannedCylinders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Categorize scanned cylinders
  const scannedExpected = expectedCylinders.filter((c: any) => scannedCylinders.includes(c.cylinderNo));
  const scannedUnexpected = scannedCylinders.filter((no: string) => !expectedCylinders.find((c: any) => c.cylinderNo === no));

  const handleAddCylinder = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const input = cylinderInput.trim();
    if (!input) return;
    
    // Match either cylinderNo or qrCode from expected cylinders
    const matched = expectedCylinders.find((c: any) => c.cylinderNo === input || c.qrCode === input);
    const normalizedInput = matched ? matched.cylinderNo : input;

    if (scannedCylinders.includes(normalizedInput)) {
      setError("หมายเลขถังนี้ถูกสแกนแล้ว");
      return;
    }

    setScannedCylinders([...scannedCylinders, normalizedInput]);
    setCylinderInput("");
    setError("");
  };

  const removeCylinder = (no: string) => {
    setScannedCylinders(scannedCylinders.filter(c => c !== no));
  };

  const handleSubmit = async () => {
    if (isLoading) return; // Prevent double submit
    if (scannedCylinders.length === 0) {
      setError("กรุณาสแกนถังอย่างน้อย 1 ใบ หรือกดยกเลิกการจัดส่งถ้าไม่มีถัง");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const result = await finishDeliveryJobAction(jobId, scannedCylinders) as any;
      if (result.success) {
        // Open print window
        if (result.receiptId) {
          window.open(`/print/dispatch/${result.receiptId}`, '_blank');
        }
        router.push(result.redirectTo);
      } else {
        setError(result.message || "เกิดข้อผิดพลาดในการบันทึก");
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Left Column: Scanning Area */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6 space-y-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          สแกนถังที่ต้องการส่ง
        </h3>

        {/* Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">หมายเลขถัง (แสกนบาร์โค้ด)</label>
          <form onSubmit={handleAddCylinder} className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              autoFocus
              value={cylinderInput}
              onChange={(e) => setCylinderInput(e.target.value)}
              placeholder="สแกน หรือพิมพ์รหัสถัง..."
              className="w-full rounded-lg border border-border pl-10 pr-4 py-2.5 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button 
              type="submit"
              className="absolute right-2 top-1.5 bg-primary text-white text-sm px-3 py-1 rounded-md"
            >
              เพิ่ม
            </button>
          </form>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {/* Scanned List */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <h4 className="text-sm font-semibold text-gray-700">รายการที่สแกนแล้ว ({scannedCylinders.length})</h4>
          </div>
          
          <div className="border border-border rounded-lg overflow-hidden divide-y divide-border bg-gray-50/50">
            {scannedCylinders.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                ยังไม่มีการแสกนถัง
              </div>
            ) : (
              <ul className="max-h-80 overflow-y-auto">
                {scannedExpected.map((c: any) => (
                  <li key={c.id} className="p-3 bg-white flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-foreground">{c.cylinderNo}</div>
                        <div className="text-xs text-gray-500">{c.product?.name || "ไม่ระบุ"}</div>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeCylinder(c.cylinderNo)} className="text-gray-400 hover:text-red-500 p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}

                {scannedUnexpected.map((no: string) => (
                  <li key={no} className="p-3 bg-red-50 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-xs font-bold text-red-600">!</span>
                      </div>
                      <div>
                        <div className="font-medium text-sm text-red-700">{no}</div>
                        <div className="text-xs text-red-500">ไม่ได้อยู่ในบิลแอดมิน</div>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeCylinder(no)} className="text-gray-400 hover:text-red-500 p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/dispatch")}
            className="flex-1 px-4 py-2.5 border border-border text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || scannedCylinders.length === 0}
            className="flex-1 px-4 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-colors"
          >
            {isLoading ? "กำลังบันทึก..." : "ยืนยันส่งมอบ"}
          </button>
        </div>
      </div>

      {/* Right Column: Order Details */}
      <div className="bg-gray-50 rounded-xl border border-border shadow-sm p-6 space-y-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          รายการถังที่ต้องจัดส่ง
        </h3>
        <p className="text-sm text-gray-500">ถังเหล่านี้คือถังที่แอดมินระบุไว้ในใบสั่งซื้อ หากสแกนไม่ครบ ถังที่ไม่ถูกสแกนจะถูกตีเป็น "ตกหล่น"</p>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-border">
            <h4 className="text-sm font-semibold mb-3">สรุปจำนวนที่ต้องส่ง</h4>
            <div className="text-3xl font-bold text-primary">{expectedCylinders.length} <span className="text-base font-normal text-gray-500">ถัง</span></div>
          </div>

          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-600 border-b border-border">
              รายละเอียดถังในบิล
            </div>
            <ul className="divide-y divide-border max-h-96 overflow-y-auto">
              {expectedCylinders.map((c: any) => {
                const isScanned = scannedCylinders.includes(c.cylinderNo);
                return (
                  <li key={c.id} className={`p-3 flex items-center justify-between ${isScanned ? 'opacity-50 bg-green-50/30' : ''}`}>
                    <div>
                      <div className="font-medium text-sm">{c.cylinderNo}</div>
                      <div className="text-xs text-gray-500">{c.product?.name || "ไม่ระบุ"}</div>
                    </div>
                    {isScanned ? (
                      <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> แสกนแล้ว
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-orange-500">
                        รอการแสกน
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
