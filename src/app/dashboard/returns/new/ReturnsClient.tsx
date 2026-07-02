"use client";

import { useState, useRef, useEffect } from "react";
import { RotateCcw, Search, Trash2, Printer, Plus, CheckCircle2 } from "lucide-react";
import { processReturnReceipt } from "../actions";

export default function ReturnsClient({ customers, withCustomerCylinders = [], currentUser, vehicles = [] }: any) {
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerQuery, setCustomerQuery] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [cylinderInput, setCylinderInput] = useState("");
  const [scannedCylinders, setScannedCylinders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Filter customers for dropdown
  const filteredCustomers = customers.filter((c: any) => 
    c.name.toLowerCase().includes(customerQuery.toLowerCase()) || 
    (c.customerCode && c.customerCode.toLowerCase().includes(customerQuery.toLowerCase()))
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCustomer = (c: any) => {
    setSelectedCustomerId(c.id);
    setCustomerQuery(c.name);
    setShowCustomerDropdown(false);
  };

  const handleCustomerQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerQuery(e.target.value);
    setSelectedCustomerId(""); // Reset selected ID if they type
    setShowCustomerDropdown(true);
  };

  // Expected cylinders for the selected customer
  const expectedCylinders = withCustomerCylinders.filter((c: any) => c.currentCustomerId === selectedCustomerId);
  
  // Categorize scanned cylinders
  const scannedExpected = expectedCylinders.filter((c: any) => scannedCylinders.includes(c.cylinderNo));
  const scannedUnexpected = scannedCylinders.filter((no: string) => !expectedCylinders.find((c: any) => c.cylinderNo === no));

  const handleAddCylinder = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const input = cylinderInput.trim();
    if (!input) return;
    
    // Match against ALL withCustomerCylinders to resolve qrCode to cylinderNo
    const matched = withCustomerCylinders.find((c: any) => c.cylinderNo === input || c.qrCode === input);
    const normalizedInput = matched ? matched.cylinderNo : input;
    
    // Check if already scanned
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
  
  const toggleExpectedCylinder = (no: string) => {
    if (scannedCylinders.includes(no)) {
      removeCylinder(no);
    } else {
      setScannedCylinders([...scannedCylinders, no]);
    }
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
      await processReturnReceipt(selectedCustomerId, currentUser?.id || null, selectedVehicleId || null, scannedCylinders);
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
            <div className="relative" ref={wrapperRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ค้นหาลูกค้า / รหัสลูกค้า <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={customerQuery}
                onChange={handleCustomerQueryChange}
                onFocus={() => setShowCustomerDropdown(true)}
                placeholder="พิมพ์ชื่อหรือรหัสลูกค้า..." 
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-primary focus:border-primary outline-none"
              />
              
              {showCustomerDropdown && customerQuery.length > 0 && filteredCustomers.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredCustomers.map((c: any) => (
                    <li 
                      key={c.id} 
                      onClick={() => handleSelectCustomer(c)}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                    >
                      <div>
                        <span className="font-medium text-gray-800">{c.name}</span>
                      </div>
                      {c.customerCode && <span className="text-xs text-gray-400">{c.customerCode}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ทะเบียนรถที่รับคืน
              </label>
              <select 
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-primary focus:border-primary outline-none"
              >
                <option value="">-- ไม่ระบุ --</option>
                {vehicles.map((v: any) => (
                  <option key={v.id} value={v.id}>
                    {v.registration} {v.description ? `(${v.description})` : ""}
                  </option>
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
                  className="flex-1 rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-primary focus:border-primary outline-none"
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
            <h2 className="text-lg font-bold text-primary">รายการถังรับคืน ({scannedCylinders.length} ใบ)</h2>
            <button
              onClick={handleSubmit}
              disabled={scannedCylinders.length === 0 || !selectedCustomerId || isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="h-4 w-4" /> 
              {isLoading ? "กำลังประมวลผล..." : "ยืนยันและพิมพ์ใบรับ"}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50 p-4" style={{ minHeight: '400px' }}>
            {!selectedCustomerId ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                <Search className="h-10 w-10 mb-2 opacity-20" />
                <span>กรุณาเลือกลูกค้าเพื่อดูรายการถังที่ครอบครอง</span>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Expected Cylinders Section */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-700">
                      ถังที่อยู่กับลูกค้า ({scannedExpected.length}/{expectedCylinders.length})
                    </h3>
                  </div>
                  
                  {expectedCylinders.length === 0 ? (
                    <div className="text-center p-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-500">
                      ไม่พบประวัติถังค้างกับลูกค้ารายนี้
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {expectedCylinders.map((cyl: any) => {
                        const isScanned = scannedCylinders.includes(cyl.cylinderNo);
                        return (
                          <div 
                            key={cyl.cylinderNo} 
                            onClick={() => toggleExpectedCylinder(cyl.cylinderNo)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                              isScanned 
                                ? "bg-green-50 border-green-200 shadow-sm" 
                                : "bg-white border-gray-200 hover:border-green-300"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                                isScanned ? "bg-green-500 border-green-500 text-white" : "border-gray-300 text-transparent"
                              }`}>
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                              <div>
                                <div className={`font-bold ${isScanned ? "text-green-800" : "text-gray-800"}`}>
                                  {cyl.cylinderNo}
                                </div>
                                <div className="text-xs text-gray-500">{cyl.product?.name || "ไม่ระบุประเภท"}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Unexpected Cylinders Section */}
                {scannedUnexpected.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="font-semibold text-amber-600 mb-3 flex items-center gap-2">
                      ถังอื่นๆ ที่สแกนเพิ่มเติม ({scannedUnexpected.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {scannedUnexpected.map((no) => (
                        <div key={no} className="bg-white p-3 rounded-lg border border-amber-200 flex justify-between items-center shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center bg-amber-100 text-amber-600">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-gray-800">{no}</span>
                          </div>
                          <button
                            onClick={() => removeCylinder(no)}
                            className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                            title="ลบออก"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
