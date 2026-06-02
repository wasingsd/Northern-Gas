"use client";

import { useState, useRef, useEffect } from "react";
import { ScanLine, CheckCircle2, XCircle } from "lucide-react";
import { processScanAction } from "./actions";

export default function ScannerClient({ customers }: { customers: any[] }) {
  const [mode, setMode] = useState("RECEIVE_EMPTY");
  const [customerId, setCustomerId] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [message, setMessage] = useState<{ text: string, type: "success" | "error" | "" }>({ text: "", type: "" });
  const [isProcessing, setIsProcessing] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input when mode changes to keep it ready for the scanner gun
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (mode === "DELIVER" && !customerId) {
      setMessage({ text: "กรุณาเลือกลูกค้าก่อนทำการสแกนส่งถัง", type: "error" });
      return;
    }

    setIsProcessing(true);
    setMessage({ text: "กำลังประมวลผล...", type: "" });

    try {
      const res = await processScanAction(inputValue.trim(), mode, customerId);
      if (res.success) {
        setMessage({ text: res.message, type: "success" });
      } else {
        setMessage({ text: res.message, type: "error" });
      }
    } catch (error) {
      setMessage({ text: "เกิดข้อผิดพลาดในการเชื่อมต่อ", type: "error" });
    } finally {
      setIsProcessing(false);
      setInputValue(""); // Clear input for next scan
      if (inputRef.current) inputRef.current.focus();
    }
  };

  return (
    <div className="max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Controls */}
      <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-bold text-foreground mb-3">1. เลือกโหมดการทำงาน</label>
          <div className="grid grid-cols-1 gap-2">
            <button 
              type="button"
              onClick={() => setMode("RECEIVE_EMPTY")}
              className={`p-3 rounded-lg border text-left flex flex-col transition-colors ${mode === "RECEIVE_EMPTY" ? "bg-yellow-50 border-yellow-500 text-yellow-800" : "bg-white border-border text-gray-600 hover:bg-gray-50"}`}
            >
              <span className="font-bold text-sm">📥 รับถังเปล่าคืน</span>
              <span className="text-xs opacity-80 mt-1">รับถังจากรถส่งกลับเข้าคลัง</span>
            </button>
            <button 
              type="button"
              onClick={() => setMode("READY")}
              className={`p-3 rounded-lg border text-left flex flex-col transition-colors ${mode === "READY" ? "bg-green-50 border-green-500 text-green-800" : "bg-white border-border text-gray-600 hover:bg-gray-50"}`}
            >
              <span className="font-bold text-sm">✅ สแกนพร้อมขาย</span>
              <span className="text-xs opacity-80 mt-1">ถังตรวจสอบเสร็จแล้ว พร้อมส่งให้ลูกค้า</span>
            </button>
            <button 
              type="button"
              onClick={() => setMode("DELIVER")}
              className={`p-3 rounded-lg border text-left flex flex-col transition-colors ${mode === "DELIVER" ? "bg-blue-50 border-blue-500 text-blue-800" : "bg-white border-border text-gray-600 hover:bg-gray-50"}`}
            >
              <span className="font-bold text-sm">🚚 สแกนส่งลูกค้า</span>
              <span className="text-xs opacity-80 mt-1">ผูกถังใบนี้เข้ากับลูกค้ารายใดรายหนึ่ง</span>
            </button>
          </div>
        </div>

        {mode === "DELIVER" && (
          <div className="pt-4 border-t border-border">
            <label className="block text-sm font-bold text-foreground mb-2">2. เลือกลูกค้าที่จะรับถัง</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">-- เลือกลูกค้า --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Scanner Input */}
      <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex flex-col">
        <label className="block text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <ScanBarcodeIcon /> 
          {mode === "DELIVER" ? "3. ยิงบาร์โค้ดที่ถังแก๊ส" : "2. ยิงบาร์โค้ดที่ถังแก๊ส"}
        </label>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="relative mb-4">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isProcessing}
              autoFocus
              className="w-full rounded-lg border-2 border-primary/50 px-4 py-8 text-center text-xl tracking-widest focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 bg-primary/5 placeholder:text-gray-400 placeholder:text-base placeholder:tracking-normal transition-all"
              placeholder="ให้ Cursor อยู่ที่นี่ แล้วยิงสแกนเนอร์"
            />
            {isProcessing && (
              <div className="absolute inset-y-0 right-4 flex items-center">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
          
          <button
            type="submit"
            className="hidden" // Hidden because scanner gun acts as "Enter" key press
          >Submit</button>

          <div className="flex-1 bg-surface rounded-lg p-4 flex flex-col items-center justify-center text-center">
            {message.type === "success" && (
              <div className="text-green-600 flex flex-col items-center gap-2">
                <CheckCircle2 className="h-10 w-10" />
                <p className="font-medium text-sm">{message.text}</p>
              </div>
            )}
            {message.type === "error" && (
              <div className="text-red-600 flex flex-col items-center gap-2">
                <XCircle className="h-10 w-10" />
                <p className="font-medium text-sm">{message.text}</p>
              </div>
            )}
            {!message.type && (
              <div className="text-gray-400 flex flex-col items-center gap-2">
                <ScanLine className="h-10 w-10 opacity-50" />
                <p className="text-sm">รอรับข้อมูลจากเครื่องสแกน...</p>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function ScanBarcodeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 8v8"/><path d="M11 8v8"/><path d="M17 8v8"/></svg>
  )
}
