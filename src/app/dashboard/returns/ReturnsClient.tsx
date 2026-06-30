"use client";

import { useState } from "react";
import { RotateCcw, Search, Trash2, Printer, Plus } from "lucide-react";
import { processReturnReceipt } from "./actions";

export default function ReturnsClient({ customers, currentUser }: any) {
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [cylinderInput, setCylinderInput] = useState("");
  const [scannedCylinders, setScannedCylinders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddCylinder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cylinderInput.trim()) return;
    
    // Check if already scanned
    if (scannedCylinders.includes(cylinderInput.trim())) {
      setError("หมายเลขถังนี้ถูกสแกนแล้ว");
      return;
    }

    setScannedCylinders([...scannedCylinders, cylinderInput.trim()]);
    setCylinderInput("");
    setError("");
  };

  const removeCylinder = (index: number) => {
    const newScanned = [...scannedCylinders];
    newScanned.splice(index, 1);
    setScannedCylinders(newScanned);
  };

  const handleSubmit = async () => {
    if (!selectedCustomerId) {
      setError("กรุณาเลือกลูกค้าที่รับถังคืน");
      return;
    }
    if (scannedCylinders.length === 0) {
      setError("กรุณาสแกนถังอย่างน้อย 1 ใบ");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await processReturnReceipt(selectedCustomerId, currentUser?.id || null, scannedCylinders);
      // It will redirect on success
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการบันทึกรับถัง");
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Input Form */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
          <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
            <RotateCcw className="h-5 w-5" /> รับถังเปล่าคืนเข้าคลัง
          </h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เลือกลูกค้าที่ส่งคืน <span className="text-red-500">*</span>
              </label>
              <select 
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-primary focus:border-primary bg-gray-50"
              >
                <option value="">-- เลือกลูกค้า --</option>
                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name} {c.customerCode ? `(${c.customerCode})` : ""}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                สแกน QR / กรอกเลขถัง
              </label>
              <form onSubmit={handleAddCylinder} className="flex gap-2">
                <input
                  type="text"
                  value={cylinderInput}
                  onChange={(e) => setCylinderInput(e.target.value)}
                  placeholder="เช่น CYL-001"
                  className="flex-1 rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-primary focus:border-primary"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-primary text-white p-2.5 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Scanned List */}
      <div className="lg:col-span-2">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-border h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-primary">รายการถังที่สแกน ({scannedCylinders.length} ใบ)</h2>
            <button
              onClick={handleSubmit}
              disabled={scannedCylinders.length === 0 || !selectedCustomerId || isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="h-4 w-4" /> 
              {isLoading ? "กำลังประมวลผล..." : "ยืนยันและพิมพ์ใบรับ"}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50 p-2" style={{ minHeight: '300px' }}>
            {scannedCylinders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                <Search className="h-10 w-10 mb-2 opacity-20" />
                <span>ยังไม่มีการสแกนถัง</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {scannedCylinders.map((cyl, idx) => (
                  <div key={idx} className="bg-white p-3 rounded border border-gray-200 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 font-medium text-xs">{idx + 1}.</span>
                      <span className="font-bold text-gray-800">{cyl}</span>
                    </div>
                    <button
                      onClick={() => removeCylinder(idx)}
                      className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                      title="ลบออก"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
