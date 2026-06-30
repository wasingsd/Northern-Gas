"use client";

import { useState, useRef, useEffect } from "react";
import { ScanLine, CheckCircle2, Search, Printer, AlertTriangle } from "lucide-react";
import { createRefillBatchAction, scanCylinderForRefill } from "../actions";
import { useRouter } from "next/navigation";

export default function RefillScannerClient({ emptyCylinders = [] }: { emptyCylinders?: any[] }) {
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scannedIds, setScannedIds] = useState<string[]>([]);
  const [unexpectedCylinders, setUnexpectedCylinders] = useState<any[]>([]); // For cylinders not in emptyCylinders but returned by server
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const allKnownCylinders = [...emptyCylinders, ...unexpectedCylinders];

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = inputValue.trim();
    if (!code) return;

    // Check if already scanned
    const alreadyScanned = allKnownCylinders.find(c => (c.qrCode === code || c.cylinderNo === code) && scannedIds.includes(c.id));
    if (alreadyScanned) {
      setInputValue("");
      return;
    }

    // Find in our known empty cylinders
    const found = emptyCylinders.find(c => c.qrCode === code || c.cylinderNo === code);
    
    if (found) {
      setScannedIds(prev => [found.id, ...prev]);
      setInputValue("");
      return;
    }

    // If not found locally, ask server (it might be RETURN_REQUESTED or just added)
    setIsProcessing(true);
    try {
      const res = await scanCylinderForRefill(code);
      if (res.success && res.cylinder) {
        setUnexpectedCylinders(prev => [res.cylinder, ...prev]);
        setScannedIds(prev => [res.cylinder.id, ...prev]);
      } else {
        alert(res.message || "ไม่พบถังใบนี้ หรือไม่ได้อยู่ในสถานะที่ส่งบรรจุได้");
      }
    } catch (e) {
      alert("เกิดข้อผิดพลาดในการตรวจสอบ");
    } finally {
      setIsProcessing(false);
      setInputValue("");
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const toggleCylinder = (id: string) => {
    setScannedIds(prev => 
      prev.includes(id) 
        ? prev.filter(scannedId => scannedId !== id)
        : [id, ...prev]
    );
    if (inputRef.current) inputRef.current.focus();
  };

  const handleSubmitBatch = async () => {
    if (scannedIds.length === 0) return;
    setIsSubmitting(true);
    try {
      await createRefillBatchAction(scannedIds);
    } catch (e) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      setIsSubmitting(false);
    }
  };

  // Group empty cylinders into scanned and unscanned for display
  const scannedExpectedList = emptyCylinders.filter(c => scannedIds.includes(c.id));
  const unscannedExpectedList = emptyCylinders.filter(c => !scannedIds.includes(c.id));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Scanner Input */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex flex-col">
          <label className="block text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <ScanLine className="h-5 w-5" /> ยิงบาร์โค้ดที่ถังเปล่า
          </label>
          <form onSubmit={handleScan}>
            <div className="relative mb-4">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isProcessing || isSubmitting}
                className="w-full rounded-lg border-2 border-primary/50 px-4 py-8 text-center text-xl tracking-widest focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 bg-primary/5 placeholder:text-gray-400 placeholder:text-base placeholder:tracking-normal transition-all"
                placeholder="ให้ Cursor อยู่ที่นี่..."
              />
              {isProcessing && (
                <div className="absolute inset-y-0 right-4 flex items-center">
                  <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
            <button type="submit" className="hidden">Submit</button>
          </form>

          <div className="bg-surface rounded-lg p-4 flex flex-col items-center justify-center text-center h-24">
            <div className="text-gray-400 flex flex-col items-center gap-2">
              <ScanLine className="h-6 w-6 opacity-50" />
              <p className="text-sm">ระบบจะเช็คถังเข้าในรายการทางขวาอัตโนมัติ</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border shadow-sm p-4">
          <button
            onClick={handleSubmitBatch}
            disabled={scannedIds.length === 0 || isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "กำลังบันทึก..." : `บันทึกสร้างรอบส่งบรรจุ (${scannedIds.length} ใบ)`}
          </button>
        </div>
      </div>

      {/* Right Column: List */}
      <div className="lg:col-span-2">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-border h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-primary">รายการถังเปล่าทั้งหมด</h2>
            <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
              เลือกแล้ว {scannedIds.length} ใบ
            </span>
          </div>

          <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50 p-4" style={{ minHeight: '500px', maxHeight: '70vh' }}>
            <div className="space-y-6">
              
              {/* Scanned/Selected Cylinders */}
              {(scannedExpectedList.length > 0 || unexpectedCylinders.length > 0) && (
                <div>
                  <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    เตรียมส่งบรรจุ ({scannedIds.length} ใบ)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Expected & Scanned */}
                    {scannedExpectedList.map((cyl: any) => (
                      <div 
                        key={cyl.id} 
                        onClick={() => toggleCylinder(cyl.id)}
                        className="p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between bg-green-50 border-green-300 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center border bg-green-500 border-green-500 text-white">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-green-800">{cyl.cylinderNo}</div>
                            <div className="text-xs text-green-700">{cyl.product?.name || "ไม่ระบุประเภท"}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Unexpected but Scanned */}
                    {unexpectedCylinders.map((cyl: any) => (
                      <div 
                        key={cyl.id} 
                        onClick={() => toggleCylinder(cyl.id)}
                        className="p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between bg-amber-50 border-amber-300 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center border bg-amber-500 border-amber-500 text-white">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-amber-800">{cyl.cylinderNo}</div>
                            <div className="text-xs text-amber-700">พบเพิ่มเติมจากสแกน</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unscanned/Empty Cylinders */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3 border-t border-gray-200 pt-4">
                  ถังเปล่าที่ยังไม่ได้เลือก ({unscannedExpectedList.length} ใบ)
                </h3>
                {unscannedExpectedList.length === 0 ? (
                  <div className="text-center p-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-500">
                    ไม่มีถังเปล่าคงเหลือในคลัง
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {unscannedExpectedList.map((cyl: any) => (
                      <div 
                        key={cyl.id} 
                        onClick={() => toggleCylinder(cyl.id)}
                        className="p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between bg-white border-gray-200 hover:border-gray-400"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center border border-gray-300 text-transparent">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-800">{cyl.cylinderNo}</div>
                            <div className="text-xs text-gray-500">{cyl.product?.name || "ไม่ระบุประเภท"}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
