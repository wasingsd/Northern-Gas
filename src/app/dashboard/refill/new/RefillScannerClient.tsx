"use client";

import { useState, useRef, useEffect } from "react";
import { ScanLine, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { scanCylinderForRefill, createRefillBatchAction } from "../actions";
import { useRouter } from "next/navigation";

export default function RefillScannerClient() {
  const [inputValue, setInputValue] = useState("");
  const [message, setMessage] = useState<{ text: string, type: "success" | "error" | "" }>({ text: "", type: "" });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scannedCylinders, setScannedCylinders] = useState<any[]>([]);
  const router = useRouter();
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = inputValue.trim();
    if (!code) return;

    if (scannedCylinders.some(c => c.qrCode === code)) {
      setMessage({ text: "ถังใบนี้ถูกสแกนไปแล้วในลอตนี้", type: "error" });
      setInputValue("");
      return;
    }

    setIsProcessing(true);
    setMessage({ text: "กำลังตรวจสอบ...", type: "" });

    try {
      const res = await scanCylinderForRefill(code);
      if (res.success && res.cylinder) {
        setScannedCylinders([res.cylinder, ...scannedCylinders]);
        setMessage({ text: `สแกนสำเร็จ: เพิ่มถัง ${res.cylinder.cylinderNo} แล้ว`, type: "success" });
      } else {
        setMessage({ text: res.message || "เกิดข้อผิดพลาด", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "เกิดข้อผิดพลาดในการเชื่อมต่อ", type: "error" });
    } finally {
      setIsProcessing(false);
      setInputValue("");
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const removeCylinder = (id: string) => {
    setScannedCylinders(scannedCylinders.filter(c => c.id !== id));
    if (inputRef.current) inputRef.current.focus();
  };

  const handleSubmitBatch = async () => {
    if (scannedCylinders.length === 0) return;
    setIsSubmitting(true);
    try {
      await createRefillBatchAction(scannedCylinders.map(c => c.id));
      // redirect handled in action
    } catch (e) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Scanner Input */}
      <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex flex-col space-y-6">
        <div>
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
                placeholder="ให้ Cursor อยู่ที่นี่ แล้วยิงสแกนเนอร์"
              />
              {isProcessing && (
                <div className="absolute inset-y-0 right-4 flex items-center">
                  <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
            <button type="submit" className="hidden">Submit</button>
          </form>

          <div className="bg-surface rounded-lg p-4 flex flex-col items-center justify-center text-center h-32">
            {message.type === "success" && (
              <div className="text-green-600 flex flex-col items-center gap-2">
                <CheckCircle2 className="h-8 w-8" />
                <p className="font-medium text-sm">{message.text}</p>
              </div>
            )}
            {message.type === "error" && (
              <div className="text-red-600 flex flex-col items-center gap-2">
                <XCircle className="h-8 w-8" />
                <p className="font-medium text-sm">{message.text}</p>
              </div>
            )}
            {!message.type && (
              <div className="text-gray-400 flex flex-col items-center gap-2">
                <ScanLine className="h-8 w-8 opacity-50" />
                <p className="text-sm">รอรับข้อมูลจากเครื่องสแกน...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scanned List */}
      <div className="bg-white rounded-xl border border-border shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border bg-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-foreground">รายการถังที่สแกนแล้ว</h3>
          <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
            {scannedCylinders.length} ใบ
          </span>
        </div>
        
        <div className="flex-1 overflow-auto p-4 max-h-[400px]">
          {scannedCylinders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
              <ScanLine className="h-12 w-12 opacity-20 mb-3" />
              <p className="text-sm">ยังไม่มีถังในรายการ</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {scannedCylinders.map((cyl, i) => (
                <li key={cyl.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-white shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">{scannedCylinders.length - i}.</span>
                    <div>
                      <p className="text-sm font-bold text-foreground">{cyl.cylinderNo}</p>
                      <p className="text-xs text-gray-500">QR: {cyl.qrCode}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeCylinder(cyl.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 border-t border-border bg-gray-50">
          <button
            onClick={handleSubmitBatch}
            disabled={scannedCylinders.length === 0 || isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "กำลังบันทึก..." : "บันทึกสร้างรอบส่งบรรจุ"}
          </button>
        </div>
      </div>
    </div>
  );
}
